---
name: memory-query
description: 查询/搜索记忆 — 输入关键词搜索跨项目的长期记忆
---

执行记忆搜索：

1. 从用户输入提取搜索关键词
2. 调用 searchMemory(query="关键词", project_id="当前项目ID")
3. 如果用户指定了其他项目，使用对应的 project_id
4. 如果用户想搜索全局记忆（用户偏好、经验教训），不传 project_id
5. 格式化展示搜索结果，包括：记忆标题、内容摘要、创建时间
