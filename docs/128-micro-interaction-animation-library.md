# 微交互动画库

## 功能背景/动机

当前脚手架已通过 109（动画配置面板与微交互系统）建立了动画 Token 体系、速度档位和基础微交互指令（v-hover-lift、v-press-scale），并通过 113（视觉反馈系统）提供了 Toast、进度指示器和操作成功动画。但这些系统主要聚焦于"管理"和"配置"层面，缺少一套**丰富、可复用、开箱即用的微交互动画原子库**。

在实际开发中，开发者经常需要以下动画效果，但每次都从零实现：
1. **加载动画**：不仅限于 `animate-spin` 的旋转圆圈，还需要点状跳动、脉冲圆环、条形波动、骨架流动等。
2. **状态切换动画**：开关切换的弹性回弹、复选框勾选时的 SVG 绘制、标签页指示器的滑动位移。
3. **数字/计数动画**：统计数字从 0 滚动到目标值、价格跳变时的颜色闪烁。
4. **情感化反馈**：收藏时的心形爆裂、复制成功时的对勾绘制、删除时的滑出消散。
5. **注意力引导**：错误时的左右抖动、新消息的红点弹跳、重要提示的呼吸脉冲。

提供一套**微交互动画库**，能让开发者像调用工具函数一样快速为界面注入"生命感"，而无需关心 CSS 关键帧的细节。

## 功能描述

构建一套**微交互动画库（Micro-interaction Animation Library）**，包含：

1. **加载动画原子（Loading Atoms）**：
   - `DotsBounce`：三个圆点依次弹跳（常见于聊天加载、搜索建议）。
   - `PulseRing`：圆环向外扩散消失，循环往复（常见于状态指示、录音中）。
   - `BarsWave`：多条竖条高低起伏波动（常见于音频播放、语音输入）。
   - `OrbitDots`：多个圆点围绕中心旋转（比单纯旋转圆圈更活泼）。
   - `TypingIndicator`：类似 iMessage 的输入指示器（三个圆点依次缩放）。
2. **状态切换动画（State Transitions）**：
   - `AnimatedSwitch`：开关切换时的弹性回弹（拇指带惯性 overshoot）。
   - `AnimatedCheckbox`：勾选时对勾的 SVG `stroke-dashoffset` 绘制动画（约 300ms）。
   - `AnimatedRadio`：单选按钮选中时的圆点从中心缩放展开的动画。
   - `TabIndicatorSlide`：标签页底部指示器在选项间平滑滑动（使用 `layout` 动画或动态计算位置）。
   - `AccordionExpand`：手风琴展开/收起时内容高度从 0 到 auto 的平滑动画（配合 Grid trick 或 WAAPI）。
3. **数字/计数动画（Number Animations）**：
   - `useCountUp`：数字从起始值滚动到目标值，支持 `duration`、`easing`、`decimals`、前缀/后缀格式化。
   - `useCountDown`：倒计时动画，支持自动更新和完成回调。
   - `NumberFlip`：类似机场翻牌效果的数字切换（旧数字向上翻走，新数字从下方翻入）。
4. **情感化反馈动画（Emotional Feedback）**：
   - `HeartBurst`：点击收藏/点赞时，心形图标先缩小再放大并伴随粒子爆裂效果（SVG 粒子向四周飞散）。
   - `CheckDraw`：对勾的 SVG 路径绘制动画（`stroke-dashoffset` 从全长到 0），用于复制成功、保存成功。
   - `CopyFeedback`：复制按钮点击后，文字瞬间替换为对勾 + "已复制"，1.5 秒后恢复。
   - `DeleteSlide`：删除项时向左滑出 + 同时高度收缩至 0 + 透明度降至 0。
   - `AddPopIn`：新增项时从下方弹入（带弹性回弹）+ 同时高度从 0 展开。
5. **注意力引导动画（Attention Grabbers）**：
   - `Shake`：左右快速抖动（用于表单校验错误、操作被拒绝）。
   - `Breathe`：周期性的缩放脉冲（用于重要提示、未读强调、录音中指示）。
   - `BadgeBounce`：Badge/红点出现时的缩放弹跳（从 scale 0 弹到 1，带 overshoot）。
   - `GlowPulse`：元素边框或阴影周期性发光（用于高亮新功能、选中状态）。
   - `Spotlight`：暗色遮罩下高亮某个区域的聚光灯效果（用于新手引导、功能发现）。
