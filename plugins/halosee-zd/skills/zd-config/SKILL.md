---
name: zd-config
description: 配置禅道服务器连接信息
argument-hint: [--url|--account|--password|--cycle|--show|--test]
disable-model-invocation: true
allowed-tools: Bash
---

# 配置禅道连接

配置禅道服务器地址、登录凭证和工时统计周期。

## 脚本路径

```bash
ZD_SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/zentao-api.sh"
```

## 使用方法

```bash
# 设置服务器地址
bash "$ZD_SCRIPT" config --url http://localhost:8080

# 设置账号密码
bash "$ZD_SCRIPT" config --account your_account
bash "$ZD_SCRIPT" config --password your_password

# 设置工时统计周期（每月几号为周期起始日，默认24）
bash "$ZD_SCRIPT" config --cycle 24

# 查看当前配置
bash "$ZD_SCRIPT" config --show

# 测试连接
bash "$ZD_SCRIPT" config --test
```

## 首次配置步骤

```bash
# 1. 设置 URL
bash "$ZD_SCRIPT" config --url http://localhost:8080

# 2. 设置账号密码
bash "$ZD_SCRIPT" config --account jimyth
bash "$ZD_SCRIPT" config --password your_password

# 3. 设置工时周期（可选，默认24号）
bash "$ZD_SCRIPT" config --cycle 24

# 4. 测试连接
bash "$ZD_SCRIPT" config --test
```

## 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| --url | 禅道服务器地址 | http://localhost:8080 |
| --account | 登录账号 | jimyth |
| --password | 登录密码 | your_password |
| --cycle | 工时统计周期起始日（1-28） | 24 |
| --show | 显示当前配置 | - |
| --test | 测试连接 | - |

## 工时周期说明

工时周期用于 `/zd-sum` 命令统计工时：
- 默认每月 24 号为新周期开始
- 例如周期为 24，则 `/zd-sum 202504` 统计 2025-03-24 到 2025-04-24 之间的工时
