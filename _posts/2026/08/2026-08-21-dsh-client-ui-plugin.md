---
title: "给 AI 工具写个客户端插件"
author: 唐悦玮
date: 2026-08-21 09:30:00 +0800
categories: [技术实战, 插件开发]
tags: [DeepSeek Harness, 客户端插件, 插件架构, Web UI, 前端工程]
pin: false
comments: true
keyword: DeepSeek Harness, dsh, 客户端插件, web UI 插件, 插件架构, shell.overlay, Cordis
---

> **摘要**：AI 编程工具的插件生态，大家都在写"工具型插件"。但想给界面换个皮肤、加只悬浮宠物，得写另一类——客户端 UI 插件。本文以我自己开源的 DSH 咸鱼宠物插件为例，拆开它的两层入口、槽位注入，以及几个踩出来的前端工程坑：背景透出、毛玻璃的包含块陷阱、穿透宿主 DOM。

---

![客户端 UI 插件：把组件挂上 AI 工具界面的槽位](/imgs/202608/2026-08-21-dsh-client-ui-plugin-infographic.png)
*图：服务端工具插件藏在背后供模型调用，客户端 UI 插件浮在界面上给人看——后者通过 `shell.overlay` 槽位注入，踩过背景透出、毛玻璃陷阱、穿透 DOM 三个坑。*

你每天盯着 AI 编程工具的界面八小时，界面的样子却是别人定死的。想换张壁纸、加只悬浮宠物，翻遍设置项找不到入口——因为这类"皮肤层"的改动，工具厂商压根没留。

DeepSeek Harness（下称 dsh）留了入口：一切皆插件。但多数教程讲到插件，都在教你怎么注册一个**工具**给模型调用。给界面动刀子的另一种插件——**客户端 UI 插件**，讲的人少。本文以我自己开源的 dsh 咸鱼宠物插件为例，把它从入口、槽位到几个前端坑完整拆一遍。

## 插件跑在哪，决定它是哪一类

dsh 的插件分两类，区别不在功能，在**代码跑在哪里、服务谁**：

- **服务端工具插件**：默认形态，跑在 Node 侧。它注册一个工具（比如 `greet`），模型通过描述知道它存在、通过入参 schema 知道怎么调。我 8-17 那篇写的就是这种。
- **客户端 UI 插件**：声明 `platform: 'web'`，跑在浏览器里，往 UI 槽位塞一个 React 组件。它不注册工具、不消费任何 Cordis 服务，纯粹在界面上做文章。

一句话区分：前者给**模型**加能力，后者给**界面**加 personality。咸鱼宠物是后者——它不替你写代码，只在你写代码时陪你摸鱼。

## 一个插件，为什么要拆两层入口

最反直觉的地方：这个插件有两份入口文件。

`src/index.ts` 是宿主（Node）入口，全文就一行：

```typescript
export function apply(): void {}
```

空的。它存在**只为了让 Cordis Loader 认它是个合法插件**——能进 host 的 cordis.yml 插件树。它不干任何服务端的事。

真正的逻辑在 `src/client/index.ts`，通过 `package.json` 的 exports 映射暴露出去：

```json
{
  "exports": {
    ".":        { "default": "./lib/index.js" },
    "./client": { "default": "./lib/client.js" }
  },
  "dsh": {
    "client": {
      "inject": ["@deepseek-ai/dsh-client-runtime", "@deepseek-ai/dsh-client-ui-slots"],
      "platform": "web"
    }
  }
}
```

`exports["."]` 指向 host 那份空 `apply`；`exports["./client"]` 指向浏览器侧。dsh 的客户端运行时读到 `dsh.client.platform: 'web'`，就知道该加载 `./client` 这份、并把它要注入的客户端服务（`dsh-client-runtime`、`dsh-client-ui-slots`）准备好。

这个拆分的收益很实在：同一个 npm 包，在 Node 侧零成本（空 apply 不引入 React），在浏览器侧才真正加载组件。你不会因为装了个 UI 插件，就给服务端进程塞进一堆前端依赖。

