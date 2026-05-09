# 滚动联动导航（Scroll Spy & Anchor Navigation）

## 功能背景/动机

当前脚手架缺少**滚动联动导航（Scroll Spy）**这一在桌面应用中非常常见的交互模式。当页面内容较长、包含多个章节或区块时，用户需要一种方式快速了解当前阅读位置，并在章节间快速跳转。文档工具（Notion、GitBook）、设置页面（VS Code Settings）、组件文档（shadcn-vue docs）都采用了侧边目录导航 + 内容滚动联动的设计。目前项目中没有任何 Scroll Spy 相关的组件或实现，这是一个明显的交互空白。提供一套完整的滚动联动导航系统，能显著提升长页面的导航体验。

## 功能描述

构建一套面向桌面应用长页面的滚动联动导航系统：

1. **滚动监听与高亮（Scroll Spy）**：监听页面滚动位置，自动高亮当前可见区块对应的导航目录项
2. **锚点平滑滚动（Smooth Anchor Scroll）**：点击导航目录项平滑滚动到对应内容区块，URL hash 同步更新
3. **目录导航组件（Toc / Anchor Menu）**：自动从页面内容中的标题标签（h1-h6）生成目录树，支持缩进层级展示
4. **浮动/固定目录模式（Fixed vs Floating Toc）**：支持目录固定在侧边栏（宽屏）、浮动按钮展开（窄屏）、或嵌入内容区顶部
5. **进度指示（Reading Progress）**：在页面顶部或目录旁显示阅读进度条/百分比，当前章节高亮
6. **返回顶部与快速跳转（Back to Top & Quick Jump）**：长页面滚动一定距离后显示「返回顶部」按钮，支持快捷键快速跳转到上/下一章节

## 目标用户

- 构建文档页面、设置页面、长表单、配置向导等长内容页面的开发者
- 希望提供类似 Notion/GitBook 阅读体验的开发者
- 需要用户在多章节内容中保持位置感的应用设计者

## 详细设计

### 交互流程

```
滚动监听与高亮：
用户滚动长文档页面 → ScrollSpy 系统监听各章节区块的位置
  → 计算每个区块的可见比例（intersection ratio）
  → 采用「最上方可见区块优先」策略：
    → 若多个区块同时可见，高亮最靠近视口顶部的那个
    → 若所有区块都未完全可见，高亮占据视口面积最大的那个
  → 当前高亮章节的目录项添加激活样式（左侧边框高亮、文字加粗、颜色变化）
  → 高亮切换时平滑过渡（避免闪烁）
  → 支持 offset 配置：考虑固定顶部导航栏的高度（如 60px），区块进入视口顶部 60px 以下才视为「当前」

锚点平滑滚动：
用户点击目录中的「高级配置」→ 触发平滑滚动到 id="advanced-config" 的区块
  → 滚动持续时间根据距离计算（如 1px/ms，最大 500ms，最小 200ms）
  → 滚动动画使用 `scroll-behavior: smooth` 或自定义 RAF 动画
  → 滚动完成后 URL 更新为 `#advanced-config`（不触发页面跳转）
  → 浏览器后退 → 回到之前的锚点位置
  → 页面刷新 → 自动滚动到 URL hash 对应的锚点位置
  → 锚点不可用时（元素不存在）→ 静默忽略，不报错

目录自动生成：
页面挂载后 → TocGenerator 扫描内容区内的 h1-h6 标签
  → 提取 id、标签名、文本内容 → 构建嵌套目录树
    → h1 为一级目录
    → h2 为二级目录（缩进 1 级）
    → h3 为三级目录（缩进 2 级）
  → 没有 id 的标题自动分配锚点 id（基于文本的 slug，如 "高级配置" → "advanced-config"）
  → 目录项过多时显示滚动条，当前高亮项自动滚动到可视区域
  → 支持手动传入目录数据（替代自动生成）
  → 支持过滤目录层级（如只显示 h2-h3，忽略 h4 及以下）

目录展示模式：
宽屏桌面端（>1024px）：
  → 目录固定在页面右侧侧边栏（Sticky Toc）
  → 目录宽度约 200px，与主内容区并排
  → 滚动时目录保持固定位置

