## 1. 插件基础结构

- [x] 1.1 创建 `plugins/aperant/` 目录结构
- [x] 1.2 创建 `plugins/aperant/.claude-plugin/plugin.json`
- [x] 1.3 创建 `plugins/aperant/skills/aperant/` 目录
- [x] 1.4 创建 `scripts/` 和 `templates/` 子目录

## 2. SKILL.md 主文件

- [x] 2.1 创建 `SKILL.md` 文件，添加 frontmatter 配置
- [x] 2.2 实现队列总览显示逻辑
- [x] 2.3 实现交互式队列选择逻辑（使用 AskUserQuestion）
- [x] 2.4 实现任务列表显示逻辑
- [x] 2.5 实现交互式任务选择逻辑
- [x] 2.6 实现任务详情显示逻辑
- [x] 2.7 实现操作选项显示逻辑
- [x] 2.8 实现任务创建逻辑（create 参数）

## 3. 辅助脚本

- [x] 3.1 创建 `scripts/queue.sh` - 队列查询脚本
- [x] 3.2 创建 `scripts/task.sh` - 任务操作脚本
- [x] 3.3 创建 `scripts/create.sh` - 任务创建脚本
- [x] 3.4 创建 `templates/task_metadata.json.template` 模板文件

## 4. 核心功能实现

- [x] 4.1 实现自动检测 Aperant 项目路径
- [x] 4.2 实现读取 .auto-claude/specs/ 目录
- [x] 4.3 实现任务元数据解析和聚合
- [x] 4.4 实现按状态分组任务
- [x] 4.5 实现任务 ID 自动生成（3 位数字）
- [x] 4.6 实现状态转换规则验证

## 5. 交互体验优化

- [x] 5.1 添加状态图标和优先级图标
- [x] 5.2 实现任务进度显示（已完成/总数）
- [x] 5.3 实现错误处理和用户友好的错误消息
- [x] 5.4 实现分页显示（队列任务超过 10 个时）

## 6. 集成和文档

- [x] 6.1 更新 `.claude-plugin/marketplace.json` 注册新插件
- [x] 6.2 创建 `README.md` 文档，说明插件使用方法
- [x] 6.3 添加使用示例到 README

## 7. 验证和测试

- [ ] 7.1 验证插件在 Aperant 项目中正常工作
- [ ] 7.2 测试完整的交互流程（查看队列 → 选择任务 → 执行操作）
- [ ] 7.3 测试任务创建功能
- [ ] 7.4 测试错误处理场景
