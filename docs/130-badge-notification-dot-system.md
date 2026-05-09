# 徽章/红点设计系统

## 功能背景/动机

当前脚手架在 `components/ui/badge/` 中提供了一个基础的 `Badge.vue` 组件（基于 CVA 变体），支持 `default`、`secondary`、`destructive`、`outline`、`ghost`、`link` 等颜色变体。同时，113（视觉反馈系统）规划了 Badge 的增强（count/dot/status 三种模式）和 `NotificationDot` 组件。但 Badge/红点作为桌面应用中最高频的**状态指示元素**之一，其设计仍然缺乏系统化的深度规范：

1. **形状单一**：只有 pill（圆角胶囊）一种形状，缺少方形徽标、圆形徽标、点状徽标等形态。
2. **位置系统缺失**：Badge 只能作为独立文本标签使用，无法方便地附着在头像、图标、按钮、列表项的任意角落。
3. **计数动画粗糙**：数字从 0 变到 5 时是瞬间替换，缺少数字滚动或缩放的过渡效果。
4. **红点脉冲不规范**：不同组件的红点脉冲动画各不相同（有的缩放、有的透明度变化、有的颜色闪烁）。
5. **状态语义混乱**："在线"用绿色圆点还是绿色边框？"忙碌"用红色还是橙色？没有统一的状态色+形状规范。
6. **多层徽章无堆叠规范**：当头像同时有"未读消息"红点和"认证"蓝勾时，两个 Badge 的位置冲突。

提供一套**徽章/红点设计系统**，能让开发者像使用 Lego 积木一样，通过组合"形状+颜色+位置+动画"快速构建任何场景下的状态指示器。

## 功能描述

构建一套**徽章/红点设计系统**，包含：

1. **Badge 形状体系**：
   - `pill`（胶囊形）：默认形状，用于计数、标签、状态文字。
   - `square`（圆角方形）：用于方形图标/应用徽标上的角标。
   - `circle`（正圆形）：用于纯数字徽标（如头像右上角的消息数）。
   - `dot`（圆点）：最小形态，仅表示"有新内容"，不显示数字。
   - `ring`（环形边框）：用于状态指示（如在线/离线的边框色）。
2. **Badge 位置系统（Positioning System）**：
   - `BadgeOverlay` 组件：包裹任意目标元素，Badge 可定位在 12 个方位（`top-left`、`top-right`、`top-center`、`bottom-left`、`bottom-right`、`bottom-center`、`left-top`、`left-center`、`left-bottom`、`right-top`、`right-center`、`right-bottom`）。
   - 支持 `offset` 微调（如 `offset-x="2" offset-y="-1"`）。
   - 支持 `overlap` 模式（Badge 与目标元素边缘重叠）和 `inset` 模式（Badge 完全在目标元素内部）。
3. **动态红点脉冲系统**：
   - `NotificationDot`：独立的红点组件，支持多种脉冲模式：
     - `pulse-scale`：周期性缩放（如心跳）。
     - `pulse-glow`：周期性发光阴影扩散。
     - `pulse-blink`：周期性透明度闪烁。
     - `static`：无动画。
   - 支持 `priority` 配置：高优先级红点脉冲更快，低优先级更慢。
4. **计数徽章动画**：
   - 数字变化时执行滚动/弹跳动画（数字向上滚走，新数字从下方滚入）。
   - 支持 `overflow` 显示（如 `99+`、`999+`、`1k+`）。
   - 支持 `show-zero` 配置（数字为 0 时是否隐藏或显示 "0"）。
5. **状态徽章规范**：
   - 定义标准状态语义：`online`（在线）、`offline`（离线）、`away`（离开）、`busy`（忙碌）、`dnd`（勿扰）、`verified`（认证）、`premium`（高级会员）、`beta`（测试版）。
   - 每种状态有固定的颜色、形状和可选图标（如 `verified` 用蓝色勾，`premium` 用金色星）。
