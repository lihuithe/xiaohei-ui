# RTL（从右到左）布局支持框架

## 功能背景/动机

当前脚手架的国际化（i18n）仅覆盖了文本翻译（zh-CN / en-US），但完全没有考虑**RTL（Right-to-Left）布局**。对于需要面向中东（阿拉伯语、希伯来语、波斯语等）或全球市场的桌面应用而言，RTL 支持不是可选功能，而是刚需。

RTL 不仅仅是文字方向翻转，还涉及：
- 水平布局方向的整体镜像（Flexbox `dir="rtl"`）
- 边距/内边距逻辑属性化（`margin-inline-start` 替代 `margin-left`）
- 图标方向的适配（如箭头、前进/后退图标需要镜像）
- 侧边栏从右向左展开
- 滚动条位置、表格排序箭头、表单输入光标方向等细节

脚手架若能提供一套**开箱即用的 RTL 支持框架**，将极大提升其国际化（i18n）能力的完整度与竞争力。

## 功能描述

构建一套**RTL 布局支持框架**，包含：
1. **全局 RTL 切换器**：在 `useLocale` / `useAppStore` 中维护 `dir: 'ltr' | 'rtl'` 状态，切换语言时若目标语言为 RTL 语言，自动翻转文档方向。
2. **CSS 逻辑属性规范化**：梳理现有代码中所有写死的 `left/right/margin-left/padding-right` 等物理属性，逐步替换为 `inline-start/inline-end/inset-inline-start` 等逻辑属性，或利用 Tailwind 的 `start/end` 工具类。
3. **RTL 安全的 UI 组件**：确保所有 shadcn-vue 基础组件（Button、Input、Dialog、Sidebar 等）在 RTL 下表现正确。
4. **图标方向自动适配**：提供一个 `useRtlAwareIcon()` 辅助函数或 `RtlIcon` 包装组件，对方向敏感的图标（如 `ChevronLeft`、`ArrowRight`、`PanelLeft`）在 RTL 模式下自动水平翻转。
5. **Tailwind CSS v4 RTL 插件对接**：利用 Tailwind CSS 的 `logical` 属性支持或 `tailwindcss-rtl` 插件，确保工具类在 RTL 下语义正确。

## 目标用户

- **面向全球市场的产品团队**：需要支持阿拉伯语、希伯来语、乌尔都语等 RTL 语言。
- **企业级应用开发者**：需要应用能根据用户偏好自动切换布局方向。
- **希望学习现代 CSS 逻辑属性与国际化最佳实践的开发者**。

## 详细设计

### 交互流程

1. 用户在「设置 > 语言」中选择「العربية (Arabic)」。
2. `setLocale('ar-SA')` 被调用，系统检测到 `ar-SA` 属于 RTL 语言列表。
3. `document.documentElement.dir` 被设置为 `'rtl'`，`document.documentElement.lang` 被设置为 `'ar-SA'`。
4. Tailwind CSS 的 `rtl:` 变体或逻辑属性类自动响应，所有 `start/end` 类映射到物理方向的右侧/左侧。
5. 侧边栏从左侧移至右侧，内容区 margin-left 变为 margin-right（通过逻辑属性自动完成）。
6. 方向敏感图标自动镜像。

### 涉及的技术点

- **CSS 逻辑属性（Logical Properties）**：`margin-inline-start`、`padding-inline-end`、`inset-inline-start` 等，替代物理方向属性。Tailwind v4 已内置 `me-4`（margin-inline-end）、`ps-4`（padding-inline-start）等工具类。
- **HTML `dir` 属性**：设置 `<html dir="rtl">` 是最核心的触发器，浏览器会自动翻转默认文本方向、滚动条位置、表格列顺序等。
- **Flexbox/Grid 与 RTL**：`flex-row` 在 RTL 下方向会被 `dir="rtl"` 自动反转，但 `space-x-*` 等工具类需要注意（Tailwind v4 中 `space-x` 在 RTL 下会自动反转）。
- **Vue 响应式方向管理**：通过 `useLocale()` 或新增 `useDirection()` 暴露 `dir` 计算属性，与 locale 绑定。
- **图标镜像方案**：
  - 方案 A：在 RTL 下给图标容器加 `transform: scaleX(-1)`（简单粗暴，但对非对称图标可能不理想）。
  - 方案 B：维护一个「方向敏感图标映射表」，如 `ChevronLeft` 在 RTL 下渲染为 `ChevronRight`。
  - 推荐方案 B，更精确。

