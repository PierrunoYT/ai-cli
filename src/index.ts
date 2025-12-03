#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { getConfig } from './utils/config.js';
import { OpenRouterClient } from './services/openrouter.js';
import { ContextDetector } from './services/context.js';
import { CommandExecutor } from './services/executor.js';
import { askCommand } from './commands/ask.js';
import { runCommand } from './commands/run.js';
import { explainCommand } from './commands/explain.js';
import { interactiveCommand } from './commands/interactive.js';
import { modelsCommand } from './commands/models.js';
import { diagnoseCommand } from './commands/diagnose.js';

const program = new Command();

program
  .name('codecraft')
  .description('AI-powered CLI assistant that helps you find and run commands')
  .version('0.3.0');

// Global options
program
  .option('-m, --model <model>', 'OpenRouter model to use (e.g., openai/gpt-4, anthropic/claude-3-sonnet)')
  .option('-v, --verbose', 'Enable verbose output');

// Ask command
program
  .command('ask <question>')
  .description('Ask a question about commands or tools')
  .action(async (question, options) => {
    try {
      const config = getConfig();
      const parentOptions = program.opts();
      
      if (parentOptions.model) {
        config.model = parentOptions.model;
      }

      const client = new OpenRouterClient(config);
      const contextDetector = new ContextDetector();

      await askCommand(question, client, contextDetector);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Run command
program
  .command('run <intent>')
  .description('Generate and execute a command based on natural language intent')
  .option('-y, --yes', 'Skip confirmation and execute automatically')
  .action(async (intent, options) => {
    try {
      const config = getConfig();
      const parentOptions = program.opts();
      
      if (parentOptions.model) {
        config.model = parentOptions.model;
      }

      const client = new OpenRouterClient(config);
      const contextDetector = new ContextDetector();
      const executor = new CommandExecutor();

      await runCommand(intent, client, contextDetector, executor, options.yes);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Explain command
program
  .command('explain <command>')
  .description('Explain what a command does without executing it')
  .action(async (command, options) => {
    try {
      const config = getConfig();
      const parentOptions = program.opts();
      
      if (parentOptions.model) {
        config.model = parentOptions.model;
      }

      const client = new OpenRouterClient(config);
      const contextDetector = new ContextDetector();
      const executor = new CommandExecutor();

      await explainCommand(command, client, contextDetector, executor);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Interactive/Chat command
program
  .command('chat')
  .alias('interactive')
  .description('Start an interactive chat session')
  .action(async (options) => {
    try {
      const config = getConfig();
      const parentOptions = program.opts();
      
      if (parentOptions.model) {
        config.model = parentOptions.model;
      }

      const client = new OpenRouterClient(config);
      const contextDetector = new ContextDetector();

      await interactiveCommand(client, contextDetector);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Context command (show system context)
program
  .command('context')
  .description('Display detected system context information')
  .action(() => {
    try {
      const contextDetector = new ContextDetector();
      console.log(chalk.cyan('\n🖥️  System Context:\n'));
      console.log(contextDetector.getContextString());
      console.log();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Models command (list available models)
program
  .command('models')
  .description('List available OpenRouter models')
  .option('--search <term>', 'Search models by name or ID')
  .option('--free', 'Show only free models')
  .option('--limit <number>', 'Limit number of results', parseInt)
  .option('--sort <type>', 'Sort by: name, price, or context')
  .action(async (options) => {
    try {
      const config = getConfig();
      const client = new OpenRouterClient(config);

      await modelsCommand(client, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Diagnose command (test API connection)
program
  .command('diagnose')
  .description('Run diagnostics to test API connection and configuration')
  .action(async () => {
    try {
      await diagnoseCommand();
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Show helpful message if no command provided
program.action(() => {
  console.log(chalk.cyan('\n🛠️  CodeCraft CLI Assistant\n'));
  console.log('AI-powered assistant to help you find and run commands.\n');
  console.log('Usage:');
  console.log('  codecraft ask <question>      - Ask about commands or tools');
  console.log('  codecraft run <intent>        - Generate and run a command');
  console.log('  codecraft explain <command>   - Explain what a command does');
  console.log('  codecraft chat                - Start interactive chat');
  console.log('  codecraft models              - List available AI models');
  console.log('  codecraft diagnose            - Test API connection');
  console.log('  codecraft context             - Show system information');
  console.log('\nExamples:');
  console.log('  codecraft ask "how do I find large files?"');
  console.log('  codecraft run "compress all images in current folder"');
  console.log('  codecraft explain "rm -rf node_modules"');
  console.log('  codecraft models --search gpt --free');
  console.log('  codecraft diagnose');
  console.log('  codecraft chat');
  console.log('\nFor more information, run: codecraft --help\n');
});

program.parse();
