# 分割线/分隔符系统

## 功能背景/动机

当前脚手架仅在 `components/ui/separator/` 中提供了一个基础的 `Separator.vue` 组件（基于 Reka UI），功能非常单一：一条纯色的水平或垂直线。在实际桌面应用中，分割线承担着**视觉分区、信息层级引导、装饰点缀**的重要作用，但现有实现远不能满足多样化的场景需求：

1. **样式单一**：只有纯色实线，无法表达"渐变过渡"、"文字分隔"、"图标点缀"等丰富的分割语义。
2. **深色模式表现力不足**：在深色背景上，一条低对比度的灰色分割线几乎隐形，无法有效区分区域。
3. **缺乏语义化变体**：不同场景（表单区块分隔、列表项分隔、页面大区块分隔）应该使用不同强度的分割线，当前无此区分。
4. **无动画支持**：分割线无法配合内容展开/收起进行动态显示/隐藏。
5. **间距不规范**：分割线与其上下内容的间距全凭开发者手写 `my-4`、`my-6`，缺乏统一规范。

提供一套**系统化、语义化、可配置的分割线/分隔符系统**，能让开发者在任何场景下都能选择合适的分隔方式，提升界面的信息层级感。

## 功能描述

构建一套**分割线/分隔符系统**，包含：

1. **分割线类型体系（Divider Types）**：
   - **Solid（实线）**：最基础的分割线，用于列表项、菜单项等紧密排列的内容。
   - **Dashed（虚线）**：用于表示"可拖拽调整"或"临时/草稿"状态的分隔。
   - **Dotted（点线）**：用于松散关联的内容分隔（如表单中的可选字段组）。
   - **Gradient（渐变线）**：两端透明、中间不透明的渐变，用于页面大区块之间的优雅过渡（如 Hero 区与内容区）。
   - **Glowing（发光线）**：带有微弱发光效果的线条，用于强调重要分隔（如设置页中不同分类之间）。
2. **带内容的分隔符（Divider with Content）**：
   - **Text Divider**：分割线中间嵌入文字（如 "或"、"更多设置"、"高级选项"）。
   - **Icon Divider**：分割线中间嵌入图标（如向下箭头暗示继续阅读）。
   - **Badge Divider**：分割线中间嵌入 Badge 标签（如 "New"、"Beta"）。
3. **语义化强度体系（Divider Weights）**：
   - `weight-light`：最细（0.5px），用于卡片内部子项分隔。
   - `weight-default`：标准（1px），用于列表项、下拉菜单项分隔。
   - `weight-strong`：较粗（2px），用于表单区块、设置分类分隔。
   - `weight-heavy`：最粗（3-4px），用于页面大区块分隔，通常配合渐变或发光效果。
4. **间距规范 Token**：
   - 定义分割线与其上下内容的间距 Token：`divider-gap-sm`、`divider-gap-md`、`divider-gap-lg`，确保所有分割线周围留白一致。
5. **动画支持**：
   - 分割线可配合内容展开从 `scaleX(0)` 动画到 `scaleX(1)`（水平线）或 `scaleY(0)` 到 `scaleY(1)`（垂直线）。
   - 渐变分割线可带有流动的光效动画（shimmer）。
6. **垂直分割线增强**：
   - 工具栏按钮组之间的垂直分隔（如富文本编辑器工具栏）。
   - 支持高度自适应（`self-stretch`）或固定高度（如 `h-4` 居中对齐）。

## 目标用户

- **需要为表单、设置页、列表、菜单提供丰富分隔样式的开发者**。
   - **追求信息层级清晰、视觉节奏感强的产品设计师**。
   - **需要分割线动画配合内容展开/收起交互的开发者**。

## 详细设计

### 视觉/动画效果描述

**分割线类型 CSS：**
```css
.divider-solid {
  background: var(--divider-color);
}
.divider-dashed {
  background: repeating-linear-gradient(
    90deg,
    var(--divider-color) 0,
    var(--divider-color) 6px,
    transparent 6px,
    transparent 12px
  );
}
.divider-dotted {
  background: repeating-linear-gradient(
    90deg,
    var(--divider-color) 0,
    var(--divider-color) 2px,
    transparent 2px,
    transparent 8px
  );
}
.divider-gradient {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--divider-color) 20%,
    var(--divider-color) 80%,
    transparent 100%
  );
}
.divider-glowing {
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--divider-color) 30%,
    var(--primary) 50%,
    var(--divider-color) 70%,
    transparent 100%
  );
  box-shadow: 0 0 8px var(--primary-glow);
}
```

**分割线强度：**
```css
.divider-weight-light   { height: 0.5px; }
.divider-weight-default { height: 1px; }
.divider-weight-strong  { height: 2px; }
.divider-weight-heavy   { height: 3px; border-radius: 1.5px; }
```

**带内容的分隔符：**
```css
.divider-with-content {
  display: flex;
  align-items: center;
  gap: var(--divider-content-gap);
}
.divider-with-content::before,
.divider-with-content::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--divider-color));
}
.divider-with-content::before {
  background: linear-gradient(90deg, transparent, var(--divider-color));
}
.divider-with-content::after {
  background: linear-gradient(90deg, var(--divider-color), transparent);
}
```

