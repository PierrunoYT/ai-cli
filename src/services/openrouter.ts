import axios, { AxiosInstance } from 'axios';
import { OpenRouterMessage, OpenRouterResponse, OpenRouterRequestOptions, OpenRouterModelsResponse, Config } from '../types/index.js';

export class OpenRouterClient {
  private client: AxiosInstance;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': config.siteUrl || 'https://github.com/codecraft-cli',
        'X-Title': config.siteName || 'CodeCraft CLI',
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 second timeout
    });
  }

  async chat(messages: OpenRouterMessage[], model?: string, options?: Partial<OpenRouterRequestOptions>): Promise<string> {
    try {
      const requestBody: OpenRouterRequestOptions = {
        model: model || this.config.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2000,
        top_p: options?.top_p,
        frequency_penalty: options?.frequency_penalty,
        presence_penalty: options?.presence_penalty,
        provider: options?.provider,
        transforms: options?.transforms,
        route: options?.route,
      };

      // Remove undefined values
      Object.keys(requestBody).forEach(key => 
        requestBody[key as keyof OpenRouterRequestOptions] === undefined && 
        delete requestBody[key as keyof OpenRouterRequestOptions]
      );

      const response = await this.client.post<OpenRouterResponse>('/chat/completions', requestBody);

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('No response from OpenRouter API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          const errorDetail = error.response?.data?.error?.message || error.response?.data?.error || '';
          throw new Error(`Invalid API key. Please check your OPENROUTER_API_KEY in .env file.\nDetails: ${errorDetail}`);
        } else if (error.response?.status === 402) {
          throw new Error('Insufficient credits. Please add credits to your OpenRouter account at https://openrouter.ai/credits');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later');
        } else if (error.response?.data?.error) {
          const errorMsg = error.response.data.error.message || JSON.stringify(error.response.data.error);
          throw new Error(`OpenRouter API error: ${errorMsg}`);
        } else if (error.response) {
          throw new Error(`OpenRouter API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
        }
      }
      throw new Error(`Failed to communicate with OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async streamChat(messages: OpenRouterMessage[], model?: string, onChunk?: (chunk: string) => void, options?: Partial<OpenRouterRequestOptions>): Promise<string> {
    try {
      const requestBody: OpenRouterRequestOptions = {
        model: model || this.config.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2000,
        top_p: options?.top_p,
        frequency_penalty: options?.frequency_penalty,
        presence_penalty: options?.presence_penalty,
        provider: options?.provider,
        transforms: options?.transforms,
        route: options?.route,
        stream: true,
      };

      // Remove undefined values
      Object.keys(requestBody).forEach(key => 
        requestBody[key as keyof OpenRouterRequestOptions] === undefined && 
        delete requestBody[key as keyof OpenRouterRequestOptions]
      );

      const response = await this.client.post('/chat/completions', requestBody, {
        responseType: 'stream',
      });

      let fullResponse = '';

      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }
              
              try {
                const parsed = JSON.parse(data);
                // Check for errors in stream
                if ('error' in parsed) {
                  reject(new Error(`Stream error: ${parsed.error.message || 'Unknown error'}`));
                  return;
                }
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                  if (onChunk) {
                    onChunk(content);
                  }
                }
              } catch (e) {
                // Skip invalid JSON chunks
              }
            }
          }
        });

        response.data.on('end', () => {
          resolve(fullResponse);
        });

        response.data.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error) {
      // Fallback to non-streaming if streaming fails
      return this.chat(messages, model, options);
    }
  }

  async listModels(): Promise<OpenRouterModelsResponse> {
    try {
      const response = await this.client.get<OpenRouterModelsResponse>('/models');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OPENROUTER_API_KEY in .env file');
        } else if (error.response?.data?.error) {
          throw new Error(`OpenRouter API error: ${error.response.data.error.message || error.response.data.error}`);
        }
      }
      throw new Error(`Failed to fetch models from OpenRouter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getModel(): string {
    return this.config.model;
  }

  setModel(model: string): void {
    this.config.model = model;
  }
}
