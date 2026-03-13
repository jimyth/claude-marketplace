#!/usr/bin/env node
/**
 * 禅道 CLI - TypeScript 版本
 */

import { configCommand } from './commands/config.js';
import { listProjects, listExecutions } from './commands/projects.js';
import { initCommand } from './commands/init.js';
import { createTask, listTasks, viewTask, startTask, finishTask } from './commands/tasks.js';
import { createStory, viewStory, listStories } from './commands/stories.js';
import { sumCommand } from './commands/sum.js';

const VERSION = '2.1.0';

function printHelp(): void {
  console.log(`
禅道 CLI v${VERSION}

用法:
  npx tsx src/index.ts <command> [options]

命令:
  config              配置禅道连接
    --url <url>         设置服务器地址
    --account <account> 设置账号
    --password <pwd>    设置密码
    --cycle <day>       设置工时周期起始日 (1-28)
    --show              显示当前配置
    --test              测试连接

  init                初始化项目配置
    --project <id>       指定项目 ID
    --show              显示当前配置
    --refresh           刷新配置

  projects            列出所有项目

  executions <id>     列出项目的执行/迭代

  create              创建任务
    --name <name>        任务名称 (必填)
    --execution <id>     执行 ID (必填或自动推断)
    --type <type>        任务类型 (devel/test/design/study/discuss/ui/affair/misc)
    --pri <n>            优先级 (1-4)
    --estimate <h>       预计工时
    --desc <text>        任务描述 (或使用 stdin)
    --assignedTo <user>  指派给
    --deadline <date>    截止日期
    --no-start           不自动启动

  list                列出任务
    --execution <id>     指定执行 ID
    --status <status>    过滤状态 (wait/doing/done/cancel)

  view <id>           查看任务详情

  start <id>          启动任务

  finish <id>         完成任务
    --consumed <h>       消耗工时 (默认 1)
    --note <text>        完成备注

  sum [month]         工时统计 (月份格式: YYYYMM)

  story               需求管理
    create              创建需求
      --title <title>     需求标题 (必填)
      --type <type>       需求类型: project(研发需求)/user(用户需求) (默认 project)
      --project <id>      项目 ID (研发需求，可选)
      --product <id>      产品 ID (用户需求，可选)
      --category <cat>    需求类别 (默认 feature)
      --pri <n>           优先级 (1-4, 默认 3)
      --estimate <h>      预计工时
      --assignedTo <user> 指派给
      --spec <text>       需求描述
      --verify <text>     验收标准
    view <id>           查看需求详情
    list                列出需求
      --product <id>      产品 ID (必填或从配置获取)
      --status <status>   过滤状态
      --module <id>       过滤模块

示例:
  npx tsx src/index.ts config --url http://localhost:8080 --account admin
  npx tsx src/index.ts init --project 1
  npx tsx src/index.ts create --name "实现登录功能" --execution 7
`);
}

