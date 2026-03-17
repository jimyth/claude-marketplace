## ADDED Requirements

### Requirement: 创建新的 Planning 任务

系统 MUST 允许用户在 Claude Code 内直接创建新的 Planning 阶段任务。

#### Scenario: 通过命令创建任务
- **WHEN** 用户调用 `/aperant create <任务标题>`
- **THEN** 系统创建新的任务目录和元数据文件

#### Scenario: 交互式创建任务
- **WHEN** 用户选择 "创建新任务" 选项
- **THEN** 系统提示用户输入任务标题，然后创建任务

### Requirement: 生成任务目录结构

创建任务时，系统 MUST 在 `.auto-claude/specs/` 目录下创建新的任务目录。

#### Scenario: 创建任务目录
- **WHEN** 系统创建新任务
- **THEN** 系统执行以下操作：
  1. 查找现有任务数量，生成新的 3 位数字 ID（如 006）
  2. 创建目录 `.auto-claude/specs/<id>-<kebab-title>/`
  3. 在目录中创建 `task_metadata.json` 文件

### Requirement: 生成任务元数据

创建任务时，系统 MUST 生成符合 Aperant 规范的 `task_metadata.json` 文件。

#### Scenario: 生成元数据文件
- **WHEN** 系统创建新任务
- **THEN** 系统生成包含以下字段的 `task_metadata.json`：
  - `id`: 任务 ID（如 "006"）
  - `title`: 任务标题
  - `description`: 任务描述（可选，默认为空）
  - `status`: "backlog"（新任务默认状态）
  - `priority`: "medium"（默认优先级）
  - `category`: "feature"（默认分类）
  - `createdAt`: 当前时间（ISO 8601 格式）
  - `updatedAt`: 当前时间（ISO 8601 格式）

#### Scenario: 从对话上下文生成描述
- **WHEN** 用户在创建任务前与 LLM 进行了对话
- **THEN** 系统询问是否将对话内容作为任务描述

### Requirement: 创建成功确认

任务创建成功后，系统 MUST 显示确认消息和后续操作选项。

#### Scenario: 显示创建成功消息
- **WHEN** 任务创建成功
- **THEN** 系统显示：
  ```
  ✅ 任务创建成功！

  📁 任务 ID: 006
  📝 标题: 实现用户认证模块
  📋 状态: Backlog

  🔗 后续操作:
     - 查看任务详情
     - 移动到 Queue
     - 返回队列列表
  ```

#### Scenario: 创建失败
- **WHEN** 任务创建失败（如目录已存在）
- **THEN** 系统显示错误消息："❌ 创建失败: <错误原因>"
