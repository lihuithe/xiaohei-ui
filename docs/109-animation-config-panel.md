# 动画配置面板与微交互系统

## 功能背景/动机

当前脚手架提供了 `animations.css` 和 `AnimatedTransition.vue` 等基础动画设施，但动画能力停留在「有」的层面，远未达到「好用」和「可调配」：
1. **动画速度不可调**：所有过渡的 duration 和 easing 都是硬编码（如 0.3s ease-out），无法根据产品调性统一调整。
2. **微交互缺失**：按钮点击反馈、开关切换动效、Hover 状态变化等缺乏系统化的微交互设计。
3. **没有动画总控面板**：开发者或用户无法在一个地方查看、调试、关闭所有动画。
4. **动画与减少动画（Reduced Motion）的联动不够彻底**：虽然 `useReducedMotion` 可以检测偏好，但没有全局的动画开关来统一降级或关闭。

对于追求精致体验的桌面应用，**动画是情感化设计的重要载体**。提供一套「可配置、可降级、可预览」的动画系统，能显著提升脚手架的品质感。

## 功能描述

构建一套**动画配置面板与微交互系统**，包含：
1. **动画 Token 体系**：将全局动画参数（duration、 easing、delay、stagger）抽象为 CSS 变量 Token，如 `--duration-fast`、`--ease-out-expo`、`--stagger-base`。
2. **动画速度档位**：提供「快速 / 默认 / 舒缓 / 关闭」四档全局动画速度，一键调整所有过渡时长。
3. **微交互组件/指令**：
   - `RippleButton`：按钮点击水波纹反馈。
   - `AnimatedSwitch`：带弹性动效的 Switch 开关。
   - `v-hover-lift`：Hover 时轻微上浮+阴影的指令。
   - `v-press-scale`：按下时轻微缩小的指令。
   - `v-shimmer`：Skeleton shimmer 或加载状态的指令。
4. **动画配置面板**：在设置页新增「动画」Tab，提供：
   - 动画速度滑块/档位选择。
   - 各类型动画的独立开关（页面过渡、微交互、加载动画）。
   - 实时预览区：展示按钮、开关、卡片在调整后动画效果。
5. **动画调试工具（开发模式）**：当 `import.meta.env.DEV` 为真时，在页面角落显示一个浮动「动画调试器」，可逐帧慢放动画、显示动画时间轴。

## 目标用户

- **追求精致交互体验的桌面应用开发者**。
- **需要根据用户偏好或场景调节动画强度的产品**（如演示模式需要更慢的动画，效率模式需要更快的动画）。
- **希望学习现代 CSS 动画 Token 化与微交互设计的开发者**。

## 详细设计

### 交互流程

1. 开发者在 `style.css` 或 `src/themes/animation.ts` 中定义动画 Token：
   ```css
   :root {
     --duration-instant: 0ms;
     --duration-fast: 100ms;
     --duration-normal: 200ms;
     --duration-slow: 400ms;
     --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
     --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
     --stagger-base: 50ms;
   }
   ```
2. `useAnimation()` 读取用户偏好（速度档位），动态修改变量值。例如选择「舒缓」时，所有 `--duration-*` 乘以 1.5；选择「关闭」时全部变为 0。
3. 组件中使用这些 Token 替代硬编码值：
   ```css
   .btn {
     transition: transform var(--duration-fast) var(--ease-out-expo);
   }
   ```
4. 用户进入「设置 > 动画」：
   - 拖动「动画速度」滑块，实时看到预览区按钮 Hover、点击、开关切换的速度变化。
   - 关闭「页面过渡动画」后，路由切换瞬间完成。
   - 关闭「微交互」后，按钮 Hover 和点击无动效。
5. 开发模式下，右下角出现小型「动画调试」悬浮按钮，点击后展开时间轴，可慢放 0.25x 观察当前页面元素的动画。

### 涉及的技术点

