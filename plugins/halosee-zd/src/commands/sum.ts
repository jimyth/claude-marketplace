/**
 * sum 命令 - 工时统计
 */

import { getClient } from '../api.js';
import { loadGlobalConfig, printError } from '../config.js';
import type { SumArgs, Task } from '../types.js';

/**
 * 计算工时统计周期
 */
function getStatPeriod(month: string): { start: Date; end: Date } {
  const cycle = loadGlobalConfig()?.cycle || 24;

  // 解析月份，格式为 YYYYMM
  const year = parseInt(month.substring(0, 4), 10);
  const mon = parseInt(month.substring(4, 6), 10);

  // 计算开始日期（上个月 cycle 号）
  let startYear = year;
  let startMon = mon - 1;
  if (startMon < 1) {
    startMon = 12;
    startYear--;
  }

  const start = new Date(startYear, startMon - 1, cycle);

  // 计算结束日期（本月 cycle 号）
  const end = new Date(year, mon - 1, cycle);

  return { start, end };
}

/**
 * 工时统计命令
 */
export async function sumCommand(args: SumArgs): Promise<void> {
  // 如果没有指定月份，使用当前月
  let month = args.month;
  if (!month) {
    const now = new Date();
    month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  console.log(`统计 ${month} 的工时...`);

  try {
    const { start, end } = getStatPeriod(month);
    console.log(`周期: ${start.toISOString().split('T')[0]} ~ ${end.toISOString().split('T')[0]}`);

    // 获取任务列表（这里需要遍历所有执行获取任务）
    // 简化实现：从项目配置读取执行 ID
    // TODO: 实现完整的遍历逻辑

    printError('工时统计功能暂未完全实现');
  } catch (e) {
    printError(`统计失败: ${e}`);
  }
}
