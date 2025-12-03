import chalk from 'chalk';
import ora from 'ora';
import { OpenRouterClient } from '../services/openrouter.js';
import { ContextDetector } from '../services/context.js';
import { CommandExecutor } from '../services/executor.js';
import { confirmExecution } from '../utils/prompts.js';
import { OpenRouterMessage, CommandSuggestion } from '../types/index.js';

export async function runCommand(
  intent: string,
  client: OpenRouterClient,
  contextDetector: ContextDetector,
  executor: CommandExecutor,
  autoYes: boolean = false
) {
  const spinner = ora('Analyzing request...').start();

  try {
    const context = contextDetector.getContextForPrompt();
    
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a command-line assistant that generates shell commands. ${context}
        
Your task is to generate a command that accomplishes the user's intent. Respond ONLY with a JSON object in this exact format:
{
  "command": "the actual command to run",
  "explanation": "brief explanation of what the command does"
}

Important:
- Generate commands appropriate for the user's OS and shell
- Use proper syntax for ${contextDetector.getContext().shell}
- Keep commands safe and avoid destructive operations when possible
- If the task requires multiple commands, combine them with && or ; as appropriate
- Do not include any text outside the JSON object`,
      },
      {
        role: 'user',
        content: intent,
      },
    ];

    spinner.text = 'Generating command...';
    
    const response = await client.chat(messages);
    
    spinner.stop();

    // Parse the JSON response
    let suggestion: CommandSuggestion;
    try {
      const parsed = JSON.parse(response.trim());
      suggestion = {
        command: parsed.command,
        explanation: parsed.explanation,
        dangerous: executor.isDangerous(parsed.command),
        requiresConfirmation: executor.requiresWarning(parsed.command) || executor.isDangerous(parsed.command),
      };
    } catch (parseError) {
      // Fallback: try to extract command from response
      console.log(chalk.yellow('\n⚠️  Could not parse structured response. Raw response:\n'));
      console.log(response);
      return;
    }

    // Validate command
    const validation = executor.validateCommand(suggestion.command);
    if (!validation.valid) {
      console.error(chalk.red('\n❌ Command validation failed:'), validation.reason);
      return;
    }

    // Display the command
    console.log(chalk.cyan('\n📝 Generated Command:\n'));
    console.log(chalk.white('  ' + suggestion.command));
    console.log(chalk.gray('\n💬 Explanation:'));
    console.log(chalk.gray('  ' + suggestion.explanation));
    
    if (suggestion.dangerous) {
      console.log(chalk.red('\n⚠️  WARNING: This command is potentially DANGEROUS!'));
    } else if (suggestion.requiresConfirmation) {
      console.log(chalk.yellow('\n⚠️  Caution: This command may modify or delete files.'));
    }

    // Ask for confirmation unless auto-yes is enabled
    let shouldExecute = autoYes;
    if (!autoYes) {
      console.log();
      shouldExecute = await confirmExecution(
        suggestion.command,
        suggestion.explanation,
        suggestion.dangerous
      );
    }

    if (!shouldExecute) {
      console.log(chalk.yellow('\n❌ Execution cancelled.'));
      return;
    }

    // Execute the command
    console.log(chalk.cyan('\n🚀 Executing...\n'));
    
    const result = await executor.executeWithOutput(
      suggestion.command,
      (data) => process.stdout.write(data)
    );

    console.log();
    
    if (result.success) {
      console.log(chalk.green('✅ Command completed successfully!'));
      if (result.output && !result.output.includes('Command executed successfully')) {
        console.log(chalk.gray('\nOutput:'));
        console.log(result.output);
      }
    } else {
      console.log(chalk.red('❌ Command failed with exit code ' + result.exitCode));
      if (result.error) {
        console.log(chalk.red('\nError:'));
        console.log(result.error);
      }
    }
  } catch (error) {
    spinner.stop();
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}
