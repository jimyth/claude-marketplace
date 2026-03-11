---
name: zd-complete
description: 完成一个禅道任务
argument-hint: --id <任务ID> [--consumed <工时>] [--note <备注>]
disable-model-invocation: true
allowed-tools: Bash
---

# 完成禅道任务

将禅道任务标记为"已完成"。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../scripts/zentao-api.sh"
```

## 执行前确认

完成任务前，请先**查看进行中的任务**确认任务 ID：
```bash
bash "$ZD_SCRIPT" list --status doing
```

## 使用方法

```bash
# 完成任务（默认消耗 1 小时）
bash "$ZD_SCRIPT" finish --id <task_id>

# 指定实际消耗工时
bash "$ZD_SCRIPT" finish --id <task_id> --consumed 4

# 添加完成备注
bash "$ZD_SCRIPT" finish --id <task_id> --consumed 4 --note "功能完成，测试通过"
```

## 参数说明

| 参数 | 说明 | 必填 | 默认值 |
|------|------|------|--------|
| --id | 任务 ID | 是 | - |
| --consumed | 本次消耗工时 | 否 | 1 |
| --note | 完成备注 | 否 | - |

## 注意事项

- 只能完成状态为 `doing` 的任务
- 如果任务状态是 `wait`，需要先执行 start 命令
- 完成后任务状态变为 `done`
