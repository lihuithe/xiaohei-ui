# 标签/胶囊选择器系统

## 功能背景/动机

当前脚手架在 `components/ui/tags-input/` 中提供了 `TagsInput` 组件，用于输入和创建标签。但 `TagsInput` 的定位是"输入组件"，无法覆盖以下更广泛的标签/胶囊使用场景：

1. **展示型标签（Display Tag）**：仅用于展示属性或分类（如 "Vue 3"、"TypeScript"、"Beta"），不可编辑。
2. **可选中标签（Selectable Tag / Chip）**：用于过滤、多选场景（如选择技能标签、筛选商品属性），点击后切换选中状态。
3. **可删除标签（Removable Tag）**：带有 `×` 删除按钮的标签（如已选筛选条件、邮件收件人）。
4. **可拖拽排序标签（Draggable Tag）**：标签支持拖拽调整顺序（如优先级排序、步骤重排）。
5. **标签组/云（Tag Cloud）**：大量标签以不同大小或颜色展示（如技能云、关键词云）。
6. **胶囊切换器（Pill Toggle / Segmented Control）**：单选胶囊组，用于在少量选项间快速切换（如 "日/周/月"、"列表/网格"）。

shadcn-vue 的 `Badge` 组件可以作为标签使用，但缺乏交互能力；`ToggleGroup` 可以做多选，但样式是按钮而非胶囊。提供一套**标签/胶囊选择器系统**，能让开发者精确地选择和组合各种标签形态。

## 功能描述

构建一套**标签/胶囊选择器系统**，包含：

1. **Tag 组件**：
   - 基础展示型标签，支持 `variant`：`default`（实心填充）、`outline`（边框）、`ghost`（文字+hover 背景）、`dot`（左侧圆点+文字）。
   - 支持 `size`：`sm`、`md`、`lg`。
   - 支持 `color`：从主题调色板中选择（`primary`、`secondary`、`success`、`warning`、`danger`、`info`、`neutral`），自动应用对应的前景色和背景色。
   - 支持 `removable`：显示 `×` 按钮，点击后触发 `remove` 事件，标签带有收缩消失的退出动画。
   - 支持 `draggable`：可拖拽，拖拽时有视觉反馈（半透明 + 放大）。
2. **TagGroup 组件**：
   - 标签容器，支持 `direction`：`horizontal`（水平换行）、`vertical`（垂直排列）。
   - 支持 `gap` 和 `maxRows`（超出后折叠，显示 "+n" 展开按钮）。
   - 支持 `animation`：标签出现时的 stagger 错峰动画（来自 128 的 BadgeBounce）。
3. **SelectableTag / Chip 组件**：
   - 可选中标签，点击后切换 `selected` 状态。
   - 选中时：背景变为主色、文字变为白色、可选显示对勾图标。
   - 支持 `single` 和 `multiple` 两种选择模式（`single` 时同组只能选一个）。
   - 支持 `disabled`：禁用状态下不可选中，样式降级。
4. **PillToggle（胶囊切换器）**：
   - 单选胶囊组，外观为圆角胶囊排成一行，选中的胶囊有填充背景，未选中的为文字状态。
   - 选中切换时，背景色块以滑动动画（`layout` 动画或动态计算位置）从旧选项移动到新选项。
   - 支持 `fullWidth`：胶囊组撑满容器宽度，均分空间。
   - 支持 `icon`：胶囊内可带图标（如列表/网格视图切换）。
5. **TagInput 增强**：
   - 在现有 `TagsInput` 基础上，增加标签创建时的动画（新标签从输入框位置弹入）。
   - 增加自动补全下拉（输入时显示匹配的标签建议列表）。
   - 增加标签最大数量限制和溢出提示。
6. **标签设计 Token**：
   - 所有标签颜色、圆角、间距统一使用 Token，确保与 Badge、Button 的尺度一致。
   - 标签颜色与 110（色彩无障碍）的语义色和 125（数据可视化配色）对接。

## 目标用户

- **需要构建过滤器、属性选择、技能标签云的开发者**。
- **需要胶囊切换器（日/周/月、列表/网格）的开发者**。
- **需要可拖拽排序标签（优先级、步骤、分类排序）的开发者**。

## 详细设计

### 视觉/动画效果描述

**Tag 变体：**
```css
.tag-default {
  background: var(--tag-bg);
  color: var(--tag-fg);
  border: 1px solid transparent;
}
.tag-outline {
  background: transparent;
  color: var(--tag-bg);
  border: 1px solid var(--tag-border);
}
.tag-ghost {
  background: transparent;
  color: var(--tag-bg);
  border: 1px solid transparent;
}
.tag-ghost:hover {
  background: var(--tag-bg-muted);
}
.tag-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--tag-dot-color);
}
```

**Tag 颜色 Token（以 primary 为例）：**
```css
.tag-primary {
  --tag-bg: var(--primary);
  --tag-fg: var(--primary-foreground);
  --tag-border: var(--primary);
  --tag-bg-muted: var(--primary / 0.1);
  --tag-dot-color: var(--primary);
}
```

