import chalk from 'chalk';
import { OpenRouterClient } from '../services/openrouter.js';
import { getConfig } from '../utils/config.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

export async function diagnoseCommand(): Promise<void> {
  console.log(chalk.cyan('\n🔍 CodeCraft Diagnostics\n'));

  try {
    // Check environment file locations
    console.log(chalk.bold('0. Environment File Detection:'));
    const cwd = process.cwd();
    const envPath = resolve(cwd, '.env');
    const envExists = existsSync(envPath);
    console.log(chalk.gray(`  - Current working directory: ${cwd}`));
    console.log(chalk.gray(`  - Looking for .env at: ${envPath}`));
    console.log(envExists 
      ? chalk.green(`  ✓ .env file found`) 
      : chalk.red(`  ✗ .env file NOT found at this location`));
    
    // Check if env var is set directly (not from .env)
    const envSource = process.env.OPENROUTER_API_KEY ? 'set' : 'not set';
    console.log(chalk.gray(`  - OPENROUTER_API_KEY in process.env: ${envSource}`));

    // Check config
    console.log(chalk.bold('\n1. Configuration:'));
    const config = getConfig();
    console.log(chalk.green('  ✓ API key loaded'));
    console.log(chalk.gray(`  - Key length: ${config.apiKey.length} characters`));
    console.log(chalk.gray(`  - Key prefix: ${config.apiKey.substring(0, 15)}...`));
    console.log(chalk.gray(`  - Key suffix: ...${config.apiKey.substring(config.apiKey.length - 8)}`));
    console.log(chalk.gray(`  - Default model: ${config.model}`));
    
    // Check for multiple .env locations
    const homeEnv = resolve(process.env.HOME || process.env.USERPROFILE || '', '.env');
    if (existsSync(homeEnv)) {
      console.log(chalk.yellow(`  ⚠ Also found .env at: ${homeEnv} (may conflict)`));
    }
    
    // Test models endpoint
    console.log(chalk.bold('\n2. Testing /models endpoint:'));
    const client = new OpenRouterClient(config);
    const modelsResponse = await client.listModels();
    console.log(chalk.green(`  ✓ Models endpoint works! Found ${modelsResponse.data.length} models`));

    // Test auth/key endpoint to verify API key
    console.log(chalk.bold('\n3. Testing /auth/key endpoint (API key validation):'));
    try {
      const axios = await import('axios');
      const authResponse = await axios.default.get('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });
      console.log(chalk.green('  ✓ API key is valid!'));
      console.log(chalk.gray(`  - Label: ${authResponse.data.data?.label || 'N/A'}`));
      console.log(chalk.gray(`  - Limit: ${authResponse.data.data?.limit ?? 'Unlimited'}`));
      console.log(chalk.gray(`  - Usage: ${authResponse.data.data?.usage ?? 'N/A'}`));
    } catch (authError: unknown) {
      if (authError && typeof authError === 'object' && 'response' in authError) {
        const axiosError = authError as { response?: { status?: number; data?: unknown } };
        console.log(chalk.red(`  ✗ API key validation failed!`));
        console.log(chalk.red(`  - Status: ${axiosError.response?.status}`));
        console.log(chalk.red(`  - Response: ${JSON.stringify(axiosError.response?.data)}`));
      } else {
        throw authError;
      }
    }

    // Test chat endpoint with minimal request
    console.log(chalk.bold('\n4. Testing /chat/completions endpoint:'));
    const testResponse = await client.chat([
      { role: 'user', content: 'Say "OK"' }
    ], 'openai/gpt-4o-mini');
    console.log(chalk.green('  ✓ Chat endpoint works!'));
    console.log(chalk.gray(`  - Response: ${testResponse.substring(0, 50)}...`));

    console.log(chalk.bold.green('\n✓ All tests passed! Your setup is working correctly.\n'));
  } catch (error: unknown) {
    console.log(chalk.bold.red('\n✗ Diagnostic failed:\n'));
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    
    // Show more details for debugging
    if (error && typeof error === 'object' && 'cause' in error) {
      console.log(chalk.gray(`\nCause: ${JSON.stringify(error.cause)}`));
    }
    
    // Check if API key has whitespace or encoding issues
    const config = getConfig();
    if (config.apiKey !== config.apiKey.trim()) {
      console.log(chalk.yellow('\n⚠ Warning: Your API key has leading/trailing whitespace!'));
    }
    if (config.apiKey.includes('"') || config.apiKey.includes("'")) {
      console.log(chalk.yellow('\n⚠ Warning: Your API key contains quote characters!'));
    }
    if (config.apiKey.includes(' ')) {
      console.log(chalk.yellow('\n⚠ Warning: Your API key contains spaces!'));
    }
    
    console.log();
    process.exit(1);
  }
}
