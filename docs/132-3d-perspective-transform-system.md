# 3D/透视变换效果系统

## 功能背景/动机

当前脚手架的所有动画都局限于 2D 平面（位移、缩放、旋转、透明度）。在 2026 年的现代桌面应用中，适度的**3D 透视变换**能够创造令人印象深刻的视觉深度和交互质感，尤其是在以下场景中：

1. **卡片翻转展示**：设置项的"正面显示摘要，背面显示详细说明"；卡片游戏的正反面翻转。
2. **3D 轮播/封面流**：图片或内容卡片以 3D 轮播形式展示（如 Apple Cover Flow）。
3. **悬停倾斜效果**：鼠标在卡片上移动时，卡片跟随光标产生轻微的 3D 倾斜，创造"浮于屏幕"的错觉。
4. **页面切换深度**：路由切换时，旧页面"向后推远"、新页面"向前拉近"的 3D 过渡。
5. **折叠面板 3D 展开**：侧边栏或抽屉以 3D 折纸方式展开。

然而，3D 效果若滥用（过度旋转、频繁变换）会导致眩晕感，且对低端 GPU 有性能压力。提供一套**克制的、可配置、可降级**的 3D 效果系统，能让开发者在需要时安全地使用 3D 变换，而不会被其复杂性困扰。

## 功能描述

构建一套**3D/透视变换效果系统**，包含：

1. **3D 变换工具类/Token**：
   - 定义 CSS `perspective`、`transform-style: preserve-3d`、`backface-visibility` 的标准值。
   - 提供 `.perspective-sm`（500px）、`.perspective-md`（1000px）、`.perspective-lg`（1500px）工具类。
   - 提供标准 3D 旋转工具类：`.rotate-x-15`、`.rotate-y-30`、`.rotate-z-10`、`.rotate-3d`。
2. **卡片翻转组件 `FlipCard`**：
   - 支持水平翻转（X 轴）和垂直翻转（Y 轴）。
   - 支持触发方式：点击翻转、Hover 翻转、编程式翻转（`v-model:flipped`）。
   - 支持 `front` 和 `back` 两个插槽。
   - 翻转动画使用 `cubic-bezier` 缓动，时长约 500-600ms，创造真实的"翻面"物理感。
3. **3D 轮播组件 `Carousel3D`**：
   - 基于现有 `Carousel.vue` 的 3D 扩展。
   - 当前项位于前方中心，两侧项向里旋转并缩小，形成弧形排列。
   - 支持 `perspective` 和 `rotation` 参数调节弧度。
   - 支持自动播放和手动拖拽滑动。
4. **悬停倾斜指令 `v-tilt`**：
   - 鼠标在元素上移动时，元素根据光标相对中心的位置产生 X/Y 轴旋转（最大 ±15°）。
   - 支持 `max-tilt`、`scale`、`glare`（光泽反射效果）、`reverse`（反向倾斜）等参数。
   - 鼠标离开时，元素平滑回正（弹性回弹）。
5. **3D 页面过渡**：
   - 扩展 102（页面切换动画编排），新增 `3d-push`、`3d-pull`、`3d-flip` 三种 3D 路由过渡模式。
   - `3d-push`：旧页面沿 Z 轴向后推远（scale 缩小 + 亮度降低），新页面从正常位置淡入。
   - `3d-pull`：新页面从 Z 轴前方拉近（scale 放大 → 正常），旧页面保持不动。
6. **3D 折叠面板 `FoldPanel`**：
   - 侧边栏或内容区以 3D 折纸方式展开/收起，带有真实的"折叠线"阴影。
   - 支持 `fold-direction: left | right | top | bottom`。
7. **性能与安全**：
   - 所有 3D 效果使用 `transform`（GPU 加速），不使用 `top/left/width/height` 等触发重排的属性。
   - `prefers-reduced-motion` 时所有 3D 效果降级为 2D 等效动画（如翻转变为淡入淡出）。
   - 提供全局 `enable3D` 开关，可在设置中彻底关闭所有 3D 效果。

## 目标用户

- **需要为仪表盘、画廊、展示页增加视觉深度的开发者**。
- **构建媒体播放器、相册、卡片收集类应用的开发者**。
- **希望学习现代 CSS 3D 变换在 Vue 中应用方式的开发者**。

## 详细设计

### 视觉/动画效果描述

**3D 透视基础：**
```css
.perspective-sm  { perspective: 500px; }
.perspective-md  { perspective: 1000px; }
.perspective-lg  { perspective: 1500px; }

.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}
```

**FlipCard 翻转：**
```css
.flip-card-inner {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card-inner.is-flipped-x {
  transform: rotateX(180deg);
}
.flip-card-inner.is-flipped-y {
  transform: rotateY(180deg);
}
.flip-card-front,
.flip-card-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}
.flip-card-back {
  transform: rotateY(180deg); /* 或 rotateX(180deg) */
}
```

**Carousel3D 弧形排列：**
```css
.carousel-3d-item {
  transition: all 0.5s ease-out;
}
.carousel-3d-item[data-position="prev"] {
  transform: translateX(-60%) translateZ(-200px) rotateY(25deg) scale(0.85);
  opacity: 0.6;
}
.carousel-3d-item[data-position="next"] {
  transform: translateX(60%) translateZ(-200px) rotateY(-25deg) scale(0.85);
  opacity: 0.6;
}
.carousel-3d-item[data-position="active"] {
  transform: translateX(0) translateZ(0) rotateY(0) scale(1);
  opacity: 1;
}
```

