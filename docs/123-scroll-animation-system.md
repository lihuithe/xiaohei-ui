# 滚动动画系统

## 功能背景/动机

当前脚手架提供了 `AnimatedTransition.vue` 和 `StaggerList.vue` 等组件级动画，但缺少基于**滚动触发**的动画能力。在桌面应用中，滚动动画能显著提升内容的"叙事感"和交互精致度：

1. **内容入场动画**：列表、卡片、图片在进入视口时以淡入/滑入/缩放的方式出现，避免页面加载时的"瞬间闪现"。
2. **视差效果**：背景图或装饰元素以不同于前景的速度滚动，创造深度感（常用于欢迎页、仪表盘）。
3. **滚动进度指示**：顶部细条进度条或侧边圆点导航，帮助用户感知当前阅读/浏览位置。
4. **粘性头部/元素变化**：侧边栏或标题栏在滚动到特定位置时改变样式（如缩小标题、切换背景）。

对于需要展示大量内容（如设置页、文档页、数据仪表盘）的桌面应用，滚动动画是让界面"活起来"的关键。但实现不当（如过于频繁触发、性能差）会导致卡顿。提供一套**高性能、可配置、无障碍友好**的滚动动画系统至关重要。

## 功能描述

构建一套**滚动动画系统**，包含：

1. **滚动触发入场动画（Scroll Reveal）**：
   - `v-scroll-reveal` 指令：元素进入视口时触发动画（fade-up / fade-down / scale-in / slide-left / slide-right）。
   - `ScrollRevealGroup` 组件：包裹一组子元素，支持 stagger（错峰）入场，列表项依次浮现。
   - 支持 `once`（仅首次触发）和 `repeat`（每次滚动经过都触发）两种模式。
   - 支持 `threshold` 配置（元素露出 10% / 50% 时触发）。
2. **视差滚动效果（Parallax）**：
   - `v-parallax` 指令：接收 `speed` 参数（如 0.5 表示以一半速度滚动），实现背景层慢速移动效果。
   - `ParallaxContainer` 组件：管理多层视差元素的相对运动。
3. **滚动进度指示器（Scroll Progress）**：
   - `ScrollProgressBar`：顶部固定细条，颜色随主题变化，实时反映页面滚动百分比。
   - `ScrollProgressCircle`：圆形进度环，常用于长文档侧边悬浮。
   - `ReadingIndicator`：阅读进度百分比文字（如 "已读 35%"）。
4. **滚动驱动动画（Scroll-driven Animations）**：
   - `useScrollAnimation()`：基于滚动位置驱动任意 CSS 属性（如透明度、缩放、旋转），实现滚动过程中的连续变化。
   - 利用 CSS `animation-timeline: scroll()`（现代浏览器支持）或 JavaScript fallback。
5. **平滑滚动（Smooth Scroll）**：
   - `useSmoothScroll()`：封装 `lenis` 或自研平滑滚动逻辑，替代原生滚动，使滚动动画更流畅。
   - 支持 `reduced-motion` 时自动降级为原生滚动。
6. **滚动动画调试面板（开发模式）**：
   - 在 `import.meta.env.DEV` 时，显示当前页面所有 scroll-reveal 元素的触发状态（是否已显示、触发次数、阈值）。

## 目标用户

- **需要展示长内容列表/卡片/文档的桌面应用开发者**。
- **追求"内容如流水般浮现"精致体验的产品**。
- **需要仪表盘/数据大屏视差效果的开发者**。

## 详细设计

### 视觉/动画效果描述

**Scroll Reveal 动画预设：**
```css
/* fade-up：从下方 30px 淡入上浮 */
@keyframes scroll-reveal-fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* scale-in：从小缩小到正常 */
@keyframes scroll-reveal-scale {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}

/* 统一缓动 */
.scroll-reveal {
  animation: var(--scroll-reveal-animation) 0.6s var(--ease-out-expo) both;
  animation-play-state: paused;
}
.scroll-reveal.is-visible {
  animation-play-state: running;
}
```

**Stagger 错峰延迟：**
```css
.scroll-reveal-group > *:nth-child(1) { animation-delay: 0ms; }
.scroll-reveal-group > *:nth-child(2) { animation-delay: 80ms; }
.scroll-reveal-group > *:nth-child(3) { animation-delay: 160ms; }
/* ... capped at 10th child */
```

**视差效果：**
```css
.parallax-layer {
  will-change: transform;
  transform: translateY(calc(var(--parallax-speed) * var(--scroll-delta) * 1px));
}
```

**滚动进度条：**
- 位置：固定在内容区顶部（`position: fixed; top: 0; left: 0; right: 0; height: 2px;`）。
- 颜色：使用 `var(--primary)`，带微弱发光效果（`box-shadow: 0 0 6px var(--primary)`）。
- 宽度：`width: calc(var(--scroll-progress) * 100%)`，通过 CSS 变量实时更新。

### 涉及的技术点

