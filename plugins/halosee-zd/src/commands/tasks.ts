/**
 * tasks 命令 - 任务管理
 */

import { getClient } from '../api.js';
import {
  loadProjectConfig,
  inferExecution,
  inferTaskType,
  printSuccess,
  printError,
} from '../config.js';
import type {
  CreateTaskArgs,
  ListTasksArgs,
  FinishTaskArgs,
  Task,
  TasksResponse,
  ApiResponse,
} from '../types.js';

/**
 * 创建任务
 */
export async function createTask(args: CreateTaskArgs): Promise<void> {
  const client = getClient();

  // 检查项目配置
  const config = loadProjectConfig();
  let execution = args.execution;
  let type = args.type;
  let pri = args.pri;
  let estimate = args.estimate;

  if (config) {
    console.log('使用项目配置 .zd-project.json');

    if (!execution) {
      execution = inferExecution(args.name, args.desc || '', config);
      console.log(`自动推断执行: ${execution}`);
    }

    if (!type) {
      type = inferTaskType(args.name, args.desc || '', config);
      console.log(`自动推断类型: ${type}`);
    }

    if (pri === undefined) {
      pri = config.defaults.pri;
    }

    if (estimate === undefined) {
      estimate = config.defaults.estimate;
    }
  } else {
    // 无配置时使用默认值
    type = type || 'devel';
    pri = pri ?? 3;
    estimate = estimate ?? 8;
  }

  if (!execution) {
    printError('需要指定执行 ID。请使用 --execution 参数或运行 /zd-init 配置默认值');
    return;
  }

  // 默认指派给自己
  const assignedTo = args.assignedTo || process.env.ZENTAO_ACCOUNT || '';

  // 构建请求数据
  const today = new Date().toISOString().split('T')[0];
  const deadline = args.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const taskData: Record<string, any> = {
    name: args.name,
    type: type,
    pri: pri,
    estimate: estimate,
    left: estimate,
    estStarted: today,
    deadline: deadline,
    desc: args.desc || '',
    assignedTo: assignedTo,
  };

  // 添加 module 参数（从配置或参数获取）
  const module = args.module ?? config?.defaultModule;
  if (module !== undefined) {
    taskData.module = module;
  }

  // 添加 parent 参数（从配置或参数获取）
  const parent = args.parent ?? config?.parentTask;
  if (parent !== undefined) {
    taskData.parent = parent;
  }

  // 移除 undefined 值
  const cleanData = Object.fromEntries(
    Object.entries(taskData).filter(([_, v]) => v !== null && v !== undefined)
  );

  console.log('创建任务...');

  try {
    const result = await client.post<any>(
      `/executions/${execution}/tasks`,
      cleanData
    );

    // 禅道 API 直接返回任务对象，ID 在 result.id 中
    const taskId = result.id;
    if (!taskId) {
      printError('创建任务失败: 未返回任务 ID');
      if (result.result === 'fail' && result.message) {
        console.log('API 错误详情:', JSON.stringify(result.message, null, 2));
      }
      return;
    }

    printSuccess(`任务 #${taskId} 已创建: ${args.name} (指派给: ${assignedTo})`);

    // 设置父任务（通过更新 API）
    if (parent !== undefined) {
      console.log(`设置父任务 #${parent}...`);
      try {
        await client.put(`/tasks/${taskId}`, { parent: parent });
        printSuccess(`任务已关联到父任务 #${parent}`);
      } catch (e) {
        console.log(`警告: 设置父任务失败: ${e}`);
      }
    }

    // 自动启动任务
    if (!args.noStart) {
      console.log(`启动任务 #${taskId}...`);
      try {
        await client.post(`/tasks/${taskId}/start`, {
          left: estimate,
          assignedTo: assignedTo,
        });
        printSuccess(`任务 #${taskId} 已启动`);
      } catch (e) {
        console.log(`警告: 启动任务失败: ${e}`);
      }
    }
  } catch (e) {
    printError(`创建任务失败: ${e}`);
  }
}

/**
 * 列出任务
 */
export async function listTasks(args: ListTasksArgs): Promise<void> {
  const client = getClient();

  if (args.execution) {
    console.log(`获取执行 #${args.execution} 的任务...`);
    try {
      const result = await client.get<TasksResponse>(`/executions/${args.execution}/tasks`);
      let tasks = result.tasks || [];

      if (args.status) {
        tasks = tasks.filter((t) => t.status === args.status);
      }

      printTasks(tasks);
    } catch (e) {
      printError(`获取任务失败: ${e}`);
    }
    return;
  }

  // 遍历所有执行获取任务
  console.log('从所有可访问的执行获取任务...');
  // TODO: 实现遍历逻辑
  printError('请使用 --execution 参数指定执行 ID');
}

/**
 * 查看任务详情
 */
export async function viewTask(taskId: number): Promise<void> {
  const client = getClient();

  try {
    const task = await client.get<Task>(`/tasks/${taskId}`);
    console.log(JSON.stringify({
      id: task.id,
      name: task.name,
      status: task.status,
      type: task.type,
      pri: task.pri,
      executionName: task.executionName,
      estimate: task.estimate,
      consumed: task.consumed,
      left: task.left,
      estStarted: task.estStarted,
      realStarted: task.realStarted,
      assignedTo: task.assignedTo?.account,
      deadline: task.deadline,
      desc: task.desc,
    }, null, 2));
  } catch (e) {
    printError(`获取任务失败: ${e}`);
  }
}

/**
 * 启动任务
 */
export async function startTask(taskId: number): Promise<void> {
  const client = getClient();

  try {
    const task = await client.get<Task>(`/tasks/${taskId}`);
    const left = task.left || task.estimate || 1;

    await client.post(`/tasks/${taskId}/start`, {
      left: left,
      assignedTo: task.assignedTo?.account || '',
    });

    printSuccess(`任务 #${taskId} 已启动: ${task.name}`);
  } catch (e) {
    printError(`启动任务失败: ${e}`);
  }
}

/**
 * 完成任务
 */
export async function finishTask(args: FinishTaskArgs): Promise<void> {
  const client = getClient();

  const consumed = args.consumed || 1;
  const finishedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const data: Record<string, unknown> = {
    consumed: consumed,
    currentConsumed: consumed,
    left: 0,
    finishedDate: finishedDate,
  };

  if (args.note) {
    data.comment = args.note;
  }

  try {
    await client.post(`/tasks/${args.id}/finish`, data);
    printSuccess(`任务 #${args.id} 已完成`);
  } catch (e) {
    printError(`完成任务失败: ${e}`);
  }
}

/**
 * 打印任务列表
 */
function printTasks(tasks: Task[]): void {
  if (tasks.length === 0) {
    console.log('没有任务');
    return;
  }

  console.log(`\n共 ${tasks.length} 个任务:`);
  console.log('ID\t名称\t\t\t状态\t执行');
  console.log('-'.repeat(50));
  for (const t of tasks) {
    const name = t.name.length > 20 ? t.name.substring(0, 20) + '...' : t.name;
    console.log(`${t.id}\t${name}\t\t${t.status}\t${t.executionName || '无'}`);
  }
}
