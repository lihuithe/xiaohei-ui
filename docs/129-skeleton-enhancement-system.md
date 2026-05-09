# 骨架屏增强系统

## 功能背景/动机

当前脚手架在 `components/ui/Skeleton.vue` 中提供了一个非常基础的骨架屏组件：一个带 `animate-shimmer` 的灰色矩形，支持 `text` / `circular` / `rectangular` 三种形状。同时，105（加载/空/错误状态统一设计系统）规划了 `ContentLoader` 等状态组件，但骨架屏本身的视觉表现力仍有巨大提升空间。

在实际桌面应用中，骨架屏是用户感知"系统正在工作"的第一道防线，但当前实现存在以下问题：

1. **动画单调**：仅有单一的从左到右 shimmer 流动，缺乏变化，长时间等待时用户容易感到乏味。
2. **颜色呆板**：始终使用 `bg-muted` 的灰色，与主题色毫无关联，深色模式下常显得脏污或对比度过低。
3. **无布局预设**：开发者每次都需要手动拼装多个 `Skeleton` 组件来模拟列表、卡片、表格等布局，重复劳动多且容易错位。
4. **切换体验差**：骨架屏消失、真实内容出现时通常是瞬间替换，产生明显的"闪烁感"和布局跳动。
5. **暗色/OLED 适配不足**：灰色骨架屏在 OLED 纯黑背景下几乎不可见，无法起到占位作用。

提供一套**骨架屏增强系统**，能让骨架屏不仅"有用"，而且"好看"——与主题融合、动画丰富、布局智能、切换平滑。

## 功能描述

构建一套**骨架屏增强系统**，包含：

1. **多种骨架屏动画模式**：
   - `shimmer`（默认）：从左到右的光线扫过（现有效果，优化为多角度支持）。
   - `wave`：波浪状起伏，类似水波荡漾，比 shimmer 更柔和。
   - `pulse`：透明度周期性变化，极简风格。
   - `glow`：带有微弱发光效果的脉动，适合深色模式。
   - `none`：静态无动画，用于减少动画偏好场景。
2. **渐变色骨架屏**：
   - 支持基于主题色的微妙渐变（如从 `primary/5` 到 `primary/10`），让骨架屏与品牌色产生关联。
   - 深浅模式自动切换渐变方向（浅色从亮到暗，深色从暗到稍亮）。
   - OLED 纯黑模式下使用 `rgba(255,255,255,0.04)` 到 `rgba(255,255,255,0.08)` 的极暗渐变。
3. **内容感知骨架屏布局预设（Skeleton Layout Presets）**：
   - `SkeletonList`：列表骨架，支持配置行数、是否有头像/图标、是否有副标题。
   - `SkeletonCard`：卡片骨架，支持配置是否有封面图、标题、描述、操作按钮区。
   - `SkeletonTable`：表格骨架，支持配置列数、行数、是否有表头。
   - `SkeletonArticle`：文章/详情页骨架，支持配置封面、标题、多行正文、作者区。
   - `SkeletonProfile`：个人资料骨架，包含大头像、名称、统计数字、简介多行。
   - `SkeletonDashboard`：仪表盘骨架，包含多个统计卡片、图表占位、列表占位。
4. **智能骨架屏（Smart Skeleton）**：
   - `AutoSkeleton` 组件：接收一个 `aspect` 或 `layout` 字符串（如 `"list-5"`、`"card-with-cover"`），自动渲染对应的预设布局。
   - 与 105 的 `StateHandler` 配合：当状态为 `loading` 时，根据内容的 `data-skeleton` 属性自动生成匹配的骨架屏。
5. **无缝切换机制（Seamless Transition）**：
   - 骨架屏消失时不是瞬间移除，而是执行淡出动画（opacity 1→0，150ms）。
   - 真实内容同时执行淡入动画（opacity 0→1，150ms），两者短暂重叠形成交叉淡化，消除闪烁。
   - 骨架屏高度与真实内容完全一致（通过预设布局或 `min-height` 保证），消除布局跳动。
6. **骨架屏颜色自动适配**：
   - 浅色模式：使用灰色调渐变（`muted` 色系）。
   - 深色模式：使用低亮度渐变（`muted` 在深色下的值）。
   - OLED 纯黑模式：使用纯黑基底的极暗渐变，确保可见但不刺眼。
   - 主题色模式：可选使用品牌主色的极淡渐变（`primary/5` → `primary/10`）。