interface ParsedArgs {
  command: string;
  options: Record<string, string | boolean | number>;
  positional: string[];
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {
    command: '',
    options: {},
    positional: [],
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      // 处理 --no-xxx 格式
      if (key.startsWith('no-')) {
        args.options[key.replace('no-', 'no')] = false;
        args.options[key] = true; // e.g., --no-start sets noStart
        i++;
        continue;
      }

      // 检查下一个参数是否是值
      if (i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
        args.options[key] = argv[i + 1];
        i += 2;
      } else {
        args.options[key] = true;
        i++;
      }
    } else if (!arg.startsWith('-')) {
      if (!args.command) {
        args.command = arg;
      } else {
        args.positional.push(arg);
      }
      i++;
    } else {
      i++;
    }
  }

  return args;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  if (argv[0] === '--version' || argv[0] === '-v') {
    console.log(`v${VERSION}`);
    process.exit(0);
  }

  const { command, options, positional } = parseArgs(argv);

  try {
    switch (command) {
      case 'config':
        await configCommand({
          url: options.url as string,
          account: options.account as string,
          password: options.password as string,
          cycle: options.cycle ? parseInt(options.cycle as string, 10) : undefined,
          show: !!options.show,
          test: !!options.test,
        });
        break;

      case 'init':
        await initCommand({
          project: options.project ? parseInt(options.project as string, 10) : undefined,
          show: !!options.show,
          refresh: !!options.refresh,
        });
        break;

      case 'projects':
        await listProjects();
        break;

      case 'executions':
        if (!positional[0]) {
          console.error('错误: 需要项目 ID');
          process.exit(1);
        }
        await listExecutions(parseInt(positional[0], 10));
        break;

      case 'create':
        if (!options.name) {
          console.error('错误: 需要任务名称 --name');
          process.exit(1);
        }
        await createTask({
          name: options.name as string,
          execution: options.execution ? parseInt(options.execution as string, 10) : undefined,
          type: options.type as string,
          pri: options.pri ? parseInt(options.pri as string, 10) : undefined,
          estimate: options.estimate ? parseInt(options.estimate as string, 10) : undefined,
          desc: options.desc as string,
          assignedTo: options.assignedTo as string,
          deadline: options.deadline as string,
          noStart: !!options['no-start'] || !!options.noStart,
        });
        break;

      case 'list':
        await listTasks({
          status: options.status as string,
          execution: options.execution ? parseInt(options.execution as string, 10) : undefined,
        });
        break;

      case 'view':
        if (!positional[0]) {
          console.error('错误: 需要任务 ID');
          process.exit(1);
        }
        await viewTask(parseInt(positional[0], 10));
        break;

      case 'start':
        if (!positional[0]) {
          console.error('错误: 需要任务 ID');
          process.exit(1);
        }
        await startTask(parseInt(positional[0], 10));
        break;

      case 'finish':
        if (!positional[0]) {
          console.error('错误: 需要任务 ID');
          process.exit(1);
        }
        await finishTask({
          id: parseInt(positional[0], 10),
          consumed: options.consumed ? parseFloat(options.consumed as string) : 1,
          note: options.note as string,
        });
        break;

      case 'sum':
        await sumCommand({
          month: positional[0],
        });
        break;

      case 'story':
        const storySubCommand = positional[0];
        switch (storySubCommand) {
          case 'create':
            if (!options.title) {
              console.error('错误: 需要需求标题 --title');
              process.exit(1);
            }
            await createStory({
              title: options.title as string,
              type: options.type as 'project' | 'user',
              project: options.project ? parseInt(options.project as string, 10) : undefined,
              product: options.product ? parseInt(options.product as string, 10) : undefined,
              category: options.category as string,
              module: options.module ? parseInt(options.module as string, 10) : undefined,
              plan: options.plan ? parseInt(options.plan as string, 10) : undefined,
              pri: options.pri ? parseInt(options.pri as string, 10) : undefined,
              estimate: options.estimate ? parseInt(options.estimate as string, 10) : undefined,
              assignedTo: options.assignedTo as string,
              spec: options.spec as string,
              verify: options.verify as string,
            });
            break;

          case 'view':
            if (!positional[1]) {
              console.error('错误: 需要需求 ID');
              process.exit(1);
            }
            await viewStory({
              id: parseInt(positional[1], 10),
            });
            break;

          case 'list':
            await listStories({
              product: options.product ? parseInt(options.product as string, 10) : undefined,
              status: options.status as string,
              module: options.module ? parseInt(options.module as string, 10) : undefined,
              plan: options.plan ? parseInt(options.plan as string, 10) : undefined,
              assignedTo: options.assignedTo as string,
            });
            break;

          default:
            console.error(`未知 story 子命令: ${storySubCommand}`);
            console.log('可用子命令: create, view, list');
            process.exit(1);
        }
        break;

      default:
        console.error(`未知命令: ${command}`);
        printHelp();
        process.exit(1);
    }
  } catch (e) {
    console.error(`错误: ${e}`);
    process.exit(1);
  }
}

main();