**可删除标签退出动画：**
```css
.tag-removing {
  animation: tag-remove 0.2s var(--ease-out) forwards;
}
@keyframes tag-remove {
  to {
    transform: scale(0.8);
    opacity: 0;
    width: 0;
    padding: 0;
    margin: 0;
  }
}
```

**SelectableTag 选中状态：**
```css
.selectable-tag {
  transition: all 0.15s ease-out;
}
.selectable-tag.is-selected {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}
.selectable-tag.is-selected::after {
  content: '✓';
  margin-left: 4px;
  font-size: 0.75em;
}
```

**PillToggle 滑动背景：**
```css
.pill-toggle-track {
  position: relative;
  display: inline-flex;
  background: var(--muted);
  border-radius: var(--radius-full);
  padding: 2px;
}
.pill-toggle-indicator {
  position: absolute;
  background: var(--background);
  border-radius: var(--radius-full);
  box-shadow: var(--elevation-1);
  transition: all 0.3s var(--ease-out-expo);
}
```

**TagGroup 错峰出现：**
```css
.tag-group > * {
  animation: tag-bounce-in 0.3s var(--ease-out-back) both;
}
.tag-group > *:nth-child(1) { animation-delay: 0ms; }
.tag-group > *:nth-child(2) { animation-delay: 40ms; }
.tag-group > *:nth-child(3) { animation-delay: 80ms; }
/* ... capped */
@keyframes tag-bounce-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### 涉及的技术点

- **CSS 变量颜色映射**：每种标签颜色通过 CSS 变量动态设置，支持运行时切换主题。
- **Vue `<TransitionGroup>`**：TagGroup 使用 TransitionGroup 管理标签的添加/删除动画。
- **HTML5 Drag and Drop API**：`draggable` 标签使用原生拖拽 API 或 `@vueuse/gesture`。
- **FLIP 动画 / 动态定位**：PillToggle 的滑动指示器使用动态计算位置 + CSS transition 实现平滑滑动。
- **`aria-pressed`**：SelectableTag 使用 `aria-pressed` 表示选中状态，支持屏幕阅读器。

### 与现有架构的衔接方式

- **新增 `src/components/ui/tag/` 目录**：
  - `Tag.vue`：基础标签。
  - `TagGroup.vue`：标签容器组。
  - `SelectableTag.vue`：可选中标签。
  - `PillToggle.vue`：胶囊切换器。
- **修改 `src/components/ui/tags-input/TagsInput.vue`**：
  - 增强标签创建动画、自动补全、最大数量限制。
- **新增 `src/composables/useTagSelection.ts`**：
  - 管理单选/多选标签的状态逻辑。
- **修改 `src/style.css`**：
  - 注入标签颜色变量。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「标签系统」演示区，展示所有变体、交互、动画。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/tag/Tag.vue` | 新增 | 基础标签 |
| `src/components/ui/tag/TagGroup.vue` | 新增 | 标签容器组 |
| `src/components/ui/tag/SelectableTag.vue` | 新增 | 可选中标签 |
| `src/components/ui/tag/PillToggle.vue` | 新增 | 胶囊切换器 |
| `src/composables/useTagSelection.ts` | 新增 | 标签选择状态管理 |
| `src/components/ui/tags-input/TagsInput.vue` | 修改 | 增强动画与自动补全 |
| `src/style.css` | 修改 | 标签颜色变量 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增标签系统演示区 |

## 验收标准

- [ ] `Tag` 支持 `default`、`outline`、`ghost`、`dot` 四种变体，`sm/md/lg` 三种尺寸。
- [ ] Tag 支持 7 种语义颜色（primary/secondary/success/warning/danger/info/neutral）。
- [ ] `removable` 标签点击 `×` 后触发收缩退出动画（scale+opacity+width 同时过渡）。
- [ ] `draggable` 标签支持拖拽排序，拖拽时有半透明放大反馈。
- [ ] `SelectableTag` 支持单选/多选模式，选中时背景变为主色+显示对勾。
- [ ] `PillToggle` 选中切换时背景色块以滑动动画移动，支持 `fullWidth` 均分。
- [ ] `TagGroup` 支持水平/垂直排列、stagger 错峰出现动画、超出折叠。
- [ ] `TagsInput` 标签创建时有弹入动画，支持自动补全和最大数量限制。
- [ ] 所有标签颜色使用 Token，与语义色系统（110/125）一致。
- [ ] ComponentPlayground 中可交互式预览所有标签变体和交互效果。

## 优先级

P1

## 参考实现

- [Material Design 3 - Chips](https://m3.material.io/components/chips/overview)：Material Design 的 Chips 组件规范（Filter/Input/Choice/Suggestion）。
- [Ant Design Tag](https://ant.design/components/tag-cn)：标签的颜色、可删除、动态编辑功能。
- [Chakra UI Tag](https://v2.chakra-ui.com/docs/components/tag)：标签的多种变体和尺寸。
- [shadcn-ui Toggle Group](https://ui.shadcn.com/docs/components/toggle-group)：单选/多选切换组的基础实现。
- [iOS Segmented Control](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)：胶囊切换器的经典设计参考。
