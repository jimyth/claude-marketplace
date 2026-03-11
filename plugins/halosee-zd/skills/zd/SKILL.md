---
name: zd
description: 禅道任务管理 - 显示帮助信息和可用命令
argument-hint: [command]
disable-model-invocation: true
allowed-tools: Bash
---

# 禅道任务管理

禅道任务同步插件，用于创建和管理禅道任务。

## 脚本路径

```bash
# 动态查找插件脚本（按优先级：缓存目录 > 用户级）
ZD_SCRIPT="$(find ~/.claude/plugins/cache -path '*/halosee-zd/*/scripts/zentao-api.sh' 2>/dev/null | head -1)"
[ -z "$ZD_SCRIPT" ] && ZD_SCRIPT="$HOME/.claude/plugins/halosee-zd/scripts/zentao-api.sh"
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `/zd-config` | 配置禅道服务器连接信息 |
| `/zd-create` | 创建禅道任务 |
| `/zd-list` | 查看我的任务列表 |
| `/zd-complete` | 完成一个禅道任务 |
| `/zd-sum` | 统计指定周期的任务工时 |

## 快速开始

### 1. 首次配置

```bash
bash "$ZD_SCRIPT" config --url http://your-zentao-server:8080
bash "$ZD_SCRIPT" config --account your_account
bash "$ZD_SCRIPT" config --password your_password
bash "$ZD_SCRIPT" config --test
```

### 2. 创建任务

```bash
bash "$ZD_SCRIPT" create --name "实现登录功能" --execution 7
```

### 3. 查看任务

```bash
bash "$ZD_SCRIPT" list
```

### 4. 完成任务

```bash
bash "$ZD_SCRIPT" finish --id <任务ID>
```

## 配置存储

配置文件位置: `~/.zentao-sync/config.json`

## 依赖

- curl (HTTP 请求)
- jq (JSON 处理)
- 禅道 RESTful API v1