## 目标用户

- **需要展示大量异步内容（列表、表格、卡片网格）的桌面应用开发者**。
- **追求加载体验精致、消除布局跳动的产品团队**。
- **需要快速搭建数据仪表盘、内容管理界面的开发者**。

## 详细设计

### 视觉/动画效果描述

**动画模式 CSS：**
```css
/* Shimmer（多角度） */
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

/* Wave */
@keyframes skeleton-wave {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.skeleton-wave::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--skeleton-highlight),
    transparent
  );
  animation: skeleton-wave 2s ease-in-out infinite;
}

/* Pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton-pulse {
  animation: skeleton-pulse 2s ease-in-out infinite;
}

/* Glow（深色模式专用） */
@keyframes skeleton-glow {
  0%, 100% { box-shadow: 0 0 0 0 var(--skeleton-glow); }
  50% { box-shadow: 0 0 8px 2px var(--skeleton-glow); }
}
.skeleton-glow {
  animation: skeleton-glow 2s ease-in-out infinite;
}
```

**骨架屏颜色 Token：**
```css
:root {
  --skeleton-base: oklch(0.92 0 0);       /* 浅色基底 */
  --skeleton-highlight: oklch(0.97 0 0);  /* 浅色高光 */
  --skeleton-glow: hsl(0 0% 100% / 0.02); /* 发光基础 */
}
.dark {
  --skeleton-base: oklch(0.22 0 0);
  --skeleton-highlight: oklch(0.3 0 0);
  --skeleton-glow: hsl(0 0% 100% / 0.04);
}
.oled {
  --skeleton-base: rgba(255, 255, 255, 0.03);
  --skeleton-highlight: rgba(255, 255, 255, 0.07);
}
/* 主题色模式 */
[data-skeleton-theme="brand"] {
  --skeleton-base: var(--primary / 0.05);
  --skeleton-highlight: var(--primary / 0.1);
}
```

**内容感知布局预设（SkeletonList 示例）：**
```vue
<!-- SkeletonList: 5 行，每行有圆形头像 + 两行文字 -->
<div class="flex flex-col gap-3">
  <div v-for="i in rows" :key="i" class="flex items-center gap-3">
    <Skeleton variant="circular" width="40px" height="40px" :animation="animation" />
    <div class="flex flex-col gap-2 flex-1">
      <Skeleton width="60%" height="16px" :animation="animation" />
      <Skeleton width="40%" height="12px" :animation="animation" />
    </div>
  </div>
</div>
```

**无缝切换：**
```css
.skeleton-fade-out {
  animation: skeleton-fade-out 0.15s ease-out forwards;
}
@keyframes skeleton-fade-out {
  to { opacity: 0; }
}
.content-fade-in {
  animation: content-fade-in 0.15s ease-out forwards;
}
@keyframes content-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 涉及的技术点

- **CSS `linear-gradient` + `background-size` + `animation`**：shimmer 和 wave 动画的核心技术。
- **CSS 变量主题适配**：通过 `--skeleton-base` 和 `--skeleton-highlight` 统一控制骨架屏颜色，深浅/OLED/主题色模式下自动切换。
- **预设布局组合**：基于现有 `Skeleton.vue` 的组合排列，封装常用布局模式。
- **交叉淡化过渡**：骨架屏淡出与内容淡入的时间重叠（约 50ms），消除闪烁感。
- **Intersection Observer**：若骨架屏在视口外，可暂停动画以节省性能（可选）。

### 与现有架构的衔接方式

- **修改 `src/components/ui/Skeleton.vue`**：
  - 扩展 props：
    - `animation: 'shimmer' | 'wave' | 'pulse' | 'glow' | 'none'`（默认 shimmer）
    - `theme: 'default' | 'brand'`（是否使用主题色渐变）
    - `rounded: boolean`（是否使用全圆角，用于 pill 形状骨架）
  - 动画样式根据 `animation` prop 动态切换。
- **新增 `src/components/ui/skeleton/` 目录下的布局组件**：
  - `SkeletonList.vue`
  - `SkeletonCard.vue`
  - `SkeletonTable.vue`
  - `SkeletonArticle.vue`
  - `SkeletonProfile.vue`
  - `SkeletonDashboard.vue`
- **新增 `src/components/ui/skeleton/AutoSkeleton.vue`**：
  - Props: `layout: string`（如 `"list-5"`、`"card"`、`"table-3x5"`）。
  - 解析 layout 字符串，自动渲染对应的预设。
- **新增 `src/components/ui/skeleton/SkeletonTransition.vue`**：
  - 包装组件，管理骨架屏到真实内容的交叉淡化过渡。
  - Props: `loading`、`duration`。
- **修改 `src/styles/animations.css`**：
  - 新增骨架屏相关的所有关键帧动画。
- **修改 `src/style.css`**：
  - 在 `:root`、`.dark`、`.oled` 中注入骨架屏颜色变量。
- **与 105 的衔接**：
  - `StateHandler` 的 `loading` 插槽默认使用 `AutoSkeleton` 或 `SkeletonTransition`。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「骨架屏系统」演示区，展示所有动画模式、颜色主题、布局预设、切换过渡。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/Skeleton.vue` | 修改 | 扩展 animation/theme/rounded props |
