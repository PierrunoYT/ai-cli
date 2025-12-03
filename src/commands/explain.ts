import chalk from 'chalk';
import ora from 'ora';
import { OpenRouterClient } from '../services/openrouter.js';
import { ContextDetector } from '../services/context.js';
import { CommandExecutor } from '../services/executor.js';
import { OpenRouterMessage } from '../types/index.js';

export async function explainCommand(
  command: string,
  client: OpenRouterClient,
  contextDetector: ContextDetector,
  executor: CommandExecutor
) {
  const spinner = ora('Analyzing command...').start();

  try {
    const context = contextDetector.getContextForPrompt();
    
    // Check if command is dangerous
    const isDangerous = executor.isDangerous(command);
    const requiresWarning = executor.requiresWarning(command);
    
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a command-line expert that explains shell commands. ${context}
        
Provide a detailed explanation of the command including:
1. Overall purpose
2. Breakdown of each part (command, flags, arguments)
3. What files or system resources it affects
4. Any potential risks or side effects
5. Common use cases

Be clear and educational. If the command is dangerous, explicitly warn about it.`,
      },
      {
        role: 'user',
        content: `Explain this command: ${command}`,
      },
    ];

    spinner.text = 'Getting explanation...';
    
    const response = await client.chat(messages);
    
    spinner.stop();
    
    // Display warnings if applicable
    if (isDangerous) {
      console.log(chalk.red('\n⚠️  DANGER: This command is EXTREMELY DANGEROUS!'));
      console.log(chalk.red('It could cause irreversible damage to your system.\n'));
    } else if (requiresWarning) {
      console.log(chalk.yellow('\n⚠️  CAUTION: This command may modify or delete files.\n'));
    }
    
    console.log(chalk.cyan('📖 Command Explanation:\n'));
    console.log(chalk.white('Command: ') + chalk.yellow(command));
    console.log();
    console.log(response);
    console.log();
    
    if (isDangerous || requiresWarning) {
      console.log(chalk.red('⚠️  Do NOT run this command unless you fully understand the consequences!'));
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