**间距 Token：**
```css
:root {
  --divider-color: var(--border);
  --divider-gap-sm: var(--space-2);   /* 8px */
  --divider-gap-md: var(--space-4);   /* 16px */
  --divider-gap-lg: var(--space-6);   /* 24px */
  --divider-content-gap: var(--space-3); /* 12px */
}
.dark {
  --divider-color: hsl(0 0% 100% / 0.1);
}
```

**动画效果：**
```css
/* 分割线从中心展开 */
.divider-expand {
  transform: scaleX(0);
  transition: transform 0.4s var(--ease-out-expo);
}
.divider-expand.is-visible {
  transform: scaleX(1);
}

/* 渐变线流动光效 */
@keyframes divider-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.divider-shimmer {
  background-size: 200% 100%;
  animation: divider-shimmer 2s linear infinite;
}
```

### 涉及的技术点

- **CSS 渐变与重复渐变**：`repeating-linear-gradient` 实现虚线/点线效果，无需额外 SVG。
- **伪元素 `::before`/`::after`**：带内容的分隔符利用伪元素创建两侧渐变线。
- **CSS 变量动态调整**：通过 `--divider-color` 统一控制所有分割线颜色，深色模式下自动提亮。
- **Tailwind v4 变体扩展**：新增 `data-orientation` 和 `data-weight` 变体支持。
- **Vue Transition 集成**：分割线可作为独立元素参与 Vue 的进入/退出过渡。

### 与现有架构的衔接方式

- **修改 `src/components/ui/separator/Separator.vue`**：
  - 扩展 props：
    - `type: 'solid' | 'dashed' | 'dotted' | 'gradient' | 'glowing'`（默认 solid）
    - `weight: 'light' | 'default' | 'strong' | 'heavy'`（默认 default）
    - `gap: 'sm' | 'md' | 'lg' | 'none'`（默认 none，表示无额外间距）
    - `animate: boolean`（是否启用展开动画）
  - 保留原有的 `orientation` prop。
- **新增 `src/components/ui/separator/DividerWithContent.vue`**：
  - Props: `type`、`weight`、`orientation`。
  - 默认插槽：中间的内容（文字/图标/Badge）。
- **新增 `src/components/ui/separator/ToolbarSeparator.vue`**：
  - 专为工具栏设计的垂直短分割线（固定高度 `h-4` 或 `h-5`，垂直居中）。
- **修改 `src/styles/elevation.css`（121）**：
  - 若 121 已实现，分割线可作为 Elevation 变化的视觉过渡元素。
- **修改现有组件中的分割线使用**：
  - `DropdownMenuSeparator.vue`、`ContextMenuSeparator.vue`、`SelectSeparator.vue`：使用 `weight="light"`。
  - `CommandSeparator.vue`：使用 `weight="default"`。
  - `BreadcrumbSeparator.vue`：保持为图标形式，但可增加 `DividerWithContent` 的变体支持。
  - `StepperSeparator.vue`：根据步骤状态切换 `type`（已完成用 solid，待办用 dashed）。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「分割线系统」演示区，展示所有类型、强度、带内容、动画效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/separator/Separator.vue` | 修改 | 扩展 type/weight/gap/animate props |
| `src/components/ui/separator/DividerWithContent.vue` | 新增 | 带内容的分隔符 |
| `src/components/ui/separator/ToolbarSeparator.vue` | 新增 | 工具栏垂直分隔符 |
| `src/style.css` | 修改 | 注入 --divider-* CSS 变量 |
| `src/styles/animations.css` | 修改 | 新增分割线展开/shimmer 动画 |
| `src/components/ui/dropdown-menu/DropdownMenuSeparator.vue` | 修改 | 接入 weight="light" |
| `src/components/ui/context-menu/ContextMenuSeparator.vue` | 修改 | 接入 weight="light" |
| `src/components/ui/command/CommandSeparator.vue` | 修改 | 接入 weight="default" |
| `src/components/ui/stepper/StepperSeparator.vue` | 修改 | 根据状态切换 type |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增分割线系统演示区 |

## 验收标准

- [ ] 提供 `solid`、`dashed`、`dotted`、`gradient`、`glowing` 五种分割线类型。
- [ ] 提供 `light`、`default`、`strong`、`heavy` 四种分割线强度。
- [ ] `DividerWithContent` 支持在分割线中间嵌入文字、图标或 Badge，两侧渐变过渡。
- [ ] 垂直分割线支持自适应高度和工具栏短分隔两种模式。
- [ ] 分割线支持从中心展开的进入动画（`scaleX` 从 0 到 1）。
- [ ] 渐变分割线支持 shimmer 流动光效动画。
- [ ] 深色模式下分割线自动提亮，确保始终可见。
- [ ] 所有分割线周围间距通过 `gap` prop 规范化，无硬编码 `my-4`。
- [ ] StepperSeparator 根据步骤状态自动切换实线/虚线。
- [ ] ComponentPlayground 中可交互式预览所有分割线效果。

## 优先级

P2

## 参考实现

- [Ant Design Divider](https://ant.design/components/divider-cn)：带文字、虚线、垂直分割线的经典实现。
- [Material Design 3 - Dividers](https://m3.material.io/components/divider/overview)：Material Design 分割线规范。
- [Chakra UI Divider](https://v2.chakra-ui.com/docs/components/divider)：简洁的分割线组件设计。
- [shadcn-ui Separator](https://ui.shadcn.com/docs/components/separator)：当前已集成的 Reka UI 分割线基础。
