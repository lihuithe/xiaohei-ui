# 光标/指针自定义系统

## 功能背景/动机

当前脚手架完全依赖操作系统默认光标样式（箭头、手型、文本输入、禁用等）。虽然这保证了基础可用性，但对于追求品牌一致性和交互精致感的桌面应用而言，默认光标存在明显不足：

1. **品牌识别度缺失**：所有应用都使用同样的白色箭头光标，无法在细节处传达品牌个性。
2. **交互状态反馈不足**：Hover 在可拖拽区域、缩放区域、旋转区域时，默认光标无法精确表达操作意图。
3. **自定义组件的光标混乱**：开发者对 `cursor: grab` / `grabbing` / `col-resize` / `row-resize` 等语义化光标的使用不一致，导致用户体验割裂。
4. **加载状态无反馈**：长时间操作中，光标没有变化，用户不确定系统是否在响应。
5. **深色窗口下的光标可见性**：在深色背景上，默认的浅灰色光标有时会融入背景（尤其在高分屏上）。

提供一套**光标/指针自定义系统**，能让开发者在保持无障碍可用性的前提下，为应用注入独特的光标体验，同时建立统一的 cursor 使用规范。

## 功能描述

构建一套**光标/指针自定义系统**，包含：

1. **光标样式 Token 体系**：
   - 定义标准化的光标映射：不同交互场景（按钮、链接、拖拽、缩放、旋转、加载、禁用、复制、抓取）对应的标准光标类型。
   - 提供 CSS 工具类：`.cursor-button`、`.cursor-link`、`.cursor-grab`、`.cursor-grabbing`、`.cursor-resize-ns`、`.cursor-resize-ew`、`.cursor-resize-nesw`、`.cursor-resize-nwse`、`.cursor-loading`、`.cursor-disabled`、`.cursor-copy`、`.cursor-text`。
2. **品牌光标主题**：
   - 支持将默认光标替换为品牌定制光标（通过 CSS `cursor: url(...)`）。
   - 提供浅色/深色两套光标资源（在深色窗口上自动切换为白色轮廓版本，确保可见）。
   - 光标尺寸规范：16x16（标准）、24x24（高分屏）、32x32（4K 屏），自动根据 `devicePixelRatio` 选择。
3. **智能光标组件 `SmartCursor`**：
   - 监听当前鼠标下的元素，根据元素类型和状态自动切换最合适的光标。
   - 支持 `data-cursor` 属性：任何元素添加 `data-cursor="grab"` 即可自动应用对应光标。
   - 支持上下文感知：在可拖拽列表中，Hover 列表项显示 `grab`，拖拽中显示 `grabbing`，拖拽到禁止区域显示 `not-allowed`。
4. **加载状态光标**：
   - 全局忙碌状态（如应用初始化、全屏操作）时，光标自动切换为等待状态（`wait` 或自定义旋转光标）。
   - 局部忙碌状态（如按钮点击后异步操作）时，光标在按钮区域内切换为 `progress`。
5. **光标动画与过渡**：
   - 光标切换时带有平滑过渡（CSS `cursor` 本身不支持过渡，但通过延迟切换或预览元素实现视觉过渡）。
   - 自定义光标支持动画帧序列（如加载光标的旋转帧）。
6. **光标无障碍支持**：
   - `prefers-reduced-motion` 时禁用动画光标，使用静态版本。
   - 高对比度模式下使用系统默认光标（避免自定义光标对比度不足）。
   - 光标热点（hotspot）精确定义，确保点击位置准确。
7. **光标配置面板**：
   - 在设置页中提供「光标」Tab：
     - 开关：使用品牌光标 / 使用系统默认。
     - 光标大小选择（标准 / 大 / 特大）。
     - 高对比度模式下自动回退系统光标。

## 目标用户

- **追求品牌一致性、希望连光标都传达品牌调性的产品团队**。
- **构建拖拽编辑器、画布应用、设计工具的开发者**（对光标语义要求极高）。
- **需要为高分屏/深色窗口优化光标可见性的开发者**。

## 详细设计

### 视觉/动画效果描述

**光标 Token 工具类：**
```css
.cursor-button    { cursor: pointer; }
.cursor-link      { cursor: pointer; }
.cursor-grab      { cursor: grab; }
.cursor-grabbing  { cursor: grabbing; }
.cursor-resize-ns { cursor: ns-resize; }
.cursor-resize-ew { cursor: ew-resize; }
.cursor-resize-nesw { cursor: nesw-resize; }
.cursor-resize-nwse { cursor: nwse-resize; }
.cursor-loading   { cursor: wait; }
.cursor-progress  { cursor: progress; }
.cursor-disabled  { cursor: not-allowed; }
.cursor-copy      { cursor: copy; }
.cursor-text      { cursor: text; }
.cursor-move      { cursor: move; }
.cursor-zoom-in   { cursor: zoom-in; }
.cursor-zoom-out  { cursor: zoom-out; }
```

**品牌光标切换（深色/浅色自适应）：**
```css
/* 通过 CSS media query 或 class 切换光标资源 */
:root {
  --cursor-default: url('/cursors/default.svg') 0 0, auto;
  --cursor-pointer: url('/cursors/pointer.svg') 6 0, pointer;
  --cursor-text:    url('/cursors/text.svg') 6 8, text;
}
.dark {
  --cursor-default: url('/cursors/default-dark.svg') 0 0, auto;
  --cursor-pointer: url('/cursors/pointer-dark.svg') 6 0, pointer;
  --cursor-text:    url('/cursors/text-dark.svg') 6 8, text;
}
.cursor-brand-default { cursor: var(--cursor-default); }
.cursor-brand-pointer { cursor: var(--cursor-pointer); }
.cursor-brand-text    { cursor: var(--cursor-text); }
```

