// config.js
const CONFIG = {
  // Set GROQ_API_KEY as an environment variable in Vercel.
  // For local dev, replace with your key from console.groq.com
  GROQ_API_KEY: 'YOUR_GROQ_API_KEY',

  VALID_PASSCODES: [
    'NOTIONAI2024',
    'EARLYADOPTER',
    // Add codes from Gumroad purchases
  ],

  REDIRECT_URLS: {
    forecasting: 'https://notiondemandforecast.info',
    ml: 'https://notiondemandml.info'
  },

  CTA_LINKS: {
    calendly: 'https://calendly.com/notiondemand/strategy',
    email: 'team@notiondemand.com',
    gumroad: 'https://notiondemand.gumroad.com/l/ai-prompts'
  },

  SESSION_DURATION_DAYS: 30
};
