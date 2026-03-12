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
 */
export async function createStory(args: CreateStoryArgs): Promise<void> {
  const client = getClient();

  // 检查产品 ID
  let product = args.product;

  if (!product) {
    const config = loadProjectConfig();
    if (config?.productId) {
      product = config.productId;
      console.log(`使用配置中的产品 ID: ${product}`);
    } else {
      printError('需要指定产品 ID。请使用 --product 参数或在项目配置中设置 productId');
      return;
    }
  }

  // 构建请求数据
  const data: Record<string, unknown> = {
    title: args.title,
    product: product,
    pri: args.pri ?? 3,
    estimate: args.estimate ?? 0,
    category: args.category || 'feature', // 默认类别为 feature
  };

  if (args.module) data.module = args.module;
  if (args.plan) data.plan = args.plan;
  if (args.source) data.source = args.source;
  if (args.sourceNote) data.sourceNote = args.sourceNote;
  if (args.fromBug) data.fromBug = args.fromBug;
  if (args.parent) data.parent = args.parent;
  if (args.assignedTo) data.assignedTo = args.assignedTo;
  if (args.spec) data.spec = args.spec;
  if (args.verify) data.verify = args.verify;
  if (args.linkStories) data.linkStories = args.linkStories;
  if (args.linkRequirements) data.linkRequirements = args.linkRequirements;
  if (args.twins) data.twins = args.twins;

  console.log('创建需求...');

  try {
    const result = await client.post<ApiResponse<{ id: number }>>(
      `/products/${product}/stories`,
      data
    );

    const storyId = result.id || result.data?.id;
    if (!storyId) {
      printError('创建需求失败: 未返回需求 ID');
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    printSuccess(`需求 #${storyId} 已创建: ${args.title}`);
    console.log(`\n可以使用以下命令创建关联任务:`);
    console.log(`  npx tsx src/index.ts create --name "任务名称" --story ${storyId}`);
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
