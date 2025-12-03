import { exec } from 'child_process';
import { promisify } from 'util';
import { CommandResult } from '../types/index.js';

const execAsync = promisify(exec);

export class CommandExecutor {
  private dangerousPatterns = [
    /rm\s+-rf\s+\//,
    /rm\s+-fr\s+\//,
    /del\s+\/[sS]\s+[cC]:\\/,
    /format\s+[cC]:/,
    /dd\s+if=/,
    /mkfs\./,
    />\/dev\/sd[a-z]/,
    /:\(\)\{\s*:\|:&\s*\};:/,  // Fork bomb
    /chmod\s+-R\s+777\s+\//,
    /chown\s+-R.*\s+\//,
  ];

  private warningPatterns = [
    /rm\s+-r/,
    /rm\s+.*\*/,
    /del\s+\/[sS]/,
    /DROP\s+DATABASE/i,
    /DROP\s+TABLE/i,
    /TRUNCATE/i,
    /shutdown/i,
    /reboot/i,
    /init\s+[06]/,
  ];

  isDangerous(command: string): boolean {
    return this.dangerousPatterns.some(pattern => pattern.test(command));
  }

  requiresWarning(command: string): boolean {
    return this.warningPatterns.some(pattern => pattern.test(command));
  }

  async execute(command: string, timeout: number = 30000): Promise<CommandResult> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        shell: this.getShell(),
      });

      return {
        success: true,
        output: stdout || stderr || 'Command executed successfully (no output)',
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message || 'Unknown error',
        exitCode: error.code || 1,
      };
    }
  }

  private getShell(): string {
    if (process.platform === 'win32') {
      // Use PowerShell on Windows for better command support
      return 'powershell.exe';
    }
    return process.env.SHELL || '/bin/sh';
  }

  async executeWithOutput(
    command: string,
    onOutput?: (data: string) => void,
    timeout: number = 30000
  ): Promise<CommandResult> {
    return new Promise((resolve) => {
      const childProcess = exec(command, {
        timeout,
        maxBuffer: 1024 * 1024 * 10,
        shell: this.getShell(),
      });

      let stdout = '';
      let stderr = '';

      if (childProcess.stdout) {
        childProcess.stdout.on('data', (data) => {
          const text = data.toString();
          stdout += text;
          if (onOutput) {
            onOutput(text);
          }
        });
      }

      if (childProcess.stderr) {
        childProcess.stderr.on('data', (data) => {
          const text = data.toString();
          stderr += text;
          if (onOutput) {
            onOutput(text);
          }
        });
      }

      childProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout || stderr || 'Command executed successfully (no output)',
          error: code !== 0 ? stderr : undefined,
          exitCode: code || 0,
        });
      });

      childProcess.on('error', (error) => {
        resolve({
          success: false,
          output: stdout,
          error: error.message,
          exitCode: 1,
        });
      });
    });
  }

  validateCommand(command: string): { valid: boolean; reason?: string } {
    if (!command || command.trim().length === 0) {
      return { valid: false, reason: 'Command is empty' };
    }

    if (this.isDangerous(command)) {
      return { valid: false, reason: 'Command is potentially dangerous and should not be executed' };
    }

    return { valid: true };
  }
}