6. **徽章组/堆叠（Badge Group）**：
   - 多个 Badge 可水平或垂直堆叠，自动处理间距和层级（z-index）。
   - 支持 `max-count` 截断（如显示 "+3" 表示还有 3 个未展示）。
7. **Badge 动画规范**：
   - 出现：从 scale 0 弹跳到 1（带 overshoot，约 300ms）。
   - 消失：缩小到 0 同时透明度降低（约 200ms）。
   - 数字变化：旧数字向上滑出，新数字从下方滑入（约 250ms）。
   - 与 128 的微交互动画库联动，使用统一的缓动曲线。

## 目标用户

- **需要构建消息中心、通知系统、用户列表的开发者**。
- **需要统一状态指示视觉规范的产品团队**。
- **需要头像徽标、角标、认证标识等复杂 Badge 场景的开发者**。

## 详细设计

### 视觉/动画效果描述

**Badge 形状 CSS：**
```css
.badge-pill {
  border-radius: var(--radius-full);
  padding: 0 8px;
  min-width: 20px;
  height: 20px;
}
.badge-square {
  border-radius: var(--radius-md);
  padding: 0 6px;
  min-width: 18px;
  height: 18px;
}
.badge-circle {
  border-radius: 9999px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: grid;
  place-content: center;
}
.badge-dot {
  border-radius: 9999px;
  width: 8px;
  height: 8px;
  padding: 0;
}
.badge-ring {
  border-radius: 9999px;
  width: 12px;
  height: 12px;
  background: transparent;
  border: 2px solid currentColor;
  padding: 0;
}
```

**位置系统（以 top-right 为例）：**
```css
.badge-position-top-right {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(30%, -30%);
}
.badge-position-top-right[data-overlap="false"] {
  transform: translate(50%, -50%);
}
.badge-position-top-right[data-inset="true"] {
  transform: translate(-20%, 20%);
}
```

