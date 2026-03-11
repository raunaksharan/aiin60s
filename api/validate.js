// api/validate.js — Server-side passcode validation
// Keeps passcode logic off the client.
//
// Required env vars:
//   PASSCODE_SECRET — same secret used in webhook.js

const crypto = require('crypto');

// Hardcoded codes for manual distribution (e.g. team, testers)
const STATIC_PASSCODES = [
  'NOTIONAI2024',
  'EARLYADOPTER',
];

function isValidHmacPasscode(code) {
  if (!code.startsWith('ND') || code.length !== 14) return false;
  const prefix = code.substring(2, 8);
  const providedCheck = code.substring(8, 14);
  const expectedCheck = crypto
    .createHmac('sha256', process.env.PASSCODE_SECRET)
    .update(prefix)
    .digest('hex')
    .substring(0, 6)
    .toUpperCase();
  return providedCheck === expectedCheck;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false });
  }

  const normalized = code.toUpperCase().trim();
  const valid = STATIC_PASSCODES.includes(normalized) || isValidHmacPasscode(normalized);

  return res.status(200).json({ valid });
};
