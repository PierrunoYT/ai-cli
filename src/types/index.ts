export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderPreferences {
  order?: string[];
  allow_fallbacks?: boolean;
  require_parameters?: boolean;
  data_collection?: 'allow' | 'deny';
  zdr?: boolean;
  enforce_distillable_text?: boolean;
}

export interface OpenRouterRequestOptions {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  provider?: ProviderPreferences;
  transforms?: string[];
  route?: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SystemContext {
  os: string;
  platform: NodeJS.Platform;
  shell: string;
  cwd: string;
  availableTools: string[];
  homeDir: string;
  username: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface Config {
  apiKey: string;
  model: string;
  siteUrl?: string;
  siteName?: string;
  provider?: ProviderPreferences;
  temperature?: number;
  max_tokens?: number;
}

export interface CommandSuggestion {
  command: string;
  explanation: string;
  dangerous: boolean;
  requiresConfirmation: boolean;
}

export interface OpenRouterModel {
  id: string;
  name?: string;
  created?: number;
  object?: string;
  owned_by?: string;
  context_length?: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  pricing?: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}