**v-tilt 悬停倾斜：**
```css
.tilt-element {
  transition: transform 0.1s ease-out;
  transform: perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(var(--tilt-scale, 1));
}
.tilt-element[data-glare="true"]::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.2) 45%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.2) 55%,
    transparent 60%
  );
  transform: translateX(var(--glare-x, -100%));
  pointer-events: none;
}
```

**3D 页面过渡（3d-push）：**
```css
.3d-push-leave-active {
  transition: all 0.4s var(--ease-out-expo);
}
.3d-push-leave-to {
  transform: perspective(1000px) translateZ(-200px) scale(0.9);
  opacity: 0.5;
  filter: brightness(0.7);
}
.3d-push-enter-active {
  transition: all 0.4s var(--ease-out-expo) 0.1s;
}
.3d-push-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
```

### 涉及的技术点

- **CSS 3D Transforms**：`perspective`、`transform-style: preserve-3d`、`backface-visibility`、`rotateX/Y/Z`、`translateZ`。
- **鼠标位置计算**：`v-tilt` 需要计算鼠标相对元素中心的偏移量，映射到旋转角度。
- **`requestAnimationFrame`**：鼠标移动时的倾斜更新使用 rAF，避免过度重绘。
- **Vue `<Transition>` 的 3D 模式**：扩展 `AnimatedTransition.vue`（102）支持 3D 变体。
- **GPU 加速**：所有变换使用 `transform` 和 `opacity`，确保合成层渲染。
- **降级策略**：`prefers-reduced-motion` 或 `enable3D=false` 时，3D 翻转降级为 opacity 淡入淡出，3D 轮播降级为普通滑动。

### 与现有架构的衔接方式

- **新增 `src/styles/3d.css`**：
  - 定义所有 3D 工具类（perspective、rotate、preserve-3d、backface-visibility）。
- **新增 `src/components/3d/FlipCard.vue`**：
  - Props: `axis: 'x' | 'y'`、`trigger: 'click' | 'hover' | 'manual'`、`flipped`。
  - 插槽: `front`、`back`。
- **新增 `src/components/3d/Carousel3D.vue`**：
  - Props: `items`、`perspective`、`rotation`、`spacing`。
- **新增 `src/directives/vTilt.ts`**：
  - 参数: `maxTilt`、`scale`、`glare`、`reverse`、`speed`。
- **修改 `src/components/ui/AnimatedTransition.vue`（102）**：
  - 扩展 `name` prop，新增 `3d-push`、`3d-pull`、`3d-flip` 选项。
- **新增 `src/components/3d/FoldPanel.vue`**：
  - Props: `direction`、`folded`、`duration`。
- **修改 `src/style.css`**：
  - `@import './styles/3d.css'`。
- **修改 `src/composables/useAnimation.ts`（109）**：
  - 新增 `enable3D` 状态，纳入动画配置体系。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「3D 效果」演示区，展示 FlipCard、Carousel3D、v-tilt、3D 过渡。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/3d.css` | 新增 | 3D 变换工具类 |
| `src/components/3d/FlipCard.vue` | 新增 | 卡片翻转组件 |
| `src/components/3d/Carousel3D.vue` | 新增 | 3D 轮播组件 |
| `src/components/3d/FoldPanel.vue` | 新增 | 3D 折叠面板 |
| `src/directives/vTilt.ts` | 新增 | 悬停倾斜指令 |
| `src/components/ui/AnimatedTransition.vue` | 修改 | 扩展 3D 过渡模式 |
| `src/style.css` | 修改 | 导入 3d.css |
| `src/composables/useAnimation.ts` | 修改 | 新增 enable3D 开关 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增 3D 效果开关 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增 3D 效果演示区 |

## 验收标准

- [ ] 提供 `.perspective-sm/md/lg`、`.preserve-3d`、`.backface-hidden` 等 3D 工具类。
- [ ] `FlipCard` 支持 X/Y 轴翻转，支持点击/Hover/手动三种触发方式，翻转动画 500-600ms。
- [ ] `Carousel3D` 当前项在中心，两侧项向内旋转并缩小，支持手动拖拽和自动播放。
- [ ] `v-tilt` 指令可使元素跟随鼠标产生最大 ±15° 的 3D 倾斜，支持光泽反射效果。
- [ ] 路由切换支持 `3d-push`、`3d-pull`、`3d-flip` 三种 3D 过渡模式。
- [ ] `FoldPanel` 支持左/右/上/下四个方向的 3D 折纸式展开/收起。
- [ ] 所有 3D 变换使用 `transform`（GPU 加速），无布局重排。
- [ ] `prefers-reduced-motion` 时所有 3D 效果降级为 2D 等效动画。
- [ ] 设置面板中提供全局 `enable3D` 开关，关闭后所有 3D 效果禁用。
- [ ] ComponentPlayground 中可交互式预览所有 3D 效果。

## 优先级

P2

## 参考实现

- [CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms)：MDN 3D 变换完整文档。
- [Vanilla Tilt.js](https://micku7zu.github.io/vanilla-tilt.js/)：经典的悬停倾斜效果库，v-tilt 指令的核心参考。
- [Apple Cover Flow](https://en.wikipedia.org/wiki/Cover_Flow)：3D 轮播/封面流的开创性设计。
- [React Card Flip](https://www.npmjs.com/package/react-card-flip)：卡片翻转组件的实现参考。
- [Framer Motion 3D](https://www.framer.com/motion/three-introduction/)：React 生态中 3D 动画的设计理念参考。