**data-cursor 属性自动应用：**
```css
[data-cursor="grab"]     { cursor: grab; }
[data-cursor="grabbing"] { cursor: grabbing; }
[data-cursor="resize"]   { cursor: var(--cursor-resize, nwse-resize); }
[data-cursor="loading"]  { cursor: wait; }
/* ... 所有标准光标类型 */
```

**加载光标动画帧（CSS 逐帧动画模拟）：**
```css
@keyframes cursor-spin {
  from { --cursor-frame: 0; }
  to { --cursor-frame: 11; }
}
/* 实际实现需使用多个 cursor 图片逐帧切换，
   或直接使用 CSS cursor: wait + 品牌化的等待动画 */
```

### 涉及的技术点

- **CSS `cursor` 属性**：支持 `url()` 自定义光标，需指定 `x y` 热点坐标。
- **SVG 光标**：使用 SVG 格式光标，可无损缩放、支持深浅色切换（通过 CSS 变量或媒体查询）。
- **`devicePixelRatio` 适配**：根据 DPR 加载 1x/2x/3x 光标资源，避免模糊。
- **Electron 光标 API**：Electron 支持 `win.setCursor`（Windows）或通过 CSS 实现跨平台自定义。
- **事件委托**：`SmartCursor` 通过 `document.addEventListener('mouseover')` 检测 `data-cursor` 属性，动态切换光标。
- **性能优化**：光标切换是极轻量的 CSS 操作，无需担心性能。

### 与现有架构的衔接方式

- **新增 `src/styles/cursors.css`**：
  - 定义所有光标工具类。
  - 定义 `:root` 和 `.dark` 下的品牌光标变量。
  - 定义 `data-cursor` 属性映射。
- **新增 `src/composables/useCursor.ts`**：
  - 管理光标主题（brand / system）。
  - 管理光标大小（sm / md / lg）。
  - 提供 `setCursor(type)` 手动设置全局光标。
  - 提供 `resetCursor()` 恢复默认。
- **新增 `src/composables/useSmartCursor.ts`**：
  - 监听 `mouseover` 事件，自动为带 `data-cursor` 的元素应用对应光标。
  - 监听拖拽状态，在 `dragstart`/`dragend` 时自动切换 `grab`/`grabbing`。
- **新增 `public/cursors/` 目录**：
  - 存放品牌光标 SVG 资源（default、pointer、text、wait、grab、grabbing 等）。
  - 每套光标包含浅色版和深色版。
- **修改 `src/style.css`**：
  - `@import './styles/cursors.css'`。
- **修改现有组件**：
  - `Button.vue`：默认添加 `cursor-button`（或 `data-cursor="pointer"`）。
  - `Input.vue`、`Textarea.vue`：添加 `cursor-text`。
  - `ResizableHandle.vue`（如存在）：添加 `cursor-resize-*`。
  - `Draggable` 组件：自动应用 `cursor-grab` / `cursor-grabbing`。
  - 全局禁用状态：`.disabled` 类自动应用 `cursor-disabled`。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「光标」Tab，提供光标主题和大小选择。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「光标系统」演示区，展示不同交互场景下的光标样式。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/cursors.css` | 新增 | 光标工具类与品牌光标变量 |
| `src/composables/useCursor.ts` | 新增 | 光标主题与大小管理 |
| `src/composables/useSmartCursor.ts` | 新增 | 智能光标自动切换 |
| `public/cursors/` | 新增目录 | 品牌光标 SVG 资源 |
| `src/style.css` | 修改 | 导入 cursors.css |
| `src/components/ui/button/Button.vue` | 修改 | 接入光标工具类 |
| `src/components/ui/input/Input.vue` | 修改 | 接入光标工具类 |
| `src/components/ui/resizable/ResizableHandle.vue` | 修改 | 接入 resize 光标 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增光标设置 Tab |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增光标系统演示区 |

## 验收标准

- [ ] 定义完整的 cursor 工具类体系（15+ 种标准光标场景）。
- [ ] 支持 `data-cursor` 属性，任意元素添加后自动应用对应光标。
- [ ] 提供品牌光标浅色/深色两套，根据主题自动切换。
- [ ] 支持光标尺寸调节（标准/大/特大），适配不同 DPR 屏幕。
- [ ] `SmartCursor` 在拖拽场景中自动切换 `grab`/`grabbing`/`not-allowed`。
- [ ] 全局/局部加载状态时光标自动切换为等待状态。
- [ ] `prefers-reduced-motion` 时禁用动画光标，使用静态版本。
- [ ] 高对比度模式下自动回退系统默认光标。
- [ ] 设置面板中可切换光标主题和大小，实时生效。
- [ ] ComponentPlayground 中可交互式体验所有光标样式。

## 优先级

P2

## 参考实现

- [CSS cursor Property](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)：MDN 光标属性完整文档。
- [Figma Cursor Design](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-your-cursor-settings)：Figma 的多人协作光标设计。
- [Apple HIG - Pointers](https://developer.apple.com/design/human-interface-guidelines/pointers)：macOS 指针设计规范。
- [Windows Cursor Guidelines](https://learn.microsoft.com/en-us/windows/apps/design/input/mouse-interactions#cursors)：Windows 光标使用指南。
- [Custom Cursor.js](https://github.com/jaronwanderley/custom-cursor.js)：轻量级自定义光标库参考。