## 槽位：把组件挂进界面

UI 不是随便往 `document.body` 一扔就完事。dsh 把界面切成若干**槽位（slot）**，插件往指定槽位注册组件。

咸鱼插件用的是 `shell.overlay`——一个挂在 root 作用域的 `list` 型槽位（多个插件都能往里加条目）。插件先声明它需要 `slots` 服务，再注入组件：

```typescript
export const inject = ['slots'] as const

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'shell.overlay': { kind: 'list'; scope: 'root' }
  }
}

export function apply(ctx: ClientContext) {
  ctx.inject(['slots'], (scope) => {
    const dispose = scope.slots.inject('shell.overlay', () =>
      scope.slots.register({ name: 'shell.overlay', id: 'uiPet' }, SaltedFishPet),
    )
    return () => dispose()
  })
}
```

`slots.inject` 拿到槽位注册表，`slots.register` 把一个 React 组件绑到 `uiPet` 这个 id 上。咸鱼和壁纸选择器是两个**独立**的槽位条目（`uiPet` 和 `wallpaperPicker`），各自挂各自的组件。

## 注册进 bundle：一行命令背后

开发时你 clone 源码、跑 `install.sh`；普通用户则是一行：

```bash
npx @deepseek-ai/dsh plugin --profile web add @tangyuewei/dsh-client-ui-pet
```

这条命令本质是在持久化的 profile 目录（`~/.dsh/profiles/web`）里 `pnpm add` 这个包，并把它的 `cordis.patch.yml` 追加进 bundle 清单。那个 patch 文件极简：

```yaml
- insert:
    - id: ui-pet
      name: '@tangyuewei/dsh-client-ui-pet'
```

dsh 启动时按 bundle 顺序叠加各插件的 patch，在 `shell.overlay` 里注入咸鱼。profile 目录与 npx 缓存无关，重开终端、重跑 npx 依然生效——这是它比"每次手动 patch 源码"稳的地方。

![dsh 客户端 UI 插件真实运行效果：咸鱼宠物浮在右下角、工程师壁纸透出、背景可切换](/imgs/202608/2026-08-21-dsh-client-ui-plugin-demo.gif)
*真实运行效果：默认 `yu7` 毛玻璃背景与咸鱼 → 打开壁纸面板 → 切换 Porsche 718 → 📌 置顶（背景图全屏置顶）→ 取消置顶 → 切换 Macan S（深色系壁纸亦可选，深浅色不限制）。*

## 跨槽位状态：两块 UI 怎么联动

咸鱼和背景是两个独立槽位条目，意味着它们**不在同一棵 React 组件树里**，不能直接传 props、不能共享 context。

但"点一下隐藏咸鱼，要把背景也收起来"这个联动必须成立。解法是抽一个**模块级共享 store**（`visibility.ts`）：

```typescript
let hidden = false
const listeners = new Set<() => void>()

export function setPetHidden(next: boolean): void {
  if (hidden === next) return
  hidden = next
  for (const listener of listeners) listener()
}

export function subscribePetHidden(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
```

一个布尔 + 一个监听器集合。宠物按钮调用 `setPetHidden`，背景模块的订阅者收到通知后同步收起。宠物组件本身用 `useSyncExternalStore` 接这个 store，所以即使槽位被重新挂载，读到的仍是同一份持久化的可见状态，不会"宠物没了、背景还在"。

> 代价我说在前面：召唤按钮目前靠**查找页面上含 "Session log" 文字的按钮**来定位自己，Shell 结构一变就可能失效。这是已知限制，不是特性。

## 壁纸 API：丢图即生效

壁纸不区分深浅主题，用户随便挑。源图丢进 `src/client/wallpapers/`，构建脚本（`build-wallpapers.mjs`）自动缩放到 1920px、base64 编码进 `bg-images.generated.ts`（gitignored，每次构建重生），于是"加一张壁纸"等于"丢一个文件"，不用手敲 base64。

选择态用 `localStorage`（key `dsh-ui-pet.wallpaper`）持久化，并通过 `window` 上的 `CustomEvent` 广播：

