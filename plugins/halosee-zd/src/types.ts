/**
 * 禅道 API 类型定义
 */

// 全局配置
export interface GlobalConfig {
  zentao: {
    url: string;
    token?: string;
    account: string;
    password: string;
  };
  cycle?: number; // 工时统计周期起始日
}

// 项目级配置
export interface ProjectConfig {
  projectId: number;
  projectName: string;
  executions: Execution[];
  defaultExecution: number;
  taskTypes: Record<string, TaskTypeConfig>;
  defaults: {
    type: string;
    pri: number;
    estimate: number;
  };
}

export interface Execution {
  id: number;
  name: string;
  status: string;
  keywords: string[];
}

export interface TaskTypeConfig {
  name: string;
  keywords: string[];
}

// API 响应类型
export interface ApiResponse<T> {
  id?: number;
  data?: T;
  error?: string;
  message?: string;
}

// 项目
export interface Project {
  id: number;
  name: string;
  status: string;
  code?: string;
  begin?: string;
  end?: string;
}

export interface ProjectsResponse {
  projects: Project[];
}

// 执行/迭代
export interface ExecutionDetail {
  id: number;
  name: string;
  status: string;
  begin?: string;
  end?: string;
}

export interface ExecutionsResponse {
  executions: ExecutionDetail[];
}

// 任务
export interface Task {
  id: number;
  name: string;
  type: string;
  pri: number;
  status: string;
  execution?: number;
  executionName?: string;
  estimate: number;
  consumed: number;
  left: number;
  estStarted?: string;
  realStarted?: string;
  deadline?: string;
  assignedTo?: {
    id: number;
    account: string;
    realname: string;
  };
  desc?: string;
  story?: number;
  finishedDate?: string;
}

export interface TaskCreateParams {
  name: string;
  type: string;
  pri: number;
  estimate: number;
  left: number;
  estStarted: string;
  deadline?: string;
  desc?: string;
  assignedTo: string;
  story?: number;
}

export interface TasksResponse {
  tasks: Task[];
}

// 命令参数类型
export interface ConfigCommandArgs {
  url?: string;
  account?: string;
  password?: string;
  cycle?: number;
  show?: boolean;
  test?: boolean;
}

export interface InitCommandArgs {
  project?: number;
  refresh?: boolean;
  show?: boolean;
}

export interface CreateTaskArgs {
  name: string;
  execution?: number;
  type?: string;
  pri?: number;
  estimate?: number;
  desc?: string;
  assignedTo?: string;
  story?: number;
  deadline?: string;
  noStart?: boolean;
}

export interface ListTasksArgs {
  status?: string;
  execution?: number;
}

export interface FinishTaskArgs {
  id: number;
  consumed?: number;
  note?: string;
}

export interface SumArgs {
  month?: string;
}
