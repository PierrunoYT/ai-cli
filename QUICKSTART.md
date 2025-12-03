# Quick Start Guide

Get CodeCraft up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Your OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Create a new API key
4. Copy the key

## Step 3: Configure Environment

Create a `.env` file in the project root:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux:
cp .env.example .env
```

Edit `.env` and add your API key:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## Step 4: Build the Project

```bash
npm run build
```

## Step 5: Test It Out

Try these commands:

```bash
# Ask a question
node dist/index.js ask "how do I list files?"

# Generate and run a command
node dist/index.js run "show current directory"

# Explain a command
node dist/index.js explain "ls -la"

# Start interactive chat
node dist/index.js chat
```

## Step 6: Install Globally (Optional)

To use `codecraft` from anywhere:

```bash
npm link
```

Now you can run:

```bash
codecraft ask "how do I compress files?"
codecraft run "list all processes"
codecraft chat
```

## Troubleshooting

**Error: "OPENROUTER_API_KEY is not set"**
- Make sure your `.env` file exists and contains your API key
- The key should start with `sk-or-v1-`

**Error: "Cannot find module"**
- Run `npm install` to install dependencies
- Run `npm run build` to compile TypeScript

**Commands not working on Windows**
- Use PowerShell or cmd (both are supported)
- Make sure you're in the project directory

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Try different AI models with the `-m` flag
- Explore the interactive chat mode for complex tasks

## Examples to Try

```bash
# File operations
codecraft run "find all files larger than 100MB"
codecraft run "create a backup of this folder"

# Git operations
codecraft run "show my recent commits"
codecraft ask "how do I undo a git commit?"

# System info
codecraft context
codecraft run "show system information"

# Docker
codecraft run "list all docker containers"
codecraft explain "docker-compose up -d"
```

Happy coding! 🚀