- **Intersection Observer API**：检测元素是否进入视口，是 Scroll Reveal 的核心。比滚动监听性能更高。
- **CSS `animation-timeline: scroll()`**：原生滚动驱动动画（Chrome 115+），无需 JS 计算。不支持时降级到 Intersection Observer + CSS 类切换。
- **`lenis` 库**：提供丝滑平滑滚动，与 GSAP ScrollTrigger 等库配合良好。包体积极小。
- **`will-change: transform`**：对视差元素启用 GPU 加速，但需谨慎使用（过多会导致内存压力）。
- **Reduced Motion 兼容**：`prefers-reduced-motion: reduce` 时，所有 scroll-reveal 直接显示（无动画），视差禁用。
- **防抖/节流**：若使用 JS 驱动视差，需对 scroll 事件进行 `requestAnimationFrame` 节流。

### 与现有架构的衔接方式

- **新增 `src/composables/useScrollReveal.ts`**：
  - 封装 Intersection Observer 逻辑。
  - 提供 `vScrollReveal` 指令的实现函数。
  - 支持 `animation`、`delay`、`threshold`、`once` 等配置。
- **新增 `src/composables/useParallax.ts`**：
  - 监听滚动位置，计算视差位移。
  - 提供 `vParallax` 指令。
- **新增 `src/composables/useScrollProgress.ts`**：
  - 计算当前滚动百分比，写入 CSS 变量 `--scroll-progress`。
- **新增 `src/composables/useSmoothScroll.ts`**：
  - 封装 `lenis` 初始化与销毁。
  - 提供 `scrollTo(target)` 方法。
- **新增 `src/components/scroll/` 目录**：
  - `ScrollRevealGroup.vue`：错峰入场容器。
  - `ScrollProgressBar.vue`：顶部进度条。
  - `ScrollProgressCircle.vue`：圆形进度环。
  - `ReadingIndicator.vue`：阅读百分比。
  - `ParallaxContainer.vue`：视差容器。
- **新增 `src/directives/vScrollReveal.ts`**：
  - Vue 自定义指令，可在任意元素上使用 `v-scroll-reveal="'fade-up'"`。
- **新增 `src/directives/vParallax.ts`**：
  - Vue 自定义指令 `v-parallax="0.5"`。
- **修改 `src/main.ts`**：
  - 全局注册 `v-scroll-reveal` 和 `v-parallax` 指令。
- **修改 `src/App.vue` 或 `src/components/layouts/`**：
  - 在需要的内容区注入 `ScrollProgressBar`。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useScrollReveal.ts` | 新增 | Scroll Reveal 核心逻辑 |
| `src/composables/useParallax.ts` | 新增 | 视差滚动逻辑 |
| `src/composables/useScrollProgress.ts` | 新增 | 滚动进度计算 |
| `src/composables/useSmoothScroll.ts` | 新增 | 平滑滚动封装 |
| `src/directives/vScrollReveal.ts` | 新增 | Scroll Reveal 指令 |
| `src/directives/vParallax.ts` | 新增 | 视差指令 |
| `src/components/scroll/ScrollRevealGroup.vue` | 新增 | 错峰入场容器 |
| `src/components/scroll/ScrollProgressBar.vue` | 新增 | 顶部进度条 |
| `src/components/scroll/ScrollProgressCircle.vue` | 新增 | 圆形进度环 |
| `src/components/scroll/ReadingIndicator.vue` | 新增 | 阅读百分比 |
| `src/components/scroll/ParallaxContainer.vue` | 新增 | 视差容器 |
| `src/main.ts` | 修改 | 注册全局指令 |
| `src/styles/animations.css` | 修改 | 新增 scroll-reveal 关键帧 |

## 验收标准

- [ ] `v-scroll-reveal` 指令可在任意元素上使用，支持 `fade-up`、`fade-down`、`scale-in`、`slide-left`、`slide-right` 等预设动画。
- [ ] `ScrollRevealGroup` 支持子元素 stagger 错峰入场，延迟间隔约 80ms。
- [ ] 支持 `once` 和 `repeat` 两种触发模式，`threshold` 可配置（默认 0.1）。
- [ ] `v-parallax` 支持 `speed` 参数（-1 到 1），实现不同速度的视差层。
- [ ] `ScrollProgressBar` 实时反映页面滚动百分比，颜色跟随主题主色。
- [ ] 启用平滑滚动后，页面滚动手感丝滑，不影响原生键盘导航（PageUp/PageDown、Home/End）。
- [ ] `prefers-reduced-motion: reduce` 时，所有 scroll-reveal 直接显示，视差禁用。
- [ ] 同时存在 50+ 个 scroll-reveal 元素时，页面滚动仍保持 60fps。
- [ ] ComponentPlayground 中新增「滚动动画」演示区，包含长列表入场、视差背景、进度条。

## 优先级

P1

## 参考实现

- [AOS (Animate On Scroll)](https://michalsnik.github.io/aos/)：经典的滚动触发动画库，API 设计参考。
- [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/)：业界最强大的滚动驱动动画库，设计理念参考。
- [Lenis](https://lenis.darkroom.engineering/)：现代平滑滚动库，与 Vue/Electron 集成友好。
- [CSS animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)：原生滚动驱动动画规范。
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)：浏览器原生视口检测 API。
