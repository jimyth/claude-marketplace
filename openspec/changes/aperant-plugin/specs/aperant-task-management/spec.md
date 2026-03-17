## ADDED Requirements

### Requirement: 查看任务详情

当用户在任务列表中选择一个任务后，系统 MUST 显示该任务的详细信息。

#### Scenario: 显示任务详情
- **WHEN** 用户在任务列表中选择一个任务（如 "003"）
- **THEN** 系统显示任务详情，包括：
  - 任务 ID
  - 标题
  - 描述
  - 当前状态
  - 优先级
  - 进度（已完成/总数）
  - 创建时间
  - 更新时间
  - 错误信息（如果有）

### Requirement: 交互式任务操作

显示任务详情后，系统 MUST 提供交互式操作选项让用户选择要执行的操作。

#### Scenario: 显示操作选项
- **WHEN** 用户查看任务详情
- **THEN** 系统显示可用操作选项：
  - [查看日志]
  - [移动到 Backlog]
  - [移动到 Queue]
  - [移动到 In Progress]
  - [移动到 AI Review]
  - [移动到 Human Review]
  - [移动到 Done]
  - [返回队列列表]

#### Scenario: 根据当前状态过滤选项
- **WHEN** 任务当前状态为 "in_progress"
- **THEN** 系统隐藏 "移动到 In Progress" 选项

### Requirement: 移动任务到其他队列

当用户选择移动操作时，系统 MUST 更新任务的 `task_metadata.json` 中的状态字段。

#### Scenario: 成功移动任务
- **WHEN** 用户选择 "移动到 Done"
- **THEN** 系统执行以下操作：
  1. 读取任务的 `task_metadata.json`
  2. 更新 `status` 字段为 "done"
  3. 保存文件
  4. 显示 "✅ 任务已移动到 Done" 消息

#### Scenario: 移动失败
- **WHEN** 移动任务时发生错误（如文件不存在）
- **THEN** 系统显示错误消息："❌ 移动失败: <错误原因>"

### Requirement: 查看任务日志

当用户选择查看日志时，系统 MUST 显示任务的最近日志内容。

#### Scenario: 显示任务日志
- **WHEN** 用户选择 "查看日志"
- **THEN** 系统显示任务日志文件（`task.log`）的最后 50 行

#### Scenario: 日志文件不存在
- **WHEN** 任务没有日志文件
- **THEN** 系统显示 "📭 暂无日志" 消息
