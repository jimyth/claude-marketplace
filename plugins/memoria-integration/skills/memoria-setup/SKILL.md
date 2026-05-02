---
name: memoria-setup
description: 配置 Memoria 记忆系统连接信息
argument-hint: [--show|--test]
disable-model-invocation: true
allowed-tools: Bash
---

# 配置 Memoria 连接

设置 Memoria MCP Server 地址，完成插件初始化。

## 配置步骤

### 1. 打开插件配置

运行 `/plugin` 命令，选择 `memoria-integration`，点击 "Configure options"。

### 2. 填写 MCP Server URL

在 `mcp_server_url` 字段填入 Memoria 服务地址：

| 场景 | URL 示例 |
|------|---------|
| 本地开发 | `http://localhost:8081/sse` |
| 局域网部署 | `http://192.168.50.5:28081/sse` |
| 指定项目隔离 | `http://192.168.50.5:28081/sse?project_id=my-project` |

### 3. 验证连接

配置完成后，运行以下命令验证 MCP 连接是否正常：

```bash
curl -s -o /dev/null -w "%{http_code}" "${MEMORIA_MCP_URL:-http://localhost:8081/sse}"
```

返回 200 表示连接正常。

### 4. 重新加载

配置完成后，重启 Claude Code 会话使 hooks 和 MCP 连接生效。

## URL 格式说明

```
http://<host>:<port>/sse[?project_id=<project-name>]
```

- `project_id` 参数可选，用于项目级数据隔离
- 不同项目使用不同的 `project_id` 即可完全隔离记忆数据
- 不传 `project_id` 时默认使用 `"default"` 项目

## 参数

| 参数 | 说明 |
|------|------|
| --show | 显示当前配置 |
| --test | 测试 MCP 连接 |
