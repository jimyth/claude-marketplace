/**
 * init 命令 - 初始化项目配置
 */

import * as readline from 'readline';
import { getClient } from '../api.js';
import {
  loadProjectConfig,
  saveProjectConfig,
  printSuccess,
  printError,
} from '../config.js';
import type { InitCommandArgs, ProjectConfig, ProjectsResponse, ExecutionsResponse } from '../types.js';

/**
 * 创建 readline 接口
 */
function createReadlineInterface(): readline.ReadLine {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * 提问
 */
function question(rl: readline.ReadLine, prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * 生成任务类型关键词
 */
function generateTaskTypes(): ProjectConfig['taskTypes'] {
  return {
    devel: { name: '开发', keywords: ['开发', '实现', '编码', '功能', 'feature', 'devel'] },
    test: { name: '测试', keywords: ['测试', 'test', 'bug', '修复', '单元测试', '集成测试'] },
    design: { name: '设计', keywords: ['设计', 'design', '架构', '方案', 'UI'] },
    study: { name: '研究', keywords: ['研究', 'study', '调研', '学习', '技术选型'] },
    discuss: { name: '讨论', keywords: ['讨论', 'discuss', '会议', '沟通'] },
    ui: { name: '界面', keywords: ['界面', 'UI', '前端', '样式'] },
    affair: { name: '事务', keywords: ['事务', 'affair', '行政', '流程'] },
    misc: { name: '其他', keywords: ['其他', 'misc'] },
  };
}

/**
 * 初始化命令
 */
export async function initCommand(args: InitCommandArgs): Promise<void> {
  // 显示配置
  if (args.show) {
    const config = loadProjectConfig();
    if (!config) {
      console.log('未找到项目配置。请运行 /zd-init 初始化。');
      return;
    }
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const client = getClient();

  // 获取项目 ID
  let projectId = args.project;

  if (!projectId) {
    console.log('获取项目列表...');
    try {
      const result = await client.get<ProjectsResponse>('/projects');
      const projects = result.projects || [];

      console.log('\n项目列表:');
      for (const p of projects) {
        console.log(`[${p.id}] ${p.name} (${p.status})`);
      }
      console.log();

      const rl = createReadlineInterface();
      const input = await question(rl, '选择项目 ID: ');
      rl.close();

      projectId = parseInt(input, 10);
      if (isNaN(projectId)) {
        printError('无效的项目 ID');
        return;
      }
    } catch (e) {
      printError(`获取项目失败: ${e}`);
      return;
    }
  }

  // 获取项目信息
  console.log(`获取项目 #${projectId} 的执行列表...`);
  let projectName = '';

  try {
    const projectResult = await client.get<{ name: string }>(`/projects/${projectId}`);
    projectName = projectResult.name || `项目 ${projectId}`;

    const execsResult = await client.get<ExecutionsResponse>(`/projects/${projectId}/executions`);
    const executions = execsResult.executions || [];

    // 构建配置
    const config: ProjectConfig = {
      projectId,
      projectName,
      executions: executions.map((e) => ({
        id: e.id,
        name: e.name,
        status: e.status,
        keywords: [e.name.substring(0, 2)], // 简单提取前两个字符作为关键词
      })),
      defaultExecution: executions.find((e) => e.status === 'doing')?.id || executions[0]?.id || 0,
      taskTypes: generateTaskTypes(),
      defaults: {
        type: 'devel',
        pri: 3,
        estimate: 8,
      },
    };

    const configPath = saveProjectConfig(config);
    printSuccess(`配置已保存到 ${configPath}`);
    console.log('\n配置预览:');
    console.log(JSON.stringify(config, null, 2));
  } catch (e) {
    printError(`初始化失败: ${e}`);
  }
}