窄屏平板端（768px-1024px）：
  → 目录折叠为浮动按钮（右下角「目录」按钮）
  → 点击按钮 → 侧边滑出目录抽屉（Sheet/Drawer）
  → 选择章节后抽屉自动关闭

移动端（<768px）：
  → 目录嵌入内容区顶部（可折叠的手风琴）
  → 或作为底部固定栏的章节选择器

阅读进度指示：
页面顶部显示细进度条（2-3px 高），随滚动从 0% 到 100% 填充
  → 或目录组件顶部显示「阅读进度 45%」
  → 进度计算：当前滚动位置 / (文档总高度 - 视口高度)
  → 章节级进度：在目录项旁显示当前章节的阅读进度（可选）

返回顶部与章节跳转：
用户向下滚动超过 300px → 右下角显示「返回顶部」按钮
  → 点击按钮 → 平滑滚动到页面顶部
  → 支持快捷键：
    → ⌘+↑ 或 Home 键 → 跳转到文档顶部
    → ⌘+↓ 或 End 键 → 跳转到文档底部
    → ⌥+↑ → 跳转到上一章节
    → ⌥+↓ → 跳转到下一章节
  → 快捷键行为可被目录组件内部聚焦时覆盖（用于目录自身的键盘导航）
```

### 涉及的技术点

- **Intersection Observer API**：高性能监听元素可见性，替代 scroll 事件轮询
- **RAF 平滑滚动**：自定义 `requestAnimationFrame` 实现更可控的平滑滚动动画
- **DOM 标题扫描**：递归遍历内容区子元素，提取 h1-h6 构建目录树
- **Scroll 节流**：滚动监听使用节流（throttle）而非防抖，保证高亮实时性同时减少计算
- **URL hash 管理**：`history.pushState` 或 `window.location.hash` 更新锚点

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/scroll-area/` | 主内容区的滚动容器（如使用自定义 ScrollArea） |
| `src/components/ui/sheet/` | 窄屏目录抽屉的容器 |
| `src/components/ui/separator/` | 目录项之间的分隔线 |
| `src/composables/useElementBounding.ts`（@vueuse）| 元素位置计算 |
| `src/composables/useIntersectionObserver.ts`（@vueuse）| 可见性监听 |
| `src/composables/useScroll.ts`（@vueuse）| 滚动位置监听 |
| `src/composables/useShortcuts.ts`（001）| 章节跳转快捷键 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/scroll-spy/ScrollSpyToc.vue` — 滚动联动目录主组件
- `src/components/scroll-spy/TocItem.vue` — 单个目录项组件（递归渲染层级）
- `src/components/scroll-spy/TocFloatingButton.vue` — 窄屏浮动目录按钮
- `src/components/scroll-spy/ReadingProgress.vue` — 阅读进度条组件
- `src/components/scroll-spy/BackToTop.vue` — 返回顶部按钮组件
- `src/composables/useScrollSpy.ts` — 滚动监听与高亮核心 composable
- `src/composables/useTocGenerator.ts` — 目录自动生成 composable
- `src/composables/useSmoothScroll.ts` — 平滑滚动 composable
- `src/types/scroll-spy.ts` — 滚动联动导航类型定义

**修改文件：**
- `src/style.css` 或 `src/assets/tailwind.css` — 添加 `scroll-behavior: smooth` 和锚点 offset 的 scroll-padding-top

### 核心数据结构

```typescript
// src/types/scroll-spy.ts
export interface TocItem {
  id: string
  text: string
  level: number                 // 1-6 对应 h1-h6
  children?: TocItem[]
  element?: HTMLElement         // 对应的 DOM 元素引用
}

export interface ScrollSpyOptions {
  container?: HTMLElement | Ref<HTMLElement | null>  // 滚动容器，默认 window
  offset?: number               // 顶部偏移量（考虑固定导航），默认 80
  throttleMs?: number           // 滚动节流毫秒，默认 100
  activeClass?: string          // 高亮 class
  onActiveChange?: (activeId: string) => void
}

