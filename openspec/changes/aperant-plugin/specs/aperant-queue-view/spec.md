## ADDED Requirements

### Requirement: 显示所有任务队列总览

当用户调用 aperant Skill 时，系统 MUST 显示所有任务队列的总览，包括每个队列的任务数量。

#### Scenario: 显示队列总览
- **WHEN** 用户调用 `/aperant` 或 `/aperant show-queues`
- **THEN** 系统显示所有队列的总览，格式如下：
  ```
  📋 任务队列总览

  📋 Backlog (5)
  ⏳ Queue (3)
  🔄 In Progress (2)
  🤖 AI Review (1)
  👀 Human Review (0)
  ✅ Done (10)
  ```

### Requirement: 交互式选择队列查看详情

显示队列总览后，系统 MUST 提供交互式选择让用户选择要查看的队列详情。

#### Scenario: 用户选择队列
- **WHEN** 用户在队列总览中选择一个队列（如 "in_progress"）
- **THEN** 系统显示该队列中的所有任务列表

#### Scenario: 队列为空
- **WHEN** 用户选择一个空队列
- **THEN** 系统显示 "📭 此队列为空" 消息

### Requirement: 显示任务列表

当用户选择一个队列后，系统 MUST 显示该队列中的所有任务，包括任务 ID、标题、优先级和进度。

#### Scenario: 显示队列任务
- **WHEN** 用户选择 "in_progress" 队列
- **THEN** 系统显示任务列表，格式如下：
  ```
  🔄 In Progress (2)

  [003] 实现用户认证模块
    🔴 High
    🔵🔵⚪⚪ (2/4)

  [005] 优化数据库查询
    🟡 Medium
    🔵⚪⚪⚪ (1/4)
  ```

#### Scenario: 任务过多时分页显示
- **WHEN** 队列中任务超过 10 个
- **THEN** 系统分页显示，每页最多 10 个任务

### Requirement: 自动检测 Aperant 项目路径

系统 MUST 自动检测当前工作目录或环境变量中的 Aperant 项目路径。

#### Scenario: 从环境变量读取路径
- **WHEN** 环境变量 `APERANT_PROJECT_PATH` 已设置
- **THEN** 系统使用该路径作为 Aperant 项目路径

#### Scenario: 从 git 根目录检测
- **WHEN** 环境变量未设置且当前在 git 仓库中
- **THEN** 系统使用 git 根目录作为 Aperant 项目路径

#### Scenario: 使用当前目录
- **WHEN** 环境变量未设置且不在 git 仓库中
- **THEN** 系统使用当前工作目录作为 Aperant 项目路径