- **CSS 变量作为动画 Token**：将所有 `transition-duration` 和 `transition-timing-function` 抽象为 `:root` 变量，实现全局调控。
- **Web Animations API (WAAPI)**：用于 RippleButton 的水波纹效果，相比 CSS 动画更易于程序化控制（动态创建/销毁）。
- **CSS 自定义属性与 JavaScript**：`document.documentElement.style.setProperty('--duration-normal', '0ms')` 实现运行时调控。
- **Vue 自定义指令**：`v-hover-lift`、`v-press-scale` 等通过指令实现，零侵入组件代码。
- **DevTools 浮动面板**：利用 Vue Teleport 挂载到 body，仅在 `import.meta.env.DEV` 时渲染。

### 与现有架构的衔接方式

- **新增 `src/themes/animation.ts`**：
  - 动画 Token 的默认值定义。
  - 不同速度档位对应的 Token 覆盖值。
- **新增 `src/composables/useAnimation.ts`**：
  - 管理 `animationSpeed: 'fast' | 'normal' | 'slow' | 'off'`。
  - 管理 `enablePageTransition`、`enableMicroInteraction`、`enableLoadingAnimation` 等布尔开关。
  - 提供 `applyAnimationTokens()` 将偏好注入 CSS 变量。
- **修改 `src/style.css` / `src/styles/animations.css`**：
  - 将所有硬编码的 `0.3s`、`ease-out` 替换为 CSS 变量引用。
- **新增 `src/components/animation/` 目录**：
  - `RippleButton.vue`
  - `AnimatedSwitch.vue`
  - `AnimationPreview.vue`（设置面板中的预览区）
- **新增 `src/directives/` 目录**：
  - `vHoverLift.ts`
  - `vPressScale.ts`
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「动画」Tab，集成所有动画配置项。
- **新增 `src/components/dev/AnimationDebugger.vue`**（开发模式）：
  - 浮动调试面板，提供慢放、逐帧、时间轴功能。
- **修改 `src/composables/usePageTransition.ts`**（若 102 已实现）：
  - 读取 `enablePageTransition`，为 false 时禁用过渡。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/themes/animation.ts` | 新增 | 动画 Token 默认值 |
| `src/composables/useAnimation.ts` | 新增 | 动画偏好状态管理 |
| `src/styles/animations.css` | 修改 | 硬编码值替换为 CSS 变量 |
| `src/components/animation/RippleButton.vue` | 新增 | 水波纹按钮 |
| `src/components/animation/AnimatedSwitch.vue` | 新增 | 弹性动效开关 |
| `src/components/animation/AnimationPreview.vue` | 新增 | 动画预览区 |
| `src/directives/vHoverLift.ts` | 新增 | Hover 上浮指令 |
| `src/directives/vPressScale.ts` | 新增 | 按下缩放指令 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增动画设置 Tab |
| `src/components/dev/AnimationDebugger.vue` | 新增 | 开发模式动画调试器 |

## 验收标准

- [ ] 全局动画速度支持「快速 / 默认 / 舒缓 / 关闭」四档，切换后所有过渡实时响应。
- [ ] 页面过渡、微交互、加载动画可独立开关。
- [ ] `RippleButton` 点击时产生水波纹扩散效果，支持自定义颜色和持续时间。
- [ ] `AnimatedSwitch` 切换时有弹性回弹效果（ease-out-back）。
- [ ] `v-hover-lift` 和 `v-press-scale` 指令可在任意元素上使用，不破坏原有样式。
- [ ] 设置面板中的动画预览区可实时展示调整后的效果。
- [ ] 开发模式下，浮动动画调试器可慢放至 0.25x 并显示当前页面动画时间轴。
- [ ] 与「减少动画（Reduced Motion）」系统偏好联动，系统开启后默认进入「关闭」档位。

## 优先级

P1

## 参考实现

- [Material Design Motion](https://m3.material.io/styles/motion/overview)：Google 官方动效设计系统，含 Ripple、Elevation 等规范。
- [Framer Motion](https://www.framer.com/motion/)：React 生态中声明式动画的标杆，微交互设计理念可参考。
- [VueUse Motion](https://motion.vueuse.org/)：Vue 动画组合式函数库。
- [Chrome DevTools Animations](https://developer.chrome.com/docs/devtools/css/animations)：浏览器动画调试工具，可作为开发模式调试器的 UI 参考。
