import { exec } from 'child_process';
import { promisify } from 'util';
import { CommandResult } from '../types/index.js';

const execAsync = promisify(exec);

export class CommandExecutor {
  // Blocked patterns - these commands will NOT be executed
  private blockedPatterns = [
    /rm\s+-rf\s+\/($|\s)/,           // rm -rf / (root)
    /rm\s+-fr\s+\/($|\s)/,           // rm -fr / (root)
    /rm\s+-rf\s+\/\*($|\s)/,         // rm -rf /*
    /rm\s+-rf\s+~($|\s)/,            // rm -rf ~ (home)
    /del\s+\/[sS]\s+[cC]:\\($|\s)/,  // del /s C:\ (Windows root)
    /rd\s+\/[sS]\s+\/[qQ]\s+[cC]:\\/, // rd /s /q C:\ (Windows)
    /format\s+[cC]:/,                 // format C:
    /dd\s+if=.*of=\/dev\/sd[a-z]$/,   // dd to disk device
    /mkfs\.\w+\s+\/dev\/sd[a-z]/,     // format disk
    />\/dev\/sd[a-z]/,                // write to disk device
    /:\(\)\{\s*:\|:&\s*\};:/,         // Fork bomb
    /chmod\s+-R\s+777\s+\/($|\s)/,    // chmod 777 / (root)
    /chown\s+-R.*\s+\/($|\s)/,        // chown / (root)
    />(\/dev\/null|\/dev\/zero)\s*</,  // Dangerous redirects
    /curl.*\|\s*(ba)?sh/,             // Piping curl to shell
    /wget.*\|\s*(ba)?sh/,             // Piping wget to shell
  ];

  // Dangerous patterns - require explicit confirmation with typing
  private dangerousPatterns = [
    /rm\s+-rf/,                       // Any rm -rf
    /rm\s+-fr/,                       // Any rm -fr  
    /rm\s+.*\*/,                      // rm with wildcards
    /del\s+\/[sS]/,                   // Windows recursive delete
    /rd\s+\/[sS]/,                    // Windows recursive rmdir
    /Remove-Item.*-Recurse/i,         // PowerShell recursive delete
    /Remove-Item.*\*/i,               // PowerShell delete with wildcards
    /ri\s+.*-Recurse/i,               // PowerShell alias recursive delete
    /DROP\s+DATABASE/i,               // SQL drop database
    /DROP\s+TABLE/i,                  // SQL drop table
    /TRUNCATE\s+TABLE/i,              // SQL truncate
    /DELETE\s+FROM\s+\w+\s*;?$/i,     // SQL delete without WHERE
    /git\s+reset\s+--hard/,           // Git hard reset
    /git\s+clean\s+-fd/,              // Git clean force
    /git\s+push.*--force/,            // Git force push
    /npm\s+cache\s+clean\s+--force/,  // npm cache clean
  ];

  // Warning patterns - show caution but normal confirmation
  private warningPatterns = [
    /rm\s+-r/,                        // Recursive remove
    /Remove-Item/i,                   // PowerShell delete (any)
    /del\s+/i,                        // Windows delete
    /shutdown/i,                      // System shutdown
    /reboot/i,                        // System reboot
    /Restart-Computer/i,              // PowerShell restart
    /Stop-Computer/i,                 // PowerShell shutdown
    /init\s+[06]/,                    // Init runlevel
    /systemctl\s+(stop|disable)/,     // Systemctl stop/disable
    /service\s+\w+\s+stop/,           // Service stop
    /Stop-Service/i,                  // PowerShell stop service
    /kill\s+-9/,                      // Force kill
    /pkill/,                          // Process kill
    /Stop-Process/i,                  // PowerShell kill process
    /chmod\s+-R/,                     // Recursive chmod
    /chown\s+-R/,                     // Recursive chown
  ];

  isBlocked(command: string): boolean {
    return this.blockedPatterns.some(pattern => pattern.test(command));
  }

  isDangerous(command: string): boolean {
    return this.dangerousPatterns.some(pattern => pattern.test(command));
  }

  requiresWarning(command: string): boolean {
    return this.warningPatterns.some(pattern => pattern.test(command));
  }

  getSecurityLevel(command: string): 'blocked' | 'dangerous' | 'warning' | 'safe' {
    if (this.isBlocked(command)) return 'blocked';
    if (this.isDangerous(command)) return 'dangerous';
    if (this.requiresWarning(command)) return 'warning';
    return 'safe';
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

  validateCommand(command: string): { valid: boolean; reason?: string; securityLevel?: string } {
    if (!command || command.trim().length === 0) {
      return { valid: false, reason: 'Command is empty' };
    }

    if (this.isBlocked(command)) {
      return { 
        valid: false, 
        reason: 'Command is blocked for security reasons. This command could cause irreversible damage to your system.',
        securityLevel: 'blocked'
      };
    }

    return { valid: true, securityLevel: this.getSecurityLevel(command) };
  }
}
