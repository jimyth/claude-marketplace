#!/usr/bin/env node
/**
 * Memoria Bridge — Hook 事件处理脚本
 *
 * 用法:
 *   node memoria-bridge.js --event=session_start
 *   node memoria-bridge.js --event=post_write
 *   node memoria-bridge.js --event=session_end
 *
 * 输出: JSON (hookSpecificOutput 格式) 到 stdout
 */

const { execSync } = require('child_process');
const path = require('path');

// ==================== 项目检测 ====================

function detectProjectId() {
  try {
    const remoteUrl = execSync('git remote get-url origin 2>/dev/null', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    // 从 remote URL 提取项目名
    // https://github.com/org/project.git → project
    // git@github.com:org/project.git → project
    const match = remoteUrl.match(/\/([^\/]+?)(?:\.git)?$/);
    if (match) {
      return match[1];
    }
  } catch (_) {
    // git remote 不可用，回退到目录名
  }

  // 回退：使用当前工作目录名
  return path.basename(process.cwd());
}

// ==================== 事件处理器 ====================

function handleSessionStart() {
  const projectId = detectProjectId();
  const timestamp = new Date().toISOString().split('T')[0];

  const additionalContext = [
    '<memoria-context>',
    '你有一个长期记忆系统（Memoria）可用。系统通过 MCP 工具提供以下能力：',
    '',
    '可用工具（通过 memoria MCP Server）：',
    '- addMemory: 存储新记忆（名称、内容、类型、项目ID、元数据）',
    '- searchMemory: 搜索记忆（混合搜索：向量 + 关键词）',
    '- updateMemory: 更新已有记忆（ID + 新内容）',
    '- deleteMemory: 删除记忆（软删除）',
    '',
    `当前项目: ${projectId}`,
    `日期: ${timestamp}`,
    '',
    '## 会话启动操作',
    '请立即执行以下操作加载记忆上下文：',
    `1. 调用 searchMemory(query="项目架构 约定 配置", project_id="${projectId}") 加载项目知识`,
    `2. 调用 searchMemory(query="用户偏好 编程风格 常用工具", project_id="${projectId}") 加载用户偏好`,
    `3. 调用 searchMemory(query="未完成任务 待办 TODO", project_id="${projectId}") 加载任务上下文`,
    '',
    '## 记忆使用规则',
    '1. 当你学到关于用户的新偏好 → 调用 addMemory 记录为 USER_PROFILE 类型',
    '2. 当你发现项目架构变化 → 调用 addMemory 记录为 PROJECT_KNOWLEDGE 类型',
    '3. 当你解决了一个难题 → 调用 addMemory 记录为 LESSON_LEARNED 类型',
    '4. 当你发现已有记忆过时 → 调用 updateMemory 更新（系统会自动跟踪演化）',
    '5. 不要重复记录已有信息，先 searchMemory 确认',
    '6. 记忆内容用中文',
    '',
    '## 元数据约定',
    '存储记忆时使用以下 metadata 字段：',
    '- memory_type: USER_PROFILE | PROJECT_KNOWLEDGE | TASK_CONTEXT | LESSON_LEARNED',
    '- auto_load: true（会话启动时自动加载的记忆）',
    '- source: "memoria-agent"',
    '</memoria-context>'
  ].join('\n');

  outputHookResponse('SessionStart', additionalContext);
}

function handlePostWrite() {
  // PostToolUse 事件：检查是否需要更新项目知识
  const toolInput = process.env.TOOL_INPUT || '{}';

  let filePath = '';
  try {
    const parsed = JSON.parse(toolInput);
    filePath = parsed.file_path || parsed.path || '';
  } catch (_) {
    // 忽略解析错误
  }

  // 只对关键配置文件输出提示
  const configPatterns = [
    'pom.xml', 'build.gradle', 'package.json',
    'application.yml', 'application.properties',
    'checkstyle.xml', '.eslintrc',
    'CLAUDE.md', 'README.md'
  ];

  const isConfigFile = configPatterns.some(pattern =>
    filePath.toLowerCase().includes(pattern.toLowerCase())
  );

  if (!isConfigFile) {
    // 非配置文件变更，不输出任何内容（静默跳过）
    process.exit(0);
  }

  const projectId = detectProjectId();

  const additionalContext = [
    '<memoria-file-change>',
    `检测到配置文件变更: ${filePath}`,
    `项目: ${projectId}`,
    '',
    '如果此变更影响了项目架构、技术栈或开发约定，',
    `请调用 searchMemory(query="${path.basename(filePath)}", project_id="${projectId}") 检查现有记忆，`,
    '然后使用 updateMemory 或 addMemory 更新项目知识。',
    '</memoria-file-change>'
  ].join('\n');

  outputHookResponse('PostToolUse', additionalContext);
}

function handleSessionEnd() {
  const additionalContext = [
    '<memoria-session-end>',
    '会话即将结束。请检查本次会话是否有需要归档的信息：',
    '',
    '1. 是否学到了关于用户的新偏好？ → addMemory(type=USER_PROFILE)',
    '2. 是否有未完成的任务需要记录？ → addMemory(type=TASK_CONTEXT)',
    '3. 是否解决了值得记录的难题？ → addMemory(type=LESSON_LEARNED)',
    '4. 是否发现已有记忆需要更新？ → updateMemory',
    '',
    '不需要归档的内容不要强制记录。只记录真正有价值的信息。',
    '</memoria-session-end>'
  ].join('\n');

  outputHookResponse('SessionEnd', additionalContext);
}

// ==================== 输出格式化 ====================

function outputHookResponse(eventName, additionalContext) {
  const response = {
    hookSpecificOutput: {
      hookEventName: eventName,
      additionalContext: additionalContext
    }
  };

  // 直接输出 JSON（Claude Code 会解析 hookSpecificOutput）
  process.stdout.write(JSON.stringify(response) + '\n');
}

// ==================== 主入口 ====================

const args = process.argv.slice(2);
const eventArg = args.find(a => a.startsWith('--event='));

if (!eventArg) {
  process.stderr.write('Usage: node memoria-bridge.js --event=session_start|post_write|session_end\n');
  process.exit(1);
}

const event = eventArg.replace('--event=', '');

switch (event) {
  case 'session_start':
    handleSessionStart();
    break;
  case 'post_write':
    handlePostWrite();
    break;
  case 'session_end':
    handleSessionEnd();
    break;
  default:
    process.stderr.write(`Unknown event: ${event}\n`);
    process.exit(1);
}
