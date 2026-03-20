const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

module.exports = {
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  getRequiredEnv
};
