/**
 * config 命令 - 配置禅道连接
 */

import { loadGlobalConfig, saveGlobalConfig, printSuccess, printError } from '../config.js';
import type { ConfigCommandArgs } from '../types.js';

export async function configCommand(args: ConfigCommandArgs): Promise<void> {
  if (args.show) {
    const config = loadGlobalConfig();
    if (!config) {
      console.log('未找到配置文件');
      return;
    }
    console.log(`URL: ${config.zentao?.url || '未设置'}`);
    console.log(`Account: ${config.zentao?.account || '未设置'}`);
    console.log(`Cycle: ${config.cycle || 24}`);
    return;
  }

  if (args.test) {
    const config = loadGlobalConfig();
    if (!config?.zentao?.url) {
      printError('URL 未配置');
      return;
    }
    console.log(`测试连接: ${config.zentao.url}`);
    try {
      const response = await fetch(config.zentao.url);
      if (response.ok || response.status === 302) {
        printSuccess('禅道服务可访问');
      } else {
        printError(`无法访问禅道 (HTTP ${response.status})`);
      }
    } catch (e) {
      printError(`连接失败: ${e}`);
    }
    return;
  }

  // 设置配置
  const updates: { zentao: { url?: string; account?: string; password?: string } } = { zentao: {} };

  if (args.url) {
    updates.zentao.url = args.url.replace(/\/$/, '');
    printSuccess(`URL 已设置: ${updates.zentao.url}`);
  }

  if (args.account) {
    updates.zentao.account = args.account;
    printSuccess(`Account 已设置: ${args.account}`);
  }

  if (args.password) {
    updates.zentao.password = args.password;
    printSuccess('Password 已设置');
  }

  const cycle = args.cycle;
  if (cycle !== undefined) {
    saveGlobalConfig({ zentao: updates.zentao, cycle });
    printSuccess(`Cycle 已设置: ${cycle}`);
    return;
  }

  if (Object.keys(updates.zentao).length > 0) {
    saveGlobalConfig(updates);
  }
}
