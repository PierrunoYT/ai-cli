import inquirer from 'inquirer';

export async function confirmExecution(command: string, explanation: string, dangerous: boolean): Promise<boolean> {
  const warningPrefix = dangerous ? '⚠️  DANGEROUS: ' : '';
  
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `${warningPrefix}Execute this command?\n  Command: ${command}\n  Explanation: ${explanation}\n  Proceed?`,
      default: !dangerous,
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
