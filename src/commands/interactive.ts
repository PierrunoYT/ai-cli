import chalk from 'chalk';
import ora from 'ora';
import { OpenRouterClient } from '../services/openrouter.js';
import { ContextDetector } from '../services/context.js';
import { getChatInput } from '../utils/prompts.js';
import { OpenRouterMessage } from '../types/index.js';

export async function interactiveCommand(client: OpenRouterClient, contextDetector: ContextDetector) {
  console.log(chalk.cyan('\n💬 Interactive Chat Mode'));
  console.log(chalk.gray('Type your questions or commands. Type "quit" or "exit" to leave.\n'));

  const context = contextDetector.getContextForPrompt();
  const messages: OpenRouterMessage[] = [
    {
      role: 'system',
      content: `You are a helpful command-line assistant in interactive chat mode. ${context}
      
Help the user with:
- Answering questions about commands and tools
- Explaining how to accomplish tasks
- Suggesting appropriate commands
- Explaining command syntax and options

Keep responses concise but informative. When suggesting commands, explain what they do.`,
    },
  ];

  let conversationCount = 0;

  while (true) {
    try {
      const input = await getChatInput(chalk.green('You'));
      
      if (!input || input.trim().length === 0) {
        continue;
      }

      const trimmedInput = input.trim().toLowerCase();
      if (trimmedInput === 'quit' || trimmedInput === 'exit') {
        console.log(chalk.cyan('\n👋 Goodbye!\n'));
        break;
      }

      messages.push({
        role: 'user',
        content: input,
      });

      const spinner = ora('Thinking...').start();

      try {
        let response = '';
        
        // Use streaming for better UX
        spinner.stop();
        process.stdout.write(chalk.cyan('Assistant: '));
        
        response = await client.streamChat(messages, undefined, (chunk) => {
          process.stdout.write(chunk);
        });
        
        console.log('\n');

        messages.push({
          role: 'assistant',
          content: response,
        });

        conversationCount++;

        // Keep conversation history manageable (last 10 exchanges)
        if (messages.length > 21) { // 1 system + 20 messages (10 exchanges)
          messages.splice(1, 2); // Remove oldest user-assistant pair
        }
      } catch (error) {
        spinner.stop();
        console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
        console.log(chalk.yellow('Continuing conversation...\n'));
        // Remove the failed user message
        messages.pop();
      }
    } catch (error) {
      // Handle Ctrl+C or other interruptions
      console.log(chalk.cyan('\n\n👋 Goodbye!\n'));
      break;
    }
  }
}
