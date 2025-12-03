import chalk from 'chalk';
import ora from 'ora';
import { OpenRouterClient } from '../services/openrouter.js';
import { ContextDetector } from '../services/context.js';
import { OpenRouterMessage } from '../types/index.js';

export async function askCommand(question: string, client: OpenRouterClient, contextDetector: ContextDetector) {
  const spinner = ora('Thinking...').start();

  try {
    const context = contextDetector.getContextForPrompt();
    
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a helpful command-line assistant. ${context} Provide clear, concise answers about commands and tools. When suggesting commands, explain what they do and any important flags or options.`,
      },
      {
        role: 'user',
        content: question,
      },
    ];

    spinner.text = 'Getting answer...';
    
    const response = await client.chat(messages);
    
    spinner.stop();
    
    console.log(chalk.cyan('\n💡 Answer:\n'));
    console.log(response);
    console.log();
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
