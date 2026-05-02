---
name: autonomous-memory
description: 自主记忆管理 — 指导 LLM 何时/如何使用 Memoria 长期记忆系统进行上下文记忆的存取和演化
---

# 自主记忆管理

## 概述

你有一个长期记忆系统（Memoria）可用。该系统提供 4 个 MCP 工具，让你能跨会话、跨项目地记忆和检索信息。

**本 Skill 定义你使用记忆系统的完整规则。**

## 可用工具

通过 `memoria` MCP Server：

| 工具 | 用途 | 何时使用 |
|------|------|----------|
| `addMemory` | 存储新记忆 | 发现新信息时 |
| `searchMemory` | 搜索记忆 | 需要历史上下文时 |
| `updateMemory` | 更新记忆 | 发现已有记忆过时时 |
| `deleteMemory` | 删除记忆 | 记忆完全无效时（极少使用） |

## 四类记忆

| 类型 | 说明 | 共享范围 | 何时记录 |
|------|------|----------|----------|
| USER_PROFILE | 用户偏好、编码风格、常用工具 | 全局 | 用户表达偏好时 |
| PROJECT_KNOWLEDGE | 架构决策、技术栈、模块关系 | 项目级 | 发现项目结构信息时 |
| TASK_CONTEXT | 当前任务、待办事项、进展 | 项目级 | 任务开始/更新/完成时 |
| LESSON_LEARNED | 踩坑经验、调试技巧 | 全局 | 解决复杂问题后 |

## 操作流程

### 会话开始（自动触发）

当 `session_start` Hook 注入 `<memoria-context>` 时：

1. 读取注入的项目 ID 和搜索指令
2. 执行 3 次 `searchMemory` 调用加载上下文：
   - 项目知识（架构、约定、配置）
   - 用户偏好（编程风格、常用工具）
   - 任务上下文（未完成的待办）
3. 将加载的记忆整合到你的理解中
4. 如果搜索结果为空，说明这是新项目，正常继续

### 会话中 — 记忆检索

当用户提问涉及以下内容时，主动搜索记忆：
- "之前我们是怎么..." → searchMemory
- "这个项目的架构是..." → searchMemory
- "我记得说过..." → searchMemory
- "上次的任务进展..." → searchMemory

搜索技巧：
```
searchMemory(query="关键词描述", project_id="当前项目ID")
```

### 会话中 — 记忆记录

**判断标准 — shouldRemember():**

以下情况主动记录：
1. 用户说"记住"、"记住这个"、"下次记得" → 立即记录
2. 用户表达了明确的偏好（"我喜欢用..."、"我们项目用..."）→ USER_PROFILE
3. 发现项目的技术决策或架构约定 → PROJECT_KNOWLEDGE
4. 解决了非平凡的 bug 或技术难题 → LESSON_LEARNED
5. 用户布置了跨会话的任务 → TASK_CONTEXT

以下情况不要记录：
- 临时问题（"这个函数是做什么的"）
- 通用知识（"什么是 REST"）
- 已有记录的重复信息

**去重检查：**
```
// 记录前先搜索
searchMemory(query="相关关键词") → 如果已存在 → updateMemory → 如果不存在 → addMemory
```

**记录模板：**
```
addMemory(
  name: "简短标题（10字内）",
  content: "详细描述（包含 enough context 让未来的你能理解）",
  content_type: "MARKDOWN",
  project_id: "项目ID 或省略（全局记忆）",
  metadata: {
    memory_type: "USER_PROFILE | PROJECT_KNOWLEDGE | TASK_CONTEXT | LESSON_LEARNED",
    auto_load: true,  // 会话启动时自动加载的记忆
    source: "memoria-agent"
  }
)
```

### 会话中 — 记忆更新

当发现已有记忆需要更新时：
1. `searchMemory` 找到旧记忆，记录其 ID
2. `updateMemory(id="记忆ID", content="更新后的完整内容", project_id="项目ID")`
3. 系统自动保留旧版本，创建 SUPERSEDED_BY 关系

### 会话结束

当 `session_end` Hook 触发时，检查是否有未归档的信息：
- 学到了新偏好 → addMemory
- 有未完成任务 → addMemory(TASK_CONTEXT)
- 解决了难题 → addMemory(LESSON_LEARNED)
- 发现过时记忆 → updateMemory

## 项目隔离

- `project_id` 为 null/省略 → 全局记忆（USER_PROFILE, LESSON_LEARNED）
- `project_id` 有值 → 项目记忆（PROJECT_KNOWLEDGE, TASK_CONTEXT）
- 搜索时：先查项目级，再查全局，合并结果

## 配置文件变更

当 `post_write` Hook 检测到配置文件变更（pom.xml, application.yml 等）时：
1. Hook 输出 `<memoria-file-change>` 提示
2. 你应该检查变更是否影响项目知识
3. 如果影响 → searchMemory 确认 → updateMemory 或 addMemory

## 约束

<HARD-GATE>
- 记忆内容使用中文
- 不要记录敏感信息（密码、密钥、token、.env 内容）
- 每次会话最多新增 5 条记忆
- 搜索结果超过 10 条时，只展示最相关的 5 条
- 不要为了记录而记录，只记录有长期价值的信息
- 不记录可以从代码中直接推导的信息
</HARD-GATE>
