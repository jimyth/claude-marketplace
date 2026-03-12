/**
 * 禅道 API 客户端
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadGlobalConfig,
  saveGlobalConfig,
  getToken,
  setToken,
} from './config.js';
import type { ApiResponse } from './types.js';

const CONFIG_DIR = path.join(os.homedir(), '.zentao-sync');
const TOKEN_FILE = path.join(CONFIG_DIR, 'token.json');

interface ApiClientOptions {
  baseUrl: string;
  account: string;
  password: string;
}

/**
 * 禅道 API 客户端
 */
export class ZentaoApiClient {
  private baseUrl: string;
  private account: string;
  private password: string;
  private token: string | null = null;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.account = options.account;
    this.password = options.password;
  }

  /**
   * 从配置创建客户端
   */
  static fromConfig(): ZentaoApiClient | null {
    const config = loadGlobalConfig();
    if (!config?.zentao?.url || !config?.zentao?.account) {
      return null;
    }
    return new ZentaoApiClient({
      baseUrl: config.zentao.url,
      account: config.zentao.account,
      password: config.zentao.password || '',
    });
  }

  /**
   * 登录获取 Token
   */
  async login(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api.php/v1/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: this.account,
        password: this.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`登录失败: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.token) {
      this.token = data.token;
      setToken(data.token);
      return data.token;
    }

    throw new Error(data.error || data.message || '登录失败');
  }

  /**
   * 获取有效 Token（自动登录）
   */
  private async getValidToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    // 尝试从存储获取
    const storedToken = getToken();
    if (storedToken) {
      this.token = storedToken;
      return storedToken;
    }

    // 需要登录
    return this.login();
  }

  /**
   * 发送 API 请求
   */
  async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const token = await this.getValidToken();
    const url = `${this.baseUrl}/api.php/v1${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Token': token,
      },
    };

    if (data && method === 'POST') {
      options.body = JSON.stringify(data);
    }

    let response = await fetch(url, options);

    // Token 过期，重新登录
    if (response.status === 401) {
      this.token = null;
      const newToken = await this.login();
      options.headers = {
        'Content-Type': 'application/json',
        'Token': newToken,
      };
      if (data && method === 'POST') {
        options.body = JSON.stringify(data);
      }
      response = await fetch(url, options);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error || errorJson.message || errorMessage;
      } catch {
        // 忽略解析错误
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * 检查响应是否成功
   */
  isSuccess(response: unknown): boolean {
    if (typeof response === 'object' && response !== null) {
      if ('error' in response && response.error) {
        return false;
      }
    }
    return true;
  }

  /**
   * 解析错误信息
   */
  parseError(response: unknown): string {
    if (typeof response === 'object' && response !== null) {
      if ('error' in response) {
        if (typeof response.error === 'object' && response.error !== null) {
          return JSON.stringify(response.error);
        }
        return String(response.error);
      }
      if ('message' in response) {
        return String(response.message);
      }
    }
    return 'Unknown error';
  }
}

// 导出单例
let _client: ZentaoApiClient | null = null;

export function getClient(): ZentaoApiClient {
  if (!_client) {
    _client = ZentaoApiClient.fromConfig();
    if (!_client) {
      throw new Error('禅道未配置。请运行 /zd-config 配置连接信息。');
    }
  }
  return _client;
}

export function resetClient(): void {
  _client = null;
}
