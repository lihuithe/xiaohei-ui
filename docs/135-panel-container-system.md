# 内容容器/面板系统

## 功能背景/动机

当前脚手架提供了 `Card.vue` 作为基础内容容器，但 `Card` 的定位是"通用卡片"，无法覆盖桌面应用中丰富的容器场景。在实际产品设计中，开发者经常需要以下容器变体，但每次都从零实现：

1. **信息面板（Panel）**：用于设置页、详情页的区块分组，需要明确的标题栏、可折叠能力、边框/背景区分。
2. **高亮提示区（Callout / Alert Box）**：用于向用户展示重要提示、警告、操作建议，需要醒目的左侧色条或图标区。
3. **内嵌区块（Well / Inset）**：用于在内容中嵌入次级信息（如引用、备注、预览），视觉上需要"陷入"页面而非"浮起"。
4. **横幅条（Banner）**：页面顶部的全局通知或状态条，通常横跨整个内容区。
5. **代码/数据区块（Code Block / Data Block）**：等宽字体展示，需要复制按钮、语法高亮占位、深色背景。
6. **对比容器（Compare / Side-by-Side）**：左右或上下并列的两个容器，用于对比展示（如 A/B 测试、前后对比）。

缺乏系统化的容器体系会导致：同一应用中 Panel 的圆角、边框、标题样式各不相同；Callout 的颜色使用随意；Well 和 Card 的层级关系混乱。提供一套**内容容器/面板系统**，能让开发者根据信息层级和语义快速选择合适的容器。

## 功能描述

构建一套**内容容器/面板系统**，包含：

1. **Panel 组件**：
   - 标准信息面板，带有可选的标题栏（`header` 插槽）、内容区（默认插槽）、底部操作区（`footer` 插槽）。
   - 支持 `collapsible` 模式：标题栏右侧显示展开/收起箭头，点击后内容区以高度动画展开/收起。
   - 支持 `bordered`、`ghost`（透明背景）、`elevated`（带阴影）三种外观变体。
   - 支持 `size`：紧凑（`sm`，内边距小）、默认（`md`）、宽松（`lg`）。
2. **Callout 组件**：
   - 高亮提示区，左侧带有彩色竖条（`accent border`）或图标区。
   - 支持语义化变体：`info`（蓝）、`success`（绿）、`warning`（黄）、`danger`（红）、`neutral`（灰）。
   - 支持 `title` 和 `description`，以及可选的 `action` 按钮。
   - 支持可关闭（`dismissible`），关闭时带有向上收缩的退出动画。
3. **Well 组件**：
   - 内嵌凹陷区块，视觉上"陷入"页面。使用较深的背景色（在浅色模式下）或较亮的背景色（在深色模式下），无边框或仅有内阴影。
   - 用于展示引用、备注、次级操作区、预览内容。
   - 支持 `inset` 深度：`sm`（轻微陷入）、`md`（标准）、`lg`（深度陷入）。
4. **Banner 组件**：
   - 页面级横幅条，支持 `sticky`（滚动时固定在顶部）和 `inline`（随内容滚动）两种模式。
   - 支持语义化颜色变体（与 Callout 一致）。
   - 支持左侧图标 + 中间文字 + 右侧操作按钮的标准布局。
   - 支持可关闭，关闭后高度动画收缩至 0。
5. **CodeBlock 组件**：
   - 等宽字体代码展示容器，带有：
     - 顶部标题栏（文件名/语言标签 + 复制按钮）。
     - 行号显示（可选）。
     - 一键复制（复制成功后按钮变为对勾动画，来自 128）。
     - 深色背景（独立于主题模式，始终深色以保护眼睛）。
   - 支持 `language` 标记，为未来的语法高亮（如 Shiki）预留接口。
6. **容器设计 Token**：
   - 所有容器共享一套边框、背景、圆角、间距 Token，确保视觉一致性。
   - 容器层级规范：Well（最底层，陷入）< Callout（信息层）< Panel（区块层）< Card（浮起层）< Dialog（最高层，模态）。

## 目标用户

- **需要为设置页、详情页、表单页快速搭建区块结构的开发者**。
- **需要一致的信息提示、警告、操作引导样式的团队**。
- **需要展示代码、配置、日志等数据的开发者**。

## 详细设计

### 视觉/动画效果描述

**Panel 外观变体：**
```css
.panel-bordered {
  border: 1px solid var(--border);
  background: var(--background);
  border-radius: var(--radius-lg);
}
.panel-ghost {
  background: transparent;
  border: none;
}
.panel-elevated {
  background: var(--card);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-2);
}
.panel-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}
.panel-content {
  padding: var(--space-4);
}
.panel-footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border);
}
```

**Panel 折叠动画：**
```css
.panel-collapse-enter-active,
.panel-collapse-leave-active {
  transition: height 0.3s var(--ease-out-expo), opacity 0.2s ease-out;
  overflow: hidden;
}
.panel-collapse-enter-from,
.panel-collapse-leave-to {
  height: 0;
  opacity: 0;
}
```

**Callout 语义色：**
```css
.callout-info    { --callout-accent: var(--chart-info);    --callout-bg: var(--chart-info / 0.06); }
.callout-success { --callout-accent: var(--chart-success); --callout-bg: var(--chart-success / 0.06); }
.callout-warning { --callout-accent: var(--chart-warning); --callout-bg: var(--chart-warning / 0.06); }
.callout-danger  { --callout-accent: var(--chart-danger);  --callout-bg: var(--chart-danger / 0.06); }
.callout-neutral { --callout-accent: var(--muted-foreground); --callout-bg: var(--muted); }

.callout {
  border-radius: var(--radius-md);
  background: var(--callout-bg);
  border-left: 3px solid var(--callout-accent);
  padding: var(--space-3) var(--space-4);
}
```

