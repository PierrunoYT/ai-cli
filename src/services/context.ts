import { platform, homedir, userInfo } from 'os';
import { execSync } from 'child_process';
import { SystemContext } from '../types/index.js';

export class ContextDetector {
  private context: SystemContext | null = null;

  getContext(): SystemContext {
    if (this.context) {
      return this.context;
    }

    this.context = {
      os: this.getOSName(),
      platform: platform(),
      shell: this.detectShell(),
      cwd: process.cwd(),
      availableTools: this.detectAvailableTools(),
      homeDir: homedir(),
      username: this.getUsername(),
    };

    return this.context;
  }

  private getOSName(): string {
    const p = platform();
    switch (p) {
      case 'win32':
        return 'Windows';
      case 'darwin':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return p;
    }
  }

  private detectShell(): string {
    try {
      if (platform() === 'win32') {
        // On Windows, check if we're in PowerShell or cmd
        const shell = process.env.SHELL || process.env.ComSpec || '';
        if (shell.toLowerCase().includes('powershell') || process.env.PSModulePath) {
          return 'PowerShell';
        }
        return 'cmd';
      } else {
        // On Unix-like systems
        const shell = process.env.SHELL || '';
        if (shell.includes('zsh')) return 'zsh';
        if (shell.includes('bash')) return 'bash';
        if (shell.includes('fish')) return 'fish';
        return shell || 'unknown';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  private getUsername(): string {
    try {
      return userInfo().username;
    } catch (error) {
      return process.env.USER || process.env.USERNAME || 'unknown';
    }
  }

  private detectAvailableTools(): string[] {
    const tools = [
      'git',
      'docker',
      'npm',
      'node',
      'python',
      'pip',
      'curl',
      'wget',
      'tar',
      'zip',
      'unzip',
      'grep',
      'find',
      'sed',
      'awk',
      'jq',
      'kubectl',
      'terraform',
      'ansible',
      'make',
      'gcc',
      'go',
      'rust',
      'cargo',
      'java',
      'mvn',
      'gradle',
    ];

    const available: string[] = [];

    for (const tool of tools) {
      if (this.isToolAvailable(tool)) {
        available.push(tool);
      }
    }

    return available;
  }

  private isToolAvailable(tool: string): boolean {
    try {
      const command = platform() === 'win32' ? `where ${tool}` : `which ${tool}`;
      execSync(command, { stdio: 'ignore', timeout: 1000 });
      return true;
    } catch (error) {
      return false;
    }
  }

  getContextString(): string {
    const ctx = this.getContext();
    return `System Context:
- OS: ${ctx.os} (${ctx.platform})
- Shell: ${ctx.shell}
- Current Directory: ${ctx.cwd}
- Available Tools: ${ctx.availableTools.length > 0 ? ctx.availableTools.join(', ') : 'none detected'}
- User: ${ctx.username}`;
  }

  getContextForPrompt(): string {
    const ctx = this.getContext();
    return `You are helping a user on ${ctx.os} using ${ctx.shell}. Current directory: ${ctx.cwd}. Available tools: ${ctx.availableTools.join(', ')}.`;
  }
}
