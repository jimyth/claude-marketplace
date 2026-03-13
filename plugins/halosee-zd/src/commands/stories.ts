/**
 * stories 命令 - 需求管理
 */

import { getClient } from '../api.js';
import {
  loadProjectConfig,
  printSuccess,
  printError,
} from '../config.js';
import type {
  CreateStoryArgs,
  ListStoriesArgs,
  ViewStoryArgs,
  Story,
  StoriesResponse,
  ApiResponse,
} from '../types.js';

/**
 * 创建需求
 *
 * 禅道有两种需求：
 * - 用户需求（产品级别）：POST /products/{id}/stories
 * - 研发需求（项目级别）：通过禅道 Web 界面关联
 *
 * 注意: 禅道 21.7 版本的 API 限制：
 * - API v1 POST /products/{id}/stories 只能创建产品级别的需求
 * - API v2 在某些版本返回空响应
 * - 没有找到直接创建项目关联需求的 API
 *
 * 建议流程：
 * 1. 使用此命令创建需求（产品级别）
 * 2. 在禅道 Web 界面中将需求关联到项目
 * 3. 创建任务时指定 --story 参数
 */
export async function createStory(args: CreateStoryArgs): Promise<void> {
  const client = getClient();
  const config = loadProjectConfig();

  // 判断需求类型：默认创建研发需求（项目级别）
  const isProjectStory = args.type !== 'user';

  // 构建请求数据
  // spec 是必填字段，默认使用标题
  const data: Record<string, unknown> = {
    title: args.title,
    spec: args.spec || args.title,
    pri: args.pri ?? 3,
    estimate: args.estimate ?? 0,
    category: args.category || 'feature',
  };

  if (args.module) data.module = args.module;
  if (args.plan) data.plan = args.plan;
  if (args.source) data.source = args.source;
  if (args.sourceNote) data.sourceNote = args.sourceNote;
  if (args.fromBug) data.fromBug = args.fromBug;
  if (args.parent) data.parent = args.parent;
  if (args.assignedTo) data.assignedTo = args.assignedTo;
  if (args.verify) data.verify = args.verify;
  if (args.linkStories) data.linkStories = args.linkStories;
  if (args.linkRequirements) data.linkRequirements = args.linkRequirements;
  if (args.twins) data.twins = args.twins;

  try {
    let storyId: number | undefined;

    if (isProjectStory) {
      // 创建研发需求（实际是产品级别的需求，需要手动关联项目）
      let product = config?.productId || args.product;

      if (!product) {
        printError('需要指定产品 ID。请使用 --product 参数或运行 /zd-init 初始化配置');
        return;
      }

      data.product = product;

      const projectDisplay = args.project || config?.projectId || '未知';
      console.log(`创建需求 (产品 #${product})...`);
      console.log(`(计划关联到项目 #${projectDisplay})`);

      const result = await client.post<{ id?: number } & { error?: string; message?: string }>(
        `/products/${product}/stories`,
        data
      );

      storyId = result.id;

      if (storyId) {
        printSuccess(`需求 #${storyId} 已创建: ${args.title}`);
        console.log(`\n⚠️ 注意: 需求是产品级别的，需要手动关联到项目。`);
        console.log(`在禅道 Web 界面中: 项目详情 → 需求 -> 关联需求 -> 选择需求 #${storyId}`);
        console.log(`\n可以使用以下命令创建关联任务:`);
        console.log(`  npx tsx src/index.ts create --name "任务名称" --story ${storyId}`);
      } else {
        if (result.error) {
          printError(`创建需求失败: ${result.error}`);
        } else if (result.message) {
          printError(`创建需求失败: ${result.message}`);
        } else {
          printError('创建需求失败: 未返回需求 ID');
          console.log(JSON.stringify(result, null, 2));
        }
      }
    } else {
      // 创建用户需求（产品级别）
      let product = args.product || config?.productId;

      if (!product) {
        printError('需要指定产品 ID。请使用 --product 参数');
        return;
      }

      console.log(`创建用户需求 (产品 #${product})...`);
      const result = await client.post<{ id?: number } & { error?: string; message?: string }>(
        `/products/${product}/stories`,
        data
      );
      storyId = result.id;

      if (storyId) {
        printSuccess(`用户需求 #${storyId} 已创建: ${args.title}`);
      } else {
        if (result.error) {
          printError(`创建需求失败: ${result.error}`);
        } else {
          printError('创建需求失败: 未返回需求 ID');
          console.log(JSON.stringify(result, null, 2));
        }
      }
    }
  } catch (e) {
    printError(`创建需求失败: ${e}`);
  }
}

/**
 * 查看需求详情
 */
export async function viewStory(args: ViewStoryArgs): Promise<void> {
  const client = getClient();

  try {
    const story = await client.get<Story>(`/stories/${args.id}`);

    console.log(JSON.stringify({
      id: story.id,
      title: story.title,
      status: story.status,
      stage: story.stage,
      pri: story.pri,
      product: story.productName || story.product,
      estimate: story.estimate,
      assignedTo: story.assignedTo?.realname || story.assignedTo?.account || '未指派',
      openedBy: story.openedBy?.realname || story.openedBy?.account,
      openedDate: story.openedDate,
      spec: story.spec,
      desc: story.desc,
      taskCount: story.taskCount,
      bugCount: story.bugCount,
    }, null, 2));
  } catch (e) {
    printError(`获取需求失败: ${e}`);
  }
}

/**
 * 列出需求
 */
export async function listStories(args: ListStoriesArgs): Promise<void> {
  const client = getClient();

  // 检查产品 ID
  let product = args.product;

  if (!product) {
    const config = loadProjectConfig();
    if (config?.productId) {
      product = config.productId;
    } else {
      printError('需要指定产品 ID。请使用 --product 参数');
      return;
    }
  }

  console.log(`获取产品 #${product} 的需求列表...`);

  try {
    const params = new URLSearchParams();
    if (args.status) params.append('status', args.status);
    if (args.module) params.append('module', String(args.module));
    if (args.plan) params.append('plan', String(args.plan));
    if (args.assignedTo) params.append('assignedTo', args.assignedTo);
    if (args.limit) params.append('limit', String(args.limit));
    if (args.page) params.append('page', String(args.page));

    const queryString = params.toString();
    const endpoint = queryString
      ? `/products/${product}/stories?${queryString}`
      : `/products/${product}/stories`;

    const result = await client.get<StoriesResponse>(endpoint);
    let stories = result.stories || [];

    if (stories.length === 0) {
      console.log('没有需求');
      return;
    }

    console.log(`\n共 ${stories.length} 个需求:`);
    console.log('ID\t标题\t\t\t状态\t阶段\t优先级');
    console.log('-'.repeat(60));
    for (const s of stories) {
      const title = s.title.length > 25 ? s.title.substring(0, 25) + '...' : s.title;
      console.log(`${s.id}\t${title}\t\t${s.status}\t${s.stage}\tP${s.pri}`);
    }
  } catch (e) {
    printError(`获取需求列表失败: ${e}`);
  }
}