**脉冲动画：**
```css
@keyframes dot-pulse-scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.4); }
}
@keyframes dot-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
  50% { box-shadow: 0 0 0 6px currentColor; opacity: 0.6; }
}
@keyframes dot-pulse-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

**计数变化动画：**
```css
@keyframes count-roll-out {
  to { transform: translateY(-100%); opacity: 0; }
}
@keyframes count-roll-in {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**状态色规范：**
```css
:root {
  --badge-status-online:   oklch(0.65 0.18 145);  /* 绿 */
  --badge-status-away:     oklch(0.75 0.16 85);   /* 黄 */
  --badge-status-busy:     oklch(0.6  0.18 25);   /* 红 */
  --badge-status-offline:  oklch(0.6  0 0);       /* 灰 */
  --badge-status-verified: oklch(0.6  0.15 250);  /* 蓝 */
  --badge-status-premium:  oklch(0.7  0.14 85);   /* 金 */
  --badge-status-beta:     oklch(0.6  0.1  300);  /* 紫 */
}
```

### 涉及的技术点

- **绝对定位 + Transform**：BadgeOverlay 使用 `position: relative` 包裹目标，`position: absolute` 定位 Badge，通过 `translate` 精确控制偏移。
- **CSS 动画关键帧**：脉冲、弹跳、数字滚动等动画，引用 109/128 的 CSS 变量控制时长。
- **数字格式化**：`99+` 等溢出处理，使用 `Intl.NumberFormat` 或简单逻辑实现 `1k+`、`1m+`。
- **Vue 的 `<Transition>`**：Badge 出现/消失使用 Vue 的过渡系统，支持 `mode="out-in"` 处理数字变化。
- **CSS 变量主题适配**：状态色、Badge 背景色通过 CSS 变量注入，深浅模式自动切换。

### 与现有架构的衔接方式

- **修改 `src/components/ui/badge/Badge.vue`**：
  - 扩展 props：
    - `shape: 'pill' | 'square' | 'circle' | 'dot' | 'ring'`（默认 pill）
    - `status: 'online' | 'offline' | 'away' | 'busy' | 'dnd' | 'verified' | 'premium' | 'beta'`（可选）
    - `count: number`（数字徽标，与默认插槽互斥）
    - `overflow: '99+' | '999+' | '1k+' | ((n: number) => string)`
    - `showZero: boolean`
    - `animation: 'bounce' | 'fade' | 'none'`（出现/消失动画）
  - 当传入 `status` 时，自动应用对应的颜色和形状。
- **新增 `src/components/ui/badge/BadgeOverlay.vue`**：
  - 包裹组件，Props: `position`、`offsetX`、`offsetY`、`overlap`、`inset`。
  - 默认插槽：目标元素。
  - `badge` 插槽：Badge 内容。
- **新增 `src/components/ui/badge/NotificationDot.vue`**：
  - Props: `pulse: 'scale' | 'glow' | 'blink' | 'none'`、`priority: 'high' | 'normal' | 'low'`、`color`。
  - 高优先级 pulse 间隔 1.5s，正常 2.5s，低优先级 4s。
- **新增 `src/components/ui/badge/BadgeGroup.vue`**：
  - Props: `max`、`direction`。
  - 水平/垂直堆叠多个 Badge，超出 `max` 显示 `+n`。
- **修改 `src/components/ui/avatar/AvatarBadge.vue`**：
  - 接入 BadgeOverlay，支持标准状态徽章。
- **新增 `src/composables/useBadgeAnimation.ts`**：
  - 管理 Badge 出现/消失/数字变化的动画时序。
- **修改 `src/style.css`**：
  - 注入 `--badge-status-*` CSS 变量。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「徽章系统」演示区，展示所有形状、位置、脉冲模式、状态、动画效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/badge/Badge.vue` | 修改 | 扩展 shape/status/count/overflow 等 props |
| `src/components/ui/badge/BadgeOverlay.vue` | 新增 | Badge 位置包裹组件 |
| `src/components/ui/badge/NotificationDot.vue` | 新增 | 动态红点组件 |
| `src/components/ui/badge/BadgeGroup.vue` | 新增 | 徽章堆叠组件 |
| `src/components/ui/avatar/AvatarBadge.vue` | 修改 | 接入 BadgeOverlay |
| `src/composables/useBadgeAnimation.ts` | 新增 | Badge 动画时序管理 |
| `src/style.css` | 修改 | 注入 badge 状态色变量 |
| `src/styles/animations.css` | 修改 | 新增 Badge 动画关键帧 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增徽章系统演示区 |

## 验收标准

- [ ] Badge 支持 `pill`、`square`、`circle`、`dot`、`ring` 五种形状。
- [ ] `BadgeOverlay` 支持 12 个方位定位，支持 `overlap` 和 `inset` 模式。
- [ ] `NotificationDot` 支持 `scale`、`glow`、`blink`、`none` 四种脉冲模式，高/中/低三档频率。
- [ ] 计数 Badge 数字变化时带有滚动/弹跳过渡动画，支持 `99+` 溢出显示。
- [ ] 定义 `online`/`offline`/`away`/`busy`/`verified`/`premium`/`beta` 七种标准状态的颜色和形状规范。
- [ ] `BadgeGroup` 支持水平/垂直堆叠，超出数量自动截断为 `+n`。
- [ ] Badge 出现动画为从 scale 0 弹跳到 1（带 overshoot），消失为缩小淡出。
- [ ] AvatarBadge 接入后可显示标准状态指示（如在线绿点、认证蓝勾）。
- [ ] 深色模式下 Badge 颜色自动适配，保持足够对比度。
- [ ] ComponentPlayground 中可交互式预览所有 Badge 变体、位置、动画效果。

## 优先级

P1

## 参考实现

- [Ant Design Badge](https://ant.design/components/badge-cn)：徽标数的位置系统、独立红点、状态点设计。
- [Material Design 3 - Badges](https://m3.material.io/components/badges/overview)：Material Design 徽标规范。
- [Chakra UI Badge](https://v2.chakra-ui.com/docs/components/badge)：Badge 的形状和颜色变体。
- [Tailwind CSS Badge](https://tailwindcss.com/docs/plugins#adding-components)：Badge 组件的常见实现方式。
