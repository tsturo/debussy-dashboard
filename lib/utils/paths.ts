import path from 'path';
import fs from 'fs';

let cachedProjectPath: string | null = null;

interface PathValidationResult {
  valid: boolean;
  error?: string;
}

export function getProjectPath(): string {
  if (cachedProjectPath) {
    return cachedProjectPath;
  }

  const envPath = process.env.DEBUSSY_PROJECT_PATH;
  const projectPath = envPath || process.cwd();

  cachedProjectPath = path.resolve(projectPath);
  return cachedProjectPath;
}

export function getMailboxPath(agent?: string): string {
  const projectPath = getProjectPath();

  if (agent) {
    if (path.isAbsolute(agent) || agent.includes('..')) {
      throw new Error('Invalid agent path: absolute paths and parent directory references are not allowed');
    }
    return path.join(projectPath, '.claude', 'mailbox', agent);
  }

  return path.join(projectPath, '.claude', 'mailbox');
}

export function getLogsPath(agent?: string): string {
  const projectPath = getProjectPath();

  if (agent) {
    if (path.isAbsolute(agent) || agent.includes('..')) {
      throw new Error('Invalid agent path: absolute paths and parent directory references are not allowed');
    }
    return path.join(projectPath, '.claude', 'logs', agent);
  }

  return path.join(projectPath, '.claude', 'logs');
}

export function validateProjectPath(pathToValidate: string): PathValidationResult {
  const resolvedPath = path.resolve(pathToValidate);

  if (!fs.existsSync(resolvedPath)) {
    return {
      valid: false,
      error: `Path does not exist: ${resolvedPath}`,
    };
  }

  const stats = fs.statSync(resolvedPath);
  if (!stats.isDirectory()) {
    return {
      valid: false,
      error: `Path is not a directory: ${resolvedPath}`,
    };
  }

  try {
    fs.accessSync(resolvedPath, fs.constants.R_OK);
  } catch {
    return {
      valid: false,
      error: `Path is not readable: ${resolvedPath}`,
    };
  }

  const beadsPath = path.join(resolvedPath, '.beads');
  if (!fs.existsSync(beadsPath)) {
    return {
      valid: false,
      error: `Missing .beads directory. Check DEBUSSY_PROJECT_PATH: ${resolvedPath}`,
    };
  }

  const mailboxPath = path.join(resolvedPath, '.claude', 'mailbox');
  if (!fs.existsSync(mailboxPath)) {
    return {
      valid: false,
      error: `Missing .claude/mailbox directory. Check DEBUSSY_PROJECT_PATH: ${resolvedPath}`,
    };
  }

  return { valid: true };
}

export function clearPathCache(): void {
  cachedProjectPath = null;
}