6. **动画预设 CSS 类**：
   - 上述所有动画均提供对应的 CSS 工具类（如 `.animate-shake`、`.animate-breathe`、`.animate-badge-bounce`），可直接在任意元素上使用。
7. **Vue Transition 组件封装**：
   - 将常用进入/退出动画封装为 Transition 组件（如 `<BounceIn>`、`<SlideUp>`、`<FadeScale>`），包裹任意内容即可应用动画。

## 目标用户

- **需要快速为界面添加精致微交互的开发者**。
- **追求"每个操作都有回响"情感化设计的产品团队**。
- **需要构建聊天、社交、协作类桌面应用的开发者**（对加载动画、状态反馈要求极高）。

## 详细设计

### 视觉/动画效果描述

**加载动画原子：**
```css
/* DotsBounce */
@keyframes dots-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
.dots-bounce > *:nth-child(1) { animation: dots-bounce 1.4s ease-in-out infinite; }
.dots-bounce > *:nth-child(2) { animation: dots-bounce 1.4s ease-in-out 0.16s infinite; }
.dots-bounce > *:nth-child(3) { animation: dots-bounce 1.4s ease-in-out 0.32s infinite; }

/* PulseRing */
@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
}
.pulse-ring::before {
  animation: pulse-ring 1.5s ease-out infinite;
}

/* BarsWave */
@keyframes bars-wave {
  0%, 100% { transform: scaleY(0.4); }
  50% { transform: scaleY(1); }
}
```

**情感化反馈：**
```css
/* HeartBurst 粒子 */
@keyframes heart-particle {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

/* CheckDraw */
@keyframes check-draw {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
.check-draw path {
  stroke-dasharray: 24;
  animation: check-draw 0.3s ease-out forwards;
}

/* Shake */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}
.animate-shake { animation: shake 0.4s ease-in-out; }

/* Breathe */
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}
.animate-breathe { animation: breathe 2s ease-in-out infinite; }

/* BadgeBounce */
@keyframes badge-bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-badge-bounce { animation: badge-bounce 0.4s var(--ease-out-back); }
```

**Vue Transition 组件：**
```vue
<!-- BounceIn：从下方弹入，带弹性回弹 -->
<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <slot />
  </Transition>
</template>
```

### 涉及的技术点

- **CSS `@keyframes`**：所有动画的核心，使用 CSS 变量控制 duration 和 easing（与 109 的动画 Token 联动）。
- **SVG `stroke-dasharray` / `stroke-dashoffset`**：`CheckDraw`、`AnimatedCheckbox` 的路径绘制动画。
- **Web Animations API (WAAPI)**：`TabIndicatorSlide`、`AccordionExpand` 等需要动态计算尺寸/位置的动画，用 WAAPI 比 CSS 更灵活。
- **Vue `<Transition>` 和 `<TransitionGroup>`**：进入/退出动画的标准封装。
- **`requestAnimationFrame` 计数器**：`useCountUp` 使用 rAF 实现平滑的数字滚动，而非 setInterval。
- **FLIP 动画**：`TabIndicatorSlide` 使用 First-Last-Invert-Play 技术实现指示器在选项间平滑滑动。
- **CSS 自定义属性**：动画 duration、easing 引用 `--duration-*` 和 `--ease-*` 变量，支持 109 的全局调速。

### 与现有架构的衔接方式

- **新增 `src/components/micro/` 目录**（微交互组件）：
  - `DotsBounce.vue`、`PulseRing.vue`、`BarsWave.vue`、`OrbitDots.vue`、`TypingIndicator.vue`
  - `AnimatedSwitch.vue`、`AnimatedCheckbox.vue`、`AnimatedRadio.vue`、`TabIndicatorSlide.vue`
  - `HeartBurst.vue`、`CheckDraw.vue`、`CopyFeedback.vue`
  - `Shake.vue`、`Breathe.vue`、`BadgeBounce.vue`、`GlowPulse.vue`、`Spotlight.vue`
- **新增 `src/composables/useCountUp.ts`**：
  - 数字滚动动画逻辑。
- **新增 `src/composables/useCountDown.ts`**：
  - 倒计时动画逻辑。
- **新增 `src/components/transitions/` 目录**（Transition 封装）：
  - `BounceIn.vue`、`SlideUp.vue`、`FadeScale.vue`、`SlideLeft.vue`、`SlideRight.vue`
