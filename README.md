# CodeCraft

> AI-powered CLI assistant that helps you find and run commands using natural language.

## Overview

- **What it is:** A command-line tool that uses AI (via OpenRouter) to answer questions, suggest commands, and execute them safely
- **Why it exists:** To make command-line operations more accessible and reduce the need to search documentation or Stack Overflow
- **Who it's for:** Developers, system administrators, and anyone who works with the command line

## Tech Stack

- **Language/Runtime:** TypeScript on Node.js 18+
- **Framework:** Commander.js (CLI), Inquirer.js (prompts)
- **AI Provider:** OpenRouter API (supports GPT-4, Claude, Llama, and more)
- **Tooling:** TypeScript compiler, ESLint, Prettier

## Features

- 🤖 **Ask Mode**: Get answers about commands and tools
- 🚀 **Run Mode**: Generate and execute commands from natural language
- 📖 **Explain Mode**: Understand what a command does before running it
- 💬 **Interactive Chat**: Have a conversation with the AI assistant
- 🔒 **Safety First**: Always confirms before executing commands, with warnings for dangerous operations
- 🌍 **Context Aware**: Detects your OS, shell, and available tools for better suggestions
- 🎯 **Provider Routing**: Configure provider preferences for optimal performance and reliability
- 🔄 **Auto-Routing**: Use `openrouter/auto` model for intelligent model selection
- ⚙️ **Advanced Configuration**: Fine-tune temperature, max tokens, and provider preferences

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm
- OpenRouter API key (get one at https://openrouter.ai/keys)

### Install

```bash
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini  # optional, defaults to gpt-4o-mini

# Optional: Configure provider routing preferences
OPENROUTER_PROVIDER_ORDER=openai,anthropic  # comma-separated list of preferred providers
OPENROUTER_ALLOW_FALLBACKS=true  # allow backup providers (default: true)
OPENROUTER_REQUIRE_PARAMETERS=false  # only use providers supporting all parameters (default: false)
OPENROUTER_DATA_COLLECTION=allow  # allow or deny data collection (default: allow)

# Optional: Configure generation parameters
OPENROUTER_TEMPERATURE=0.7  # default: 0.7
OPENROUTER_MAX_TOKENS=2000  # default: 2000
```

### Build

```bash
npm run build
```

### Install Globally (Optional)

After building, you can install the CLI globally:

```bash
npm link
```

Now you can use `codecraft` from anywhere in your terminal.

## Usage

### Ask Questions

Get help with commands and tools:

```bash
codecraft ask "how do I find large files?"
codecraft ask "what's the difference between grep and awk?"
```

### Run Commands

Generate and execute commands from natural language:

```bash
codecraft run "compress all images in current folder"
codecraft run "find all JavaScript files modified in the last week"
codecraft run "create a git branch called feature/new-ui"
```

Add `-y` flag to skip confirmation (use with caution):

```bash
codecraft run "list all running processes" -y
```

### Explain Commands

Understand what a command does before running it:

```bash
codecraft explain "rm -rf node_modules"
codecraft explain "docker-compose up -d"
codecraft explain "find . -name '*.log' -delete"
```

### Interactive Chat

Start a conversation with the AI:

```bash
codecraft chat
```

Type your questions and get answers in real-time. Type `quit` or `exit` to leave.

### List Available Models

View all available OpenRouter models with pricing and context information:

```bash
codecraft models
```

Filter and search models:

```bash
# Search for specific models
codecraft models --search gpt

# Show only free models
codecraft models --free

# Limit results
codecraft models --limit 10

# Sort by price, name, or context length
codecraft models --sort price
codecraft models --sort context
codecraft models --sort name

# Combine filters
codecraft models --search claude --free --limit 5
```

### Diagnose API Connection

Test your API key and connection to OpenRouter:

```bash
codecraft diagnose
```

This command will:
- Detect .env file location and check if it exists
- Verify your API key is loaded correctly
- Validate API key via OpenRouter's auth endpoint (shows label, limit, usage)
- Test the models endpoint
- Test the chat completions endpoint
- Detect conflicting .env files in home directory
- Check for API key format issues (whitespace, quotes, spaces)
- Show detailed error messages if something is wrong

### Check System Context

See what CodeCraft knows about your system:

```bash
codecraft context
```

### Use Different Models

Specify a different AI model with the `-m` flag:

```bash
codecraft ask "how do I use sed?" -m anthropic/claude-3-sonnet
codecraft run "backup my database" -m openai/gpt-4
```

Available models include:
- `openai/gpt-4o-mini` (default, fast and affordable)
- `openai/gpt-4.1` (latest GPT-4 with improved capabilities)
- `openai/gpt-5` (frontier model with advanced reasoning)
- `anthropic/claude-sonnet-4-0` (excellent for technical tasks)
- `anthropic/claude-opus-4-1` (most capable Claude model)
- `google/gemini-2.5-pro` (strong multimodal reasoning)
- `google/gemini-2.5-flash` (fast and efficient)
- `openrouter/auto` (automatically routes to best model for your prompt)

See all available models at https://openrouter.ai/models

## Project Structure

```text
.
├── src/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── ask.ts           # Ask questions mode
│   │   ├── run.ts           # Generate and run commands
│   │   ├── explain.ts       # Explain commands
│   │   └── interactive.ts   # Interactive chat mode
│   ├── services/
│   │   ├── openrouter.ts    # OpenRouter API client
│   │   ├── executor.ts      # Command execution with safety checks
│   │   └── context.ts       # System context detection
│   ├── utils/
│   │   ├── prompts.ts       # Inquirer prompt templates
│   │   └── config.ts        # Configuration management
│   └── types/
│       └── index.ts         # TypeScript type definitions
├── dist/                     # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── CHANGELOG.md
```

## Provider Routing

CodeCraft supports OpenRouter's advanced provider routing features for optimal performance:

### Provider Preferences

Configure provider routing in your `.env` file:

```bash
# Specify preferred providers in order
OPENROUTER_PROVIDER_ORDER=openai,anthropic,google

# Control fallback behavior
OPENROUTER_ALLOW_FALLBACKS=true

# Only use providers that support all parameters
OPENROUTER_REQUIRE_PARAMETERS=false

# Control data collection preferences
OPENROUTER_DATA_COLLECTION=allow
```

### Auto-Routing

Use the `openrouter/auto` model to automatically route requests to the best model for your prompt:

```bash
codecraft ask "complex coding question" -m openrouter/auto
```

The auto-router uses a meta-model to analyze your prompt and select the optimal model from dozens of options, ensuring you get the best possible response while optimizing for cost and performance.

## Safety Features

CodeCraft includes a three-tier security system to protect your system:

### 🚫 Blocked Commands (Cannot Execute)
Commands that could cause catastrophic system damage are completely blocked:
- `rm -rf /` or `rm -rf ~` (delete root or home directory)
- `format C:` or `del /s C:\` (Windows system destruction)
- `dd` writes to disk devices
- Fork bombs and malicious scripts
- Piping untrusted content to shell (`curl | sh`)

### 🚨 Dangerous Commands (Requires Typing CONFIRM)
High-risk commands require explicit confirmation by typing "CONFIRM":
- `rm -rf` with any path
- `Remove-Item -Recurse` or `Remove-Item *` (PowerShell)
- `DROP DATABASE`, `DROP TABLE`, `TRUNCATE`
- `git reset --hard`, `git push --force`
- These commands **ignore the `-y` flag** for safety

### ⚠️ Warning Commands (Requires Confirmation)
Commands that modify system state show a warning:
- Recursive file operations (`rm -r`, `Remove-Item`)
- System shutdown/reboot (`shutdown`, `Stop-Computer`, `Restart-Computer`)
- Service management (`Stop-Service`, `systemctl stop`)
- Process termination (`kill -9`, `Stop-Process`)

### Additional Protections
- **Timeout Protection**: Commands timeout after 30 seconds by default
- **Context Awareness**: Generates commands appropriate for your OS and shell

## Examples

**Browse available models:**
```bash
codecraft models --search gpt-4
codecraft models --free --limit 10
```

**Find large files:**
```bash
codecraft ask "how do I find files larger than 100MB?"
```

**Compress images:**
```bash
codecraft run "compress all PNG images to 80% quality"
```

**Git operations:**
```bash
codecraft run "create a new branch and switch to it"
codecraft run "undo my last commit but keep the changes"
```

**System administration:**
```bash
codecraft run "show disk usage sorted by size"
codecraft run "find processes using port 3000"
```

**Docker:**
```bash
codecraft run "stop all running containers"
codecraft explain "docker-compose up -d --build"
```

## Troubleshooting

**"OPENROUTER_API_KEY is not set"**
- Make sure you've created a `.env` file with your API key
- Get an API key from https://openrouter.ai/keys

**"Invalid API key"**
- Verify your API key is correct in the `.env` file
- Check that your OpenRouter account has credits

**Commands not working on Windows**
- CodeCraft detects PowerShell vs cmd automatically
- Make sure you're using the correct shell for your environment

## Versioning

This project uses [Semantic Versioning](https://semver.org/). Version updates are tracked in `package.json` and `CHANGELOG.md`. We do not create formal GitHub releases - install directly from the repository.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commits
4. Open a Pull Request

## License

MIT

## Credits

Powered by [OpenRouter](https://openrouter.ai) - Access to multiple AI models through a single API.
