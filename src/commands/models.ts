import chalk from 'chalk';
import ora from 'ora';
import { OpenRouterClient } from '../services/openrouter.js';
import { OpenRouterModel } from '../types/index.js';

interface ModelsOptions {
  search?: string;
  free?: boolean;
  limit?: number;
  sort?: 'name' | 'price' | 'context';
}

export async function modelsCommand(client: OpenRouterClient, options: ModelsOptions = {}): Promise<void> {
  const spinner = ora('Fetching available models from OpenRouter...').start();

  try {
    const response = await client.listModels();
    spinner.succeed('Models fetched successfully');

    let models = response.data;

    // Apply filters
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      models = models.filter(model => 
        model.id.toLowerCase().includes(searchLower) || 
        model.name?.toLowerCase().includes(searchLower)
      );
    }

    if (options.free) {
      models = models.filter(model => 
        model.pricing?.prompt === '0' && model.pricing?.completion === '0'
      );
    }

    // Sort models
    if (options.sort) {
      switch (options.sort) {
        case 'name':
          models.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'price':
          models.sort((a, b) => {
            const priceA = parseFloat(a.pricing?.prompt || '0');
            const priceB = parseFloat(b.pricing?.prompt || '0');
            return priceA - priceB;
          });
          break;
        case 'context':
          models.sort((a, b) => {
            const contextA = a.context_length || 0;
            const contextB = b.context_length || 0;
            return contextB - contextA;
          });
          break;
      }
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      models = models.slice(0, options.limit);
    }

    if (models.length === 0) {
      console.log(chalk.yellow('\nNo models found matching your criteria.'));
      return;
    }

    console.log(chalk.cyan(`\n📋 Available Models (${models.length} total):\n`));

    models.forEach((model: OpenRouterModel) => {
      const isFree = model.pricing?.prompt === '0' && model.pricing?.completion === '0';
      const contextLength = model.context_length ? `${(model.context_length / 1000).toFixed(0)}K` : 'N/A';
      
      console.log(chalk.bold.white(`  ${model.id}`));
      
      if (model.name && model.name !== model.id) {
        console.log(chalk.gray(`    Name: ${model.name}`));
      }
      
      if (model.context_length) {
        console.log(chalk.gray(`    Context: ${contextLength} tokens`));
      }
      
      if (model.pricing) {
        const promptPrice = model.pricing.prompt === '0' ? 'Free' : `$${model.pricing.prompt}/M`;
        const completionPrice = model.pricing.completion === '0' ? 'Free' : `$${model.pricing.completion}/M`;
        
        if (isFree) {
          console.log(chalk.green(`    Pricing: Free`));
        } else {
          console.log(chalk.gray(`    Pricing: ${promptPrice} input, ${completionPrice} output`));
        }
      }
      
      console.log(); // Empty line between models
    });

    console.log(chalk.cyan('💡 Usage:'));
    console.log(chalk.gray('  codecraft ask "your question" -m <model-id>'));
    console.log(chalk.gray('  codecraft run "your intent" -m <model-id>'));
    console.log();
    console.log(chalk.cyan('🔍 Filter options:'));
    console.log(chalk.gray('  --search <term>    Search models by name or ID'));
    console.log(chalk.gray('  --free             Show only free models'));
    console.log(chalk.gray('  --limit <n>        Limit number of results'));
    console.log(chalk.gray('  --sort <type>      Sort by: name, price, or context'));
    console.log();

  } catch (error) {
    spinner.fail('Failed to fetch models');
    throw error;
  }
}