- **修改 `src/styles/animations.css`**：
  - 新增所有微交互动画的关键帧和工具类。
- **修改现有组件**：
  - `Switch.vue`：可选接入 `AnimatedSwitch` 的弹性回弹效果。
  - `Checkbox.vue`：可选接入 `AnimatedCheckbox` 的绘制动画。
  - `Badge.vue`：可选接入 `BadgeBounce` 的出现动画。
  - `Button.vue`：接入 `CopyFeedback` 的变体（用于复制按钮）。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「微交互动画库」演示区，分类展示加载动画、状态切换、情感反馈、注意力引导。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/animations.css` | 修改 | 新增所有微交互动画关键帧 |
| `src/components/micro/DotsBounce.vue` | 新增 | 三点弹跳加载 |
| `src/components/micro/PulseRing.vue` | 新增 | 脉冲圆环加载 |
| `src/components/micro/BarsWave.vue` | 新增 | 条形波动加载 |
| `src/components/micro/TypingIndicator.vue` | 新增 | 输入指示器 |
| `src/components/micro/AnimatedSwitch.vue` | 新增 | 弹性开关动画 |
| `src/components/micro/AnimatedCheckbox.vue` | 新增 | 勾选绘制动画 |
| `src/components/micro/HeartBurst.vue` | 新增 | 心形爆裂动画 |
| `src/components/micro/CheckDraw.vue` | 新增 | 对勾绘制动画 |
| `src/components/micro/CopyFeedback.vue` | 新增 | 复制反馈组件 |
| `src/components/micro/Spotlight.vue` | 新增 | 聚光灯高亮效果 |
| `src/composables/useCountUp.ts` | 新增 | 数字滚动动画 |
| `src/composables/useCountDown.ts` | 新增 | 倒计时动画 |
| `src/components/transitions/BounceIn.vue` | 新增 | 弹性进入过渡 |
| `src/components/transitions/SlideUp.vue` | 新增 | 上滑进入过渡 |
| `src/components/transitions/FadeScale.vue` | 新增 | 淡入缩放过渡 |
| `src/components/ui/switch/Switch.vue` | 修改 | 可选接入弹性动画 |
| `src/components/ui/checkbox/Checkbox.vue` | 修改 | 可选接入绘制动画 |
| `src/components/ui/badge/Badge.vue` | 修改 | 可选接入弹跳动画 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增微交互动画演示区 |

## 验收标准

- [ ] 提供至少 5 种加载动画原子（点状、圆环、条形、轨道、输入指示器）。
- [ ] `AnimatedCheckbox` 勾选时对勾以 300ms 绘制动画出现。
- [ ] `AnimatedSwitch` 切换时拇指带弹性回弹（overshoot）。
- [ ] `useCountUp` 支持从任意起始值滚动到目标值，支持小数位和格式化。
- [ ] `HeartBurst` 点击时心形先缩小再放大，伴随 6-8 个粒子向四周飞散。
- [ ] `CheckDraw` 对勾以 SVG 路径绘制动画播放，时长约 300ms。
- [ ] `Shake` 动画可在表单校验失败时触发，左右抖动 4 次。
- [ ] `BadgeBounce` 红点出现时从 scale 0 弹跳到 1，带 overshoot。
- [ ] `Spotlight` 可在新手引导时高亮页面任意区域，其余区域变暗。
- [ ] 所有动画 duration 和 easing 引用 109 的 CSS 变量，支持全局调速。
- [ ] 提供对应的 CSS 工具类（`.animate-shake`、`.animate-breathe` 等），可在任意元素使用。
- [ ] ComponentPlayground 中可交互式预览所有微交互动画。

## 优先级

P1

## 参考实现

- [React Spring](https://www.react-spring.dev/)：弹簧物理动画理念，微交互的核心参考。
- [Framer Motion](https://www.framer.com/motion/)：声明式动画库，布局动画（layout）和进入/退出动画设计参考。
- [Anime.js](https://animejs.com/)：轻量级 JS 动画库，SVG 路径动画和 stagger 效果参考。
- [Lottie](https://airbnb.io/lottie/)：复杂情感化动画（如 HeartBurst）的 JSON 动画方案备选。
- [CSS-Tricks - FLIP Animation](https://css-tricks.com/animating-layouts-with-the-flip-technique/)：FLIP 动画技术详解。
