# 字体与排版系统

## 功能背景/动机

当前脚手架在字体方面非常单薄：仅通过 Google Fonts 引入了 Geist 一种字体，且排版层级（Typography Scale）完全依赖 Tailwind 默认的 `text-sm`、`text-lg` 等工具类。对于需要精细控制阅读体验的桌面应用而言，这远远不够。

实际开发中常见的需求包括：
- 支持自定义字体（如替换为系统字体、阅读字体、代码字体）
- 提供可配置的字体大小调节（全局缩放 90% / 100% / 110% / 125%）
- 代码块使用独立的等宽字体栈
- 排版层级规范（H1-H6、Body、Caption、Label 的字号、行高、字重、字间距）
- 字体加载策略（FOUT/FOIT 避免、字体预加载、本地字体回退）

脚手架若能提供一套完整的**字体与排版系统**，将帮助开发者建立一致、优雅、可访问的文本呈现。

## 功能描述

构建一套**字体与排版系统**，包含：
1. **字体加载策略**：提供本地字体回退栈、字体预加载、加载状态检测，避免字体闪烁（FOUT）。
2. **排版层级规范（Type Scale）**：定义从 `display` 到 `caption` 的完整层级，每级包含字号、行高、字重、字间距的 Token，映射到 Tailwind 配置。
3. **字体配置面板**：在设置页中提供「界面字体」「代码字体」「字体大小」三个维度的调节选项，实时生效。
4. **代码字体独立栈**：`CodeBlock.vue`、内联代码、表单输入等场景使用独立的等宽字体栈（如 JetBrains Mono、Fira Code）。
5. **全局字体缩放**：通过 CSS 变量控制 `html` 的 `font-size`（基于 rem），实现全局 90%-125% 的无级缩放。
6. **系统字体回退**：当自定义字体加载失败或用户偏好系统字体时，自动使用平台最优系统字体栈（macOS San Francisco、Windows Segoe UI、Linux Noto Sans）。

## 目标用户

- **需要精细控制阅读体验的知识管理/文档类应用开发者**。
- **需要支持用户自定义字体的个性化产品**。
- **需要适配不同屏幕密度和视距的桌面应用**（如大屏展示 vs 笔记本小字）。

## 详细设计

### 交互流程

1. 应用启动时，`useTypography()` 读取 `localStorage` 中的字体配置，动态创建 `<link rel="preload">` 和 `<style>` 注入字体。
2. 渲染期间，通过 CSS 变量 `--font-sans`、`--font-mono`、`--font-scale` 控制全局字体。
3. 用户进入「设置 > 外观 > 字体」：
   - 选择「界面字体」：Geist / Inter / System / Custom（可输入字体名）。
   - 选择「代码字体」：JetBrains Mono / Fira Code / Cascadia Code / System Mono。
   - 调节「字体大小」：小(90%) / 默认(100%) / 大(110%) / 特大(125%)。
4. 切换后通过修改 `:root` CSS 变量实时生效，无需刷新。
5. 若选择 Custom 字体，系统尝试从 Google Fonts 动态加载，加载失败时优雅回退到系统字体。

### 涉及的技术点

- **CSS `font-display: swap`**：确保自定义字体加载期间先显示回退字体，避免 FOIT（Flash of Invisible Text）。
- **Font Face Observer** 或 **document.fonts.load() API**：检测字体加载完成状态，用于在加载期间显示 Skeleton 或过渡效果。
- **Rem-based Scaling**：全局字体缩放通过改变 `html { font-size: calc(16px * var(--font-scale)) }` 实现，所有使用 rem 的元素自动响应。
- **Tailwind v4 字体映射**：在 `@theme inline` 中将 `--font-sans`、`--font-mono` 映射到 Tailwind 的 `font-sans`、`font-mono` 工具类。
- **排版 Token 设计**：参考 Major Third (1.25) 或 Perfect Fourth (1.333) 比例定义 Type Scale：
  ```
  display:  2.986rem / 1.1 / 700
  h1:       2.488rem / 1.2 / 700
  h2:       2.074rem / 1.3 / 600
  h3:       1.728rem / 1.4 / 600
  h4:       1.440rem / 1.4 / 500
  body:     1.000rem / 1.6 / 400
  small:    0.833rem / 1.5 / 400
  caption:  0.694rem / 1.5 / 400
  ```

### 与现有架构的衔接方式

- **新增 `src/composables/useTypography.ts`**：
  - 管理字体配置状态（interface font、codeFont、fontScale）。
  - 提供 `loadFont(fontName: string)` 方法，动态加载 Google Font 或本地字体。
  - 提供 `applyTypography()` 将配置注入 CSS 变量。
- **新增 `src/themes/typography.ts`**：
  - Type Scale Token 定义。
  - 字体回退栈映射（`FONT_STACKS` 对象）。
- **修改 `src/style.css`**：
  - `@theme inline` 中更新 `--font-sans` 和新增 `--font-mono`。
  - `:root` 中增加 `--font-scale: 1`。
  - `html` 的 `font-size` 改为 `calc(16px * var(--font-scale))`。
- **修改 `src/components/CodeBlock.vue`**：
  - 使用 `font-mono` 工具类，确保等宽字体生效。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 在「外观」Tab 中新增「字体设置」卡片。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useTypography.ts` | 新增 | 字体配置状态与加载逻辑 |
| `src/themes/typography.ts` | 新增 | 排版 Token 与字体栈定义 |
| `src/style.css` | 修改 | CSS 变量映射与 rem 缩放 |
| `src/components/CodeBlock.vue` | 修改 | 接入 mono 字体栈 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增字体设置面板 |
| `src/components/FontSelector.vue` | 新增 | 字体选择器 UI 组件 |

## 验收标准

- [ ] 提供至少 3 种界面字体预设和 3 种代码字体预设，支持系统字体回退。
- [ ] 字体大小支持 90% / 100% / 110% / 125% 四档调节，全局实时生效。
- [ ] 自定义字体加载期间使用 `font-display: swap`，无文字闪烁。
- [ ] 所有标题与正文遵循统一的 Type Scale Token，行高和字重合理。
- [ ] 设置面板中可交互式切换字体并预览效果。
- [ ] 与深色模式、主题预设、RTL 方向系统无冲突。

## 优先级

P1

## 参考实现

- [Tailwind CSS Typography Plugin](https://github.com/tailwindlabs/tailwindcss-typography)：排版层级的 Token 设计参考。
- [Google Fonts API](https://developers.google.com/fonts/docs/getting_started)：动态字体加载技术文档。
- [System Font Stack](https://systemfontstack.com/)：各平台最优系统字体回退栈参考。
- [Type Scale](https://type-scale.com/)：排版比例在线计算工具。