### 与现有架构的衔接方式

- **新增 `src/composables/useDirection.ts`**：
  - 导出 `dir: Ref<'ltr' | 'rtl'>`。
  - 提供 `setDirection(dir: 'ltr' | 'rtl')`。
  - 与 `useLocale` 联动：切换 locale 时自动判断方向。
- **修改 `src/locales/index.ts`**：
  - 在 `availableLocales` 中增加 `dir` 字段。
  - `setLocale` 中调用 `setDirection()`。
- **新增 `src/utils/rtl.ts`**：
  - `isRtlLocale(locale: string): boolean`：判断语言是否 RTL。
  - `RTL_LOCALES = ['ar', 'he', 'fa', 'ur']`。
- **新增 `src/components/RtlIcon.vue`**：
  - 接收 `icon` 和 `flip` 等 props，在 RTL 下自动映射为对应镜像图标。
- **修改 `src/App.vue` / `src/components/Sidebar.vue`**：
  - 将硬编码的 `left`/`right` 样式替换为逻辑属性或 Tailwind 的 `start`/`end` 工具类。
  - Sidebar 的绝对定位从 `left: 0` 改为 `inset-inline-start: 0`。
- **修改 `src/style.css`**：
  - 检查并替换 `:root` 中可能受 RTL 影响的物理属性。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useDirection.ts` | 新增 | 方向状态管理 |
| `src/utils/rtl.ts` | 新增 | RTL 工具函数与语言映射 |
| `src/components/RtlIcon.vue` | 新增 | RTL 感知图标组件 |
| `src/locales/index.ts` | 修改 | setLocale 联动方向切换 |
| `src/App.vue` | 修改 | 接入 dir 响应式绑定 |
| `src/components/Sidebar.vue` | 修改 | 物理方向属性逻辑化 |
| `src/style.css` | 修改 | 逻辑属性替换 |

## 验收标准

- [ ] 新增 `ar-SA`、`he-IL` 两个 RTL 语言包（最小可只含少量翻译用于演示）。
- [ ] 切换至 RTL 语言后，`document.dir` 自动变为 `rtl`，整体布局水平镜像。
- [ ] Sidebar 在 RTL 模式下位于窗口右侧，展开/折叠逻辑正常。
- [ ] 所有方向敏感图标（ChevronLeft/Right、ArrowLeft/Right 等）在 RTL 下自动翻转。
- [ ] 内容区滚动条位置在 RTL 下位于左侧（浏览器默认行为）。
- [ ] 提供「强制 RTL」开关（用于测试），即使当前语言是 LTR 也可手动开启 RTL。
- [ ] 与深色模式、主题预设系统无冲突，可同时工作。

## 优先级

P1

## 参考实现

- [Mozilla RTL Guidelines](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/RTLLocale)：Mozilla 的 RTL 本地化规范。
- [Tailwind CSS Logical Properties](https://tailwindcss.com/docs/padding#using-logical-properties)：Tailwind 逻辑属性工具类文档。
- [Material UI RTL](https://mui.com/material-ui/customization/right-to-left/)：MUI 的 RTL 支持实现方式。
- [Firefox RTL Experience](https://bugzilla.mozilla.org/show_bug.cgi?id=1484991)：大型桌面应用 RTL 适配经验。
