// api/webhook.js — Razorpay webhook handler
// Verifies payment, emails access code + login link via Resend.
//
// Required env vars:
//   RAZORPAY_WEBHOOK_SECRET  — from Razorpay Dashboard > Webhooks
//   RESEND_API_KEY           — from resend.com
//   FROM_EMAIL               — verified sender, e.g. noreply@notiondemand.com
//   SITE_URL                 — your live URL, e.g. https://aiin60s.vercel.app

const crypto = require('crypto');

const ACCESS_CODE = 'EARLYADOPTER';
const FB_PIXEL_ID = '1295631849076932';

async function sendFBPurchaseEvent(email, paymentId) {
  const accessToken = process.env.FB_CAPI_ACCESS_TOKEN;
  if (!accessToken) return;

  const hashedEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

  await fetch(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        event_id: paymentId,
        action_source: 'website',
        user_data: { em: [hashedEmail] },
        custom_data: { value: 99, currency: 'INR' }
      }],
      access_token: accessToken
    })
  });
}

async function sendAccessEmail(email, name) {
  const firstName = name ? name.split(' ')[0] : 'there';
  const loginUrl = (process.env.SITE_URL || 'https://aiin60s.vercel.app') + '/access.html';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL || 'NotionDemand <noreply@notiondemand.com>',
      to: [email],
      subject: '🔐 Your NotionDemand Access Code is here!',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem;">

          <h2 style="color: #1e293b; margin-bottom: 0.5rem;">Hey ${firstName}! You're in. 🎉</h2>
          <p style="color: #475569; margin-top: 0;">Your AI Automation Blueprint is ready. Here's everything you need:</p>

          <div style="background: #f1f5f9; border-radius: 10px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
            <p style="margin: 0 0 0.5rem; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Your Access Code</p>
            <p style="margin: 0 0 1.25rem; font-size: 2rem; font-weight: 800; letter-spacing: 0.15em; color: #2563eb;">${ACCESS_CODE}</p>
            <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 700; font-size: 1rem;">
              Login & Get My Prompts →
            </a>
          </div>

          <p style="color: #475569;"><strong>How it works:</strong></p>
          <ol style="color: #475569; line-height: 2;">
            <li>Click the button above (or go to <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a>)</li>
            <li>Enter your access code: <strong>${ACCESS_CODE}</strong></li>
            <li>Describe your business situation in 2–3 sentences</li>
            <li>Get 10 custom AI prompts + 5-agent blueprint with ROI — in 60 seconds</li>
          </ol>

          <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 1rem 1.25rem; border-radius: 0 8px 8px 0; margin: 1.5rem 0;">
            <p style="margin: 0; color: #1e40af; font-size: 0.9rem;"><strong>Want us to build the agents for you?</strong><br>Book a free strategy call and our team will deploy all 5 agents for your business in 1 week. <a href="https://calendly.com/team-notiondemand" style="color: #2563eb;">Book here →</a></p>
          </div>

          <p style="color: #475569; margin-top: 1.5rem; font-size: 0.9rem;">Questions? We're here — <a href="mailto:team@notiondemand.com" style="color: #2563eb;">team@notiondemand.com</a> or <a href="tel:+919082673098" style="color: #2563eb;">+91 9082673098</a></p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
          <p style="color: #94a3b8; font-size: 0.75rem; margin: 0;">© NotionDemand · You're receiving this because you purchased access.</p>
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

  if (event !== 'payment.captured') {
    return res.status(200).json({ status: 'ignored', event });
  }

  const payment = req.body.payload?.payment?.entity;
  if (!payment) {
    return res.status(400).json({ error: 'Missing payment entity' });
  }

  const { email } = payment;
  const name = payment.notes?.name || '';

  if (!email) {
    console.error('No email in payment:', payment.id);
    return res.status(400).json({ error: 'No email found in payment' });
  }

  try {
    await Promise.all([
      sendAccessEmail(email, name),
      sendFBPurchaseEvent(email, payment.id)
    ]);
    console.log(`Access email sent to ${email} for payment ${payment.id}`);
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
};
