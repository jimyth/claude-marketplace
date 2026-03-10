---
name: zd-list
description: 查看我的禅道任务列表
argument-hint: [--status wait|doing|done]
---

# 查看我的任务

查看指派给当前用户的任务列表。

## 脚本路径

```bash
# 动态查找插件脚本（按优先级：缓存目录 > 用户级）
ZD_SCRIPT="$(find ~/.claude/plugins/cache -path '*/halosee-zd/*/scripts/zentao-api.sh' 2>/dev/null | head -1)"
[ -z "$ZD_SCRIPT" ] && ZD_SCRIPT="$HOME/.claude/plugins/halosee-zd/scripts/zentao-api.sh"
```

## 使用方法

```bash
# 查看所有我的任务
bash "$ZD_SCRIPT" list

# 只看未开始的任务
bash "$ZD_SCRIPT" list --status wait

# 只看进行中的任务
bash "$ZD_SCRIPT" list --status doing

# 只看已完成的任务
bash "$ZD_SCRIPT" list --status done
```

## 任务状态

| 状态 | 说明 |
|------|------|
| wait | 未开始 |
| doing | 进行中 |
| done | 已完成 |
| pause | 暂停 |
| cancel | 已取消 |
| closed | 已关闭 |

## 后续操作

```bash
# 查看任务详情
bash "$ZD_SCRIPT" view <task_id>

# 开始任务
bash "$ZD_SCRIPT" start --id <task_id>

# 完成任务
bash "$ZD_SCRIPT" finish --id <task_id>
```
