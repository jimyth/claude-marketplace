# Jimyth Skills

A plugin marketplace for Claude Code.

## Installation

### 1. Add the marketplace

```bash
/plugin marketplace add jimyth/claude-marketplace
```

### 2. Install a plugin

```bash
/plugin install tgbot@jimyth-skills
/plugin install halosee-zd@jimyth-skills
/plugin install memoria-integration@jimyth-skills
/plugin install aperant@jimyth-skills
```

## Available Plugins

### tgbot

Generate complete Telegram Bot projects with python-telegram-bot.

- Python 3.9+ compatible
- Task management with inline keyboards
- Real-time status updates
- Async/await support

### halosee-zd

禅道任务管理插件 - 创建、查看、完成禅道任务并统计工时。

- 禅道 API 集成
- 工时统计周期管理
- 项目/任务/需求多维度操作

### memoria-integration

自主记忆系统 — 跨会话、跨项目的持久化 LLM 记忆。

- **Hooks**: 会话启动自动加载记忆、配置文件变更自动更新知识、会话结束自动归档
- **MCP 集成**: 通过 SSE 连接 Memoria 服务，支持 addMemory / searchMemory / updateMemory / deleteMemory
- **项目隔离**: 通过 URL 参数 `?project_id=xxx` 实现多项目数据隔离
- **Agent**: memory-agent 提供专业记忆管理能力

安装后需配置 MCP Server URL：

1. `/plugin` → 选择 `memoria-integration` → "Configure options"
2. 填入 Memoria 服务地址，如 `http://192.168.50.5:28081/sse`
3. 重启 Claude Code 会话

### aperant

Aperant 任务管理插件 - 在 Claude Code 中管理 Aperant 项目任务。

- 队列总览与交互式操作
- 任务创建、状态转换
- OpenSpec 工作流集成

## Project Structure

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── tgbot/
    ├── halosee-zd/
    ├── memoria-integration/
    └── aperant/
```

## License

MIT
