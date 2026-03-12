/**
 * projects/executions 命令 - 项目和执行管理
 */

import { getClient } from '../api.js';
import { printError, printSuccess } from '../config.js';
import type { ProjectsResponse, ExecutionsResponse, Project, ExecutionDetail } from '../types.js';

/**
 * 列出所有项目
 */
export async function listProjects(): Promise<void> {
  const client = getClient();
  console.log('获取项目列表...');

  try {
    const result = await client.get<ProjectsResponse>('/projects');
    const projects = result.projects || [];

    if (projects.length === 0) {
      console.log('没有可访问的项目');
      return;
    }

    console.log('\n项目列表:');
    console.log('ID\t名称\t\t\t状态');
    console.log('-'.repeat(40));
    for (const p of projects) {
      console.log(`${p.id}\t${p.name}\t\t${p.status}`);
    }
  } catch (e) {
    printError(`获取项目失败: ${e}`);
  }
}

/**
 * 列出项目的执行/迭代
 */
export async function listExecutions(projectId: number): Promise<void> {
  const client = getClient();
  console.log(`获取项目 #${projectId} 的执行列表...`);

  try {
    const result = await client.get<ExecutionsResponse>(`/projects/${projectId}/executions`);
    const executions = result.executions || [];

    if (executions.length === 0) {
      console.log('该项目没有执行');
      return;
    }

    console.log('\n执行列表:');
    console.log('ID\t名称\t\t状态');
    console.log('-'.repeat(30));
    for (const e of executions) {
      console.log(`${e.id}\t${e.name}\t\t${e.status}`);
    }
  } catch (e) {
    printError(`获取执行失败: ${e}`);
  }
}
