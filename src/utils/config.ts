import dotenv from 'dotenv';
import { Config } from '../types/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getConfig(): Config {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Please create a .env file with your API key.\n' +
      'Get your API key from https://openrouter.ai/keys'
    );
  }

  const config: Config = {
    apiKey,
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    siteUrl: process.env.CODECRAFT_SITE_URL,
    siteName: process.env.CODECRAFT_SITE_NAME || 'CodeCraft CLI',
  };

  // Parse provider preferences from environment if available
  if (process.env.OPENROUTER_PROVIDER_ORDER) {
    config.provider = {
      order: process.env.OPENROUTER_PROVIDER_ORDER.split(',').map(p => p.trim()),
    };
  }

  if (process.env.OPENROUTER_ALLOW_FALLBACKS) {
    config.provider = config.provider || {};
    config.provider.allow_fallbacks = process.env.OPENROUTER_ALLOW_FALLBACKS === 'true';
  }

  if (process.env.OPENROUTER_REQUIRE_PARAMETERS) {
    config.provider = config.provider || {};
    config.provider.require_parameters = process.env.OPENROUTER_REQUIRE_PARAMETERS === 'true';
  }

  if (process.env.OPENROUTER_DATA_COLLECTION) {
    config.provider = config.provider || {};
    config.provider.data_collection = process.env.OPENROUTER_DATA_COLLECTION as 'allow' | 'deny';
  }

  // Parse temperature and max_tokens from environment
  if (process.env.OPENROUTER_TEMPERATURE) {
    config.temperature = parseFloat(process.env.OPENROUTER_TEMPERATURE);
  }

  if (process.env.OPENROUTER_MAX_TOKENS) {
    config.max_tokens = parseInt(process.env.OPENROUTER_MAX_TOKENS, 10);
  }

  return config;
}

export function validateConfig(): boolean {
  try {
    getConfig();
    return true;
  } catch (error) {
    return false;
  }
}
