/**
 * 配置文件管理
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { GlobalConfig, ProjectConfig } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.zentao-sync');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const PROJECT_CONFIG_FILE = '.zd-project.json';

/**
 * 确保配置目录存在
 */
function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

/**
 * 读取全局配置
 */
export function loadGlobalConfig(): GlobalConfig | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 保存全局配置
 */
export function saveGlobalConfig(config: Partial<GlobalConfig>): void {
  ensureConfigDir();
  const existing = loadGlobalConfig() || {
    zentao: { url: '', account: '', password: '' }
  };
  const merged: GlobalConfig = {
    zentao: { ...existing.zentao, ...config.zentao },
    cycle: config.cycle ?? existing.cycle ?? 24,
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2));
}

/**
 * 获取禅道 URL
 */
export function getZentaoUrl(): string | null {
  const config = loadGlobalConfig();
  return config?.zentao?.url || null;
}

/**
 * 获取账号
 */
export function getAccount(): string | null {
  const config = loadGlobalConfig();
  return config?.zentao?.account || null;
}

/**
 * 获取密码
 */
export function getPassword(): string | null {
  const config = loadGlobalConfig();
  return config?.zentao?.password || null;
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  const config = loadGlobalConfig();
  return config?.zentao?.token || null;
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  const config = loadGlobalConfig() || {
    zentao: { url: '', account: '', password: '' }
  };
  config.zentao.token = token;
  saveGlobalConfig(config);
}

/**
 * 获取工时周期
 */
export function getCycle(): number {
  const config = loadGlobalConfig();
  return config?.cycle || 24;
}

/**
 * 查找项目配置文件
 */
function findProjectConfigFile(): string | null {
  let dir = process.cwd();
  while (dir !== path.parse(dir).root) {
    const configFile = path.join(dir, PROJECT_CONFIG_FILE);
    if (fs.existsSync(configFile)) {
      return configFile;
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * 读取项目配置
 */
export function loadProjectConfig(): ProjectConfig | null {
  const configFile = findProjectConfigFile();
  if (!configFile) {
    return null;
  }
  try {
    const content = fs.readFileSync(configFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * 保存项目配置
 */
export function saveProjectConfig(config: ProjectConfig, targetDir?: string): string {
  const dir = targetDir || process.cwd();
  const configFile = path.join(dir, PROJECT_CONFIG_FILE);
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  return configFile;
}

/**
 * 格式化输出
 */
export function printSuccess(message: string): void {
  console.log(`\x1b[32m${message}\x1b[0m`);
}

export function printError(message: string): void {
  console.log(`\x1b[31m${message}\x1b[0m`);
}

export function printWarning(message: string): void {
  console.log(`\x1b[33m${message}\x1b[0m`);
}

/**
 * 智能推断执行 ID
 */
export function inferExecution(
  taskName: string,
  taskDesc: string,
  config: ProjectConfig
): number {
  const content = `${taskName} ${taskDesc}`.toLowerCase();
  let bestMatch = config.defaultExecution;
  let bestScore = 0;

  for (const exec of config.executions) {
    let score = 0;
    for (const keyword of exec.keywords) {
      if (content.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = exec.id;
    }
  }

  return bestMatch;
}

/**
 * 智能推断任务类型
 */
export function inferTaskType(
  taskName: string,
  taskDesc: string,
  config: ProjectConfig
): string {
  const content = `${taskName} ${taskDesc}`.toLowerCase();
  let bestMatch = config.defaults.type;
  let bestScore = 0;

  for (const [typeKey, typeConfig] of Object.entries(config.taskTypes)) {
    let score = 0;
    for (const keyword of typeConfig.keywords) {
      if (content.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = typeKey;
    }
  }

  return bestMatch;
}
