---
name: zd-list
description: 查看我的禅道任务列表
argument-hint: [--status wait|doing|done] [--execution <id>]
disable-model-invocation: true
allowed-tools: Bash
---

# 查看我的任务

查看指派给当前用户的任务列表。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../src/index.ts"
```

## 使用方法

### 查看指定执行的任务

```bash
# 查看执行 #7 下的任务
npx tsx "$ZD_SCRIPT" list --execution 7

# 查看执行 #7 下进行中的任务
npx tsx "$ZD_SCRIPT" list --execution 7 --status doing
```

## 获取逻辑说明

**遍历所有任务**（不指定 --execution）:
1. 获取用户有权限的所有项目
2. 遍历每个项目的执行列表
3. 从每个执行获取指派给当前用户的任务
4. 合并并去重所有任务

**Why**: 禅道 API 的任务列表接口需要指定执行 ID，无法直接获取所有任务。因此需要遍历执行来获取完整列表。

**指定执行**（指定 --execution）:
- 直接从指定执行获取任务列表，- 更快速，适合已知执行 ID 的场景

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