```typescript
export function setCurrentWallpaperId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id)
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { id } }))
}
```

背景模块和选择器都订阅这个事件，换壁纸时两边同时刷新，刷新和重启后选择还在。

## 几个前端坑（架构落地的代价）

插件能跑起来，靠几处对症的前端技巧。它们不性感，但少一个界面就废。

**背景透出**。主题背景默认不透明，会盖住 body 上的壁纸。解法是把主题背景底色强行透明，让 body 的壁纸透出来：

```css
body.dsh-bg-glow,
body.dsh-bg-glow #root,
body.dsh-bg-glow #root * {
  --dsw-alias-bg-base: transparent !important;
}
```

一个 CSS 变量加 `!important`，覆盖掉主题对 `background` 简写设的不透明底色。

**毛玻璃的包含块陷阱**。侧栏想做毛玻璃，直觉是给列加 `backdrop-filter`。但 `backdrop-filter` 会让那个元素变成其内部 `position: fixed` 后代的**包含块**——设置面板是 portal 渲染的，会被困在 280px 宽的列里。改用 `isolation: isolate` 也不行：它会创建层叠上下文，Chrome 会裁剪上下文内 `fixed` 后代到自身 `overflow`。正解是滤镜放 `::before` 伪元素、`z-index: -1` 逃逸到 body 背景层：

```css
body.dsh-bg-glow [class$="sidebarCol"]::before {
  content: ''; position: absolute; inset: 0; z-index: -1;
  -webkit-backdrop-filter: blur(26px) saturate(160%);
  backdrop-filter: blur(26px) saturate(160%);
}
```

这俩雷在 MDN 的 `backdrop-filter` 条目里都有记载，但只有真写一遍才知道它会咬人。

**穿透宿主 DOM**。宿主的列用了 CSS Modules，类名是带哈希的（`sidebarCol__abc123`）。我没法 import 宿主组件去加样式，只能用**后缀属性选择器**命中本地名：

```css
body.dsh-bg-glow [class$="sidebarCol"] { background: rgba(255,255,255,0.55) !important; }
```

`[class$="sidebarCol"]` 匹配"以 sidebarCol 结尾"的类名，不依赖哈希前缀。代价是选择器写得宽，未来宿主改本地名规则就得跟着改。

**主题与光晕**。`MutationObserver` 监听 `body` 的 `data-ds-dark-theme` 属性切深浅色；鼠标跟随光晕只往 `--bg-mx/--bg-my` 两个 CSS 变量写坐标，由合成器（compositor）处理，不触发重绘——`mousemove` 用 `passive` 监听，不阻塞滚动。

## 已知限制：收益和代价一起给

这个插件不完美，我把它写进 README 的"已知限制"：

- **零持久化**：宠物位置、饱腹度、心情都是会话级内存，刷新即重置；
- **无配置面板**：所有参数（衰减速度、边距、尺寸）要改源码重新构建，没暴露给用户；
- **召唤按钮依赖 DOM 查找**，Shell 结构变更可能失效；
- **壁纸内嵌 base64**，无外部请求，想动态加载得自己改。

这些不是 bug 清单，是"纯前端展示插件"这个定位下的取舍。它本来就不打算做服务端、不做账号体系、不做云同步。

## 收尾

写这个插件最大的收获，不是多了只咸鱼，而是被迫把 dsh 的**宿主/浏览器边界、槽位契约、宿主 DOM 穿透**摸清了一遍。

插件化的另一种形态就在这：它不只想给模型加能力，也想给界面加 personality。当 AI 编程工具成为你每天盯八小时的东西，能不能把它改顺手，本身就是工程问题。客户端 UI 插件，是这块拼图里被讲得最少的一块——希望这篇把它补上。

---

**参考资料**

- 开源仓库 [tangyuewei/dsh-client-ui-pet](https://github.com/tangyuewei/dsh-client-ui-pet)，2026 年 8 月。
- MDN Web Docs，[`backdrop-filter`](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)。
