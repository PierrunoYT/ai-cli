# Changelog

All notable changes to this project will be documented in this file.

The format is based on **Keep a Changelog**, and this project adheres to **Semantic Versioning**.

## [Unreleased]

## [0.1.3] - 2025-12-03

### Added
- PowerShell security patterns:
  - Dangerous: `Remove-Item -Recurse`, `Remove-Item *`
  - Warning: `Remove-Item`, `Stop-Computer`, `Restart-Computer`, `Stop-Service`, `Stop-Process`

## [0.1.2] - 2025-12-03

### Added
- **Three-tier security system** for command execution:
  - 🚫 Blocked: Catastrophic commands (rm -rf /, format C:, fork bombs) are completely blocked
  - 🚨 Dangerous: High-risk commands (rm -rf, DROP DATABASE, git reset --hard) require typing "CONFIRM"
  - ⚠️ Warning: System-modifying commands show caution prompt
- Dangerous commands now ignore `-y` flag and always require explicit confirmation
- `isBlocked()` and `getSecurityLevel()` methods in CommandExecutor
- Protection against piping untrusted content to shell (`curl | sh`, `wget | bash`)

### Changed
- Enhanced command validation with security level feedback
- Improved confirmation prompts with security-level-specific messaging

## [0.1.1] - 2025-12-03

### Fixed
- Fixed duplicate output display in `run` command

## [0.1.0] - 2025-12-03

### Added
- AI-powered CLI assistant using OpenRouter API
- **Ask command**: Answer questions about commands and tools with `codecraft ask`
- **Run command**: Generate and execute commands from natural language with `codecraft run`
- **Explain command**: Understand what a command does without executing it with `codecraft explain`
- **Chat command**: Interactive conversations with the AI with `codecraft chat`
- **Context command**: Display system information with `codecraft context`
- **Models command**: List and browse all available OpenRouter models with `codecraft models`
  - Model filtering options: search by name/ID, filter by free models, limit results
  - Sort by price, context length, or name
  - Comprehensive model information display including pricing, context length, and ownership
- **Diagnose command**: Test API connection and troubleshoot configuration issues with `codecraft diagnose`
  - Environment file detection (.env location and existence check)
  - API key validation via `/auth/key` endpoint (shows label, limit, usage)
  - Detection of conflicting .env files in home directory
  - API key format validation (whitespace, quotes, spaces detection)
- System context detection (OS, shell, available tools)
- Command execution service with safety checks
- Dangerous command detection and warnings
- Confirmation prompts before executing commands
- Support for multiple AI models via `-m` flag
- Streaming responses for better user experience
- Configuration via `.env` file
- `listModels()` method in OpenRouterClient to fetch models from OpenRouter API
- Advanced provider routing support with configurable preferences
- Support for OpenRouter's `provider` object with order, fallbacks, and parameter requirements
- Environment variable configuration for provider preferences (OPENROUTER_PROVIDER_ORDER, etc.)
- Support for `transforms` and `route` parameters in API requests
- Enhanced streaming error handling with error detection in stream chunks
- Configuration options for temperature and max_tokens via environment variables
- Support for additional request parameters: top_p, frequency_penalty, presence_penalty
- Auto-routing capability with `openrouter/auto` model
- Better error messages with specific HTTP status codes (401, 402, 429)
- Comprehensive error handling and validation

### Changed
- Default model set to `openai/gpt-4o-mini`
- Enhanced OpenRouter client to support latest API features
- Improved type definitions with `OpenRouterRequestOptions` and `ProviderPreferences`
- Enhanced config utility to parse provider preferences from environment variables
- Command executor uses PowerShell on Windows for better command support

### Fixed
- Improved error handling in streaming responses
- Better handling of undefined optional parameters in API requests