export interface SmoothScrollOptions {
  duration?: number             // 动画时长 ms，默认自动计算
  easing?: (t: number) => number  // 缓动函数，默认 easeInOutCubic
  offset?: number               // 目标位置偏移
  onComplete?: () => void
}

export interface TocOptions {
  contentSelector: string       // 内容区 CSS 选择器
  maxLevel?: number             // 最大目录层级，默认 3
  minLevel?: number             // 最小目录层级，默认 2
  autoGenerateIds?: boolean     // 是否自动为无 id 标题生成锚点
  scrollOffset?: number
}

export interface ReadingProgressOptions {
  container?: HTMLElement | Ref<HTMLElement | null>
  showPercentage?: boolean
  position?: 'top' | 'bottom' | 'toc'
}
```

### 关键实现策略

1. **Intersection Observer 为主 + Scroll 兜底**：主要使用 `IntersectionObserver` 监听各章节区块的可见性，设置 `rootMargin: '-80px 0px -60% 0px'`（顶部偏移 80px，底部只计算上方 40% 区域），这样最靠近顶部的可见区块会被判定为「当前」。对于不支持 IO 的环境（极少）使用 scroll 事件节流兜底
2. **目录自动生成的 slug 算法**：对于没有 id 的标题，生成 URL 友好的 slug。使用文本转拼音首字母（如「高级配置」→ "gaoji-peizhi"）或直接保留中文（现代浏览器支持中文 hash）。处理重复 slug 时追加序号（如 "gaoji-peizhi-2"）
3. **平滑滚动的 RAF 实现**：不使用原生 `scroll-behavior: smooth`（不可控、不支持 offset），而是使用 `requestAnimationFrame` + 缓动函数（easeInOutCubic）手动计算每帧的 scrollTop。这样能精确控制滚动距离、时长和偏移量
4. **响应式目录模式切换**：使用 `@vueuse/useBreakpoints` 监听视口宽度，自动切换目录展示模式（宽屏侧边固定 → 中屏浮动按钮 → 移动端顶部折叠）。模式切换时目录状态保持（高亮项、滚动位置）
5. **快捷键与焦点管理**：页面级快捷键（⌥+↑/↓）由全局快捷键系统（001）注册。当目录组件获得焦点时，↑↓ 用于目录项导航，Enter 用于跳转，避免与页面级快捷键冲突

## 验收标准

- [ ] 提供 `ScrollSpyToc` 组件，自动从页面标题生成目录树，支持缩进层级展示
- [ ] 滚动页面时目录自动高亮当前可见章节，高亮切换平滑无闪烁
- [ ] 点击目录项平滑滚动到对应章节，支持顶部偏移量配置
- [ ] URL hash 与当前章节同步，刷新和浏览器前进/后退自动定位
- [ ] 支持宽屏固定目录、中屏浮动抽屉、移动端顶部折叠三种响应式模式
- [ ] 提供 `ReadingProgress` 组件，支持顶部进度条或目录内百分比展示
- [ ] 提供 `BackToTop` 组件，滚动超过阈值后显示，支持平滑回到顶部
- [ ] 支持快捷键章节跳转（上一章/下一章/顶部/底部）
- [ ] 支持手动传入目录数据替代自动生成
- [ ] 支持过滤目录层级（如只展示 h2-h3）
- [ ] 包含至少 4 个使用示例（文档页、设置页、长表单、组件演示页）

## 优先级

**P0** — 滚动联动导航是长页面内容展示的核心缺失组件，目前项目中完全没有相关实现；填补这一空白能显著提升文档页、设置页、长表单等场景的用户体验，是桌面应用模板的标配能力。

## 参考实现

- [GitBook Table of Contents](https://docs.gitbook.com/) — 右侧固定目录 + 滚动高亮
- [Notion Table of Contents](https://www.notion.so/) — 自动生成目录块
- [MDN Scroll-driven Animations](https://developer.mozilla.org/) — 阅读进度和锚点导航
- [shadcn-vue Docs](https://www.shadcn-vue.com/docs/) — 文档目录交互设计
- [VueUse useIntersectionObserver](https://vueuse.org/core/useIntersectionObserver/) — 可见性监听基础