| `src/components/ui/skeleton/SkeletonList.vue` | 新增 | 列表骨架预设 |
| `src/components/ui/skeleton/SkeletonCard.vue` | 新增 | 卡片骨架预设 |
| `src/components/ui/skeleton/SkeletonTable.vue` | 新增 | 表格骨架预设 |
| `src/components/ui/skeleton/SkeletonArticle.vue` | 新增 | 文章骨架预设 |
| `src/components/ui/skeleton/SkeletonProfile.vue` | 新增 | 个人资料骨架预设 |
| `src/components/ui/skeleton/SkeletonDashboard.vue` | 新增 | 仪表盘骨架预设 |
| `src/components/ui/skeleton/AutoSkeleton.vue` | 新增 | 智能骨架屏（按 layout 字符串自动渲染） |
| `src/components/ui/skeleton/SkeletonTransition.vue` | 新增 | 骨架屏到内容的交叉淡化过渡 |
| `src/style.css` | 修改 | 注入骨架屏颜色 CSS 变量 |
| `src/styles/animations.css` | 修改 | 新增骨架屏动画关键帧 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增骨架屏系统演示区 |

## 验收标准

- [ ] `Skeleton` 组件支持 `shimmer`、`wave`、`pulse`、`glow`、`none` 五种动画模式。
- [ ] 提供主题色骨架屏模式（`theme="brand"`），使用品牌主色的极淡渐变。
- [ ] 提供 6 种内容感知布局预设：`SkeletonList`、`SkeletonCard`、`SkeletonTable`、`SkeletonArticle`、`SkeletonProfile`、`SkeletonDashboard`。
- [ ] `AutoSkeleton` 支持通过 `layout` 字符串（如 `"list-5"`、`"card-with-cover"`）自动渲染对应预设。
- [ ] 骨架屏到真实内容的切换采用交叉淡化（150ms），无闪烁感和布局跳动。
- [ ] 深色模式和 OLED 纯黑模式下骨架屏自动适配颜色，确保可见。
- [ ] 与 109 的动画降级开关联动，`animation="none"` 或全局关闭动画时骨架屏变为静态。
- [ ] ComponentPlayground 中可交互式切换动画模式、颜色主题、布局预设，并预览切换过渡效果。

## 优先级

P1

## 参考实现

- [Facebook Skeleton Screens](https://about.fb.com/news/2017/05/the-evolution-of-facebook-skeleton-screens/)：Facebook 骨架屏的设计哲学与最佳实践。
- [Chakra UI Skeleton](https://v2.chakra-ui.com/docs/components/skeleton)：Skeleton 组件的多种动画与颜色变体。
- [Ant Design Skeleton](https://ant.design/components/skeleton-cn)：丰富的骨架屏预设布局（列表、卡片、头像、段落）。
- [Vue Content Loader](https://github.com/egoist/vue-content-loader)：基于 SVG 的骨架屏加载器，可自定义形状。
- [shadcn-ui Skeleton](https://ui.shadcn.com/docs/components/skeleton)：当前已集成的基础 Skeleton 参考。
