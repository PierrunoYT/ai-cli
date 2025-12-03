import inquirer from 'inquirer';
import chalk from 'chalk';

export async function confirmExecution(
  command: string, 
  explanation: string, 
  securityLevel: 'dangerous' | 'warning' | 'safe'
): Promise<boolean> {
  if (securityLevel === 'dangerous') {
    console.log(chalk.red.bold('\n🚨 DANGEROUS COMMAND DETECTED'));
    console.log(chalk.red('This command could cause significant damage or data loss.'));
    console.log(chalk.yellow(`\nTo proceed, type: ${chalk.bold('CONFIRM')}\n`));
    
    const { confirmation } = await inquirer.prompt([
      {
        type: 'input',
        name: 'confirmation',
        message: 'Type CONFIRM to execute:',
      },
    ]);

    return confirmation === 'CONFIRM';
  }

  const warningPrefix = securityLevel === 'warning' ? '⚠️  ' : '';
  
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `${warningPrefix}Execute this command?\n  Command: ${command}\n  Explanation: ${explanation}\n  Proceed?`,
      default: securityLevel === 'safe',
    },
  ]);

  return confirmed;
}

export async function getChatInput(prompt: string = 'You'): Promise<string> {
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: `${prompt}:`,
    },
  ]);

  return input;
}

export async function selectModel(models: string[]): Promise<string> {
  const { model } = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: 'Select a model:',
      choices: models,
    },
  ]);

  return model;
}