**Well 内嵌效果：**
```css
.well {
  border-radius: var(--radius-md);
  background: var(--well-bg);
  box-shadow: inset 0 1px 3px hsl(0 0% 0% / 0.06);
}
.well-sm { padding: var(--space-2); }
.well-md { padding: var(--space-3); }
.well-lg { padding: var(--space-4); }

:root { --well-bg: oklch(0.95 0 0); }
.dark { --well-bg: oklch(0.18 0 0); }
```

**Banner：**
```css
.banner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}
.banner-sticky {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}
```

**CodeBlock：**
```css
.code-block {
  border-radius: var(--radius-lg);
  background: oklch(0.15 0 0); /* 始终深色，不随主题变化 */
  border: 1px solid oklch(0.25 0 0);
  overflow: hidden;
}
.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: oklch(0.18 0 0);
  border-bottom: 1px solid oklch(0.25 0 0);
  color: oklch(0.7 0 0);
  font-size: var(--text-xs);
}
.code-block-content {
  padding: var(--space-3);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: oklch(0.85 0 0);
  overflow-x: auto;
}
```

### 涉及的技术点

- **CSS Grid/Flexbox**：Panel 的 header/content/footer 使用 Flexbox 布局；对比容器使用 Grid。
- **Vue `<Transition>` + Grid trick**：Panel 折叠动画使用 CSS Grid 的 `grid-template-rows: 0fr` → `1fr` 技巧实现高度从 0 到 auto 的平滑过渡。
- **语义色系统对接**：Callout 和 Banner 的颜色与 110（色彩无障碍）的语义色和 125（数据可视化配色）对接。
- **深色模式适配**：Well 在深浅模式下使用相反方向的背景色偏移；CodeBlock 始终深色以保护开发者眼睛。
- **Clipboard API**：CodeBlock 的复制按钮使用 `navigator.clipboard.writeText()`。

### 与现有架构的衔接方式

- **新增 `src/components/ui/panel/` 目录**：
  - `Panel.vue`：标准面板。
  - `PanelHeader.vue`、`PanelContent.vue`、`PanelFooter.vue`：Panel 的子组件（可选组合使用）。
- **新增 `src/components/ui/callout/` 目录**：
  - `Callout.vue`、`CalloutTitle.vue`、`CalloutDescription.vue`、`CalloutAction.vue`。
- **新增 `src/components/ui/well/` 目录**：
  - `Well.vue`。
- **新增 `src/components/ui/banner/` 目录**：
  - `Banner.vue`。
- **新增 `src/components/ui/code-block/` 目录**：
  - `CodeBlock.vue`、`CodeBlockHeader.vue`。
- **修改 `src/style.css`**：
  - 注入 `--well-bg`、各 `--callout-*` 变量。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「容器系统」演示区，展示 Panel、Callout、Well、Banner、CodeBlock 的所有变体。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/panel/Panel.vue` | 新增 | 面板容器 |
| `src/components/ui/panel/PanelHeader.vue` | 新增 | 面板标题栏 |
| `src/components/ui/panel/PanelContent.vue` | 新增 | 面板内容区 |
| `src/components/ui/panel/PanelFooter.vue` | 新增 | 面板底部区 |
| `src/components/ui/callout/Callout.vue` | 新增 | 高亮提示区 |
| `src/components/ui/callout/CalloutTitle.vue` | 新增 | 提示标题 |
| `src/components/ui/callout/CalloutDescription.vue` | 新增 | 提示描述 |
| `src/components/ui/well/Well.vue` | 新增 | 内嵌区块 |
| `src/components/ui/banner/Banner.vue` | 新增 | 横幅条 |
| `src/components/ui/code-block/CodeBlock.vue` | 新增 | 代码展示块 |
| `src/style.css` | 修改 | 注入容器相关 CSS 变量 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增容器系统演示区 |

## 验收标准

- [ ] `Panel` 支持 `bordered`、`ghost`、`elevated` 三种外观，支持 `collapsible` 折叠模式。
- [ ] Panel 折叠/展开带有高度动画（Grid 0fr→1fr 技巧），过渡平滑。
- [ ] `Callout` 支持 `info`、`success`、`warning`、`danger`、`neutral` 五种语义变体，左侧有彩色竖条。
- [ ] Callout 支持 `dismissible`，关闭时向上收缩退出。
- [ ] `Well` 支持 `sm/md/lg` 三种内嵌深度，视觉上"陷入"页面。
- [ ] `Banner` 支持 `sticky` 和 `inline` 两种定位，支持语义色变体。
- [ ] `CodeBlock` 始终深色背景，带有标题栏（文件名+复制按钮），复制成功后按钮变为对勾动画。
- [ ] 所有容器共享统一的边框、圆角、间距 Token，视觉上层级清晰。
- [ ] 容器层级规范明确：Well < Callout < Panel < Card < Dialog。
- [ ] ComponentPlayground 中可交互式预览所有容器变体。

## 优先级

P1

## 参考实现

- [Radix UI - Callout](https://www.radix-ui.com/themes/docs/components/callout)：Callout 组件的语义化设计。
- [shadcn-ui Alert](https://ui.shadcn.com/docs/components/alert)：Alert/Callout 的基础实现参考。
- [GitHub Primer - Panels](https://primer.style/components/blankslate)：GitHub 的 Panel 和 Blankslate 设计。
- [Tailwind UI - Panels](https://tailwindui.com/components/application-ui/layout/panels)：面板容器的多种布局参考。
- [VS Code - Code Block Styling](https://code.visualstudio.com/api/references/theme-color)：代码编辑器深色背景设计参考。
