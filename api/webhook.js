// api/webhook.js — Razorpay webhook handler
// Verifies payment, generates passcode, emails it via Resend.
//
// Required env vars:
//   RAZORPAY_WEBHOOK_SECRET  — from Razorpay Dashboard > Webhooks
//   PASSCODE_SECRET          — any random secret string
//   RESEND_API_KEY           — from resend.com
//   FROM_EMAIL               — verified sender, e.g. noreply@notiondemand.com

const crypto = require('crypto');

function generatePasscode(paymentId) {
  const secret = process.env.PASSCODE_SECRET;
  const prefix = crypto.createHmac('sha256', secret)
    .update(paymentId + '-prefix')
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  const check = crypto.createHmac('sha256', secret)
    .update(prefix)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  return 'ND' + prefix + check;
}

async function sendPasscodeEmail(email, passcode, name) {
  const firstName = name ? name.split(' ')[0] : 'there';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'NotionDemand <noreply@notiondemand.com>',
      to: [email],
      subject: '🔐 Your NotionDemand Access Code',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #1e293b;">Hey ${firstName}! Your access code is ready.</h2>
          <p style="color: #475569;">Here's your personal access code for the AI Prompt Generator:</p>

          <div style="background: #f1f5f9; border-radius: 10px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
            <p style="margin: 0 0 0.5rem; color: #64748b; font-size: 0.85rem;">YOUR ACCESS CODE</p>
            <p style="margin: 0; font-size: 1.75rem; font-weight: 800; letter-spacing: 0.1em; color: #2563eb;">${passcode}</p>
          </div>

          <p style="color: #475569;"><strong>How to use it:</strong></p>
          <ol style="color: #475569; line-height: 1.8;">
            <li>Go to your tool link</li>
            <li>Enter the code above</li>
            <li>Describe your business situation</li>
            <li>Get 10 custom AI prompts + 5-agent blueprint in 60 seconds</li>
          </ol>

          <p style="color: #475569; margin-top: 1.5rem;">Questions? Reply to this email or reach us at <a href="mailto:team@notiondemand.com" style="color: #2563eb;">team@notiondemand.com</a> or <a href="tel:+919082673098" style="color: #2563eb;">+91 9082673098</a>.</p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
          <p style="color: #94a3b8; font-size: 0.8rem;">© NotionDemand · You're receiving this because you purchased access.</p>
        </div>
      `
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Razorpay webhook signature
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body.event;

  // Only handle successful payments
  if (event !== 'payment.captured') {
    return res.status(200).json({ status: 'ignored', event });
  }

  const payment = req.body.payload?.payment?.entity;
  if (!payment) {
    return res.status(400).json({ error: 'Missing payment entity' });
  }

  const { id: paymentId, email, contact } = payment;
  const name = payment.notes?.name || payment.description || '';

  if (!email) {
    console.error('No email in payment:', paymentId);
    return res.status(400).json({ error: 'No email found in payment' });
  }

  try {
    const passcode = generatePasscode(paymentId);
    await sendPasscodeEmail(email, passcode, name);
    console.log(`Passcode sent to ${email} for payment ${paymentId}`);
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
};
