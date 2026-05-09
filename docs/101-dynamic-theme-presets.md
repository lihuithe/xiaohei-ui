# 动态主题预设与品牌色注入系统

## 功能背景/动机

当前脚手架仅内置了 Light / Dark / System 三种基础主题，且色彩体系完全基于 shadcn-vue 的默认灰度色调。对于实际产品而言，开发者几乎都需要替换品牌色、调整圆角半径、甚至引入多套主题预设（如「紫罗兰」「海洋蓝」「日落橙」等）。

如果脚手架能提供：
- 多组开箱即用的主题预设
- 通过配置文件或可视化面板一键切换主题
- 支持运行时动态注入品牌主色并自动生成衍生色

将大幅降低开发者适配 UI 的视觉成本，也是展示「Tailwind CSS v4 + CSS 变量」最佳实践的绝佳场景。

## 功能描述

构建一套**动态主题预设与品牌色注入系统**，包含：
1. **主题预设引擎**：内置 4-6 套精心调校的主题预设（含 Light/Dark 双版本），每套主题是一组完整的 CSS 自定义属性（CSS Variables）。
2. **品牌色注入器**：允许开发者通过配置对象指定 `primary` 品牌色，系统自动基于 OKLCH 色空间生成 `primary-foreground`、`secondary`、`accent`、`destructive` 等派生色，并注入到 CSS 变量中。
3. **主题切换过渡**：切换主题时，所有色彩属性平滑过渡（利用 `transition` 与 `theme-transitioning` class）。
4. **主题预览面板**：在 ComponentPlayground 或新增 ThemeShowcase 页面中提供可视化主题切换器，实时预览不同主题效果。

## 目标用户

- **刚拿到脚手架的前端开发者**：想快速替换默认灰色系为自己产品的品牌色。
- **需要支持多主题的产品团队**：如「深色模式 + 高对比度 + 品牌蓝」的组合需求。
- **希望学习现代 CSS 变量与色彩空间运用的开发者**。

## 详细设计

### 交互流程

1. 开发者在 `src/themes/presets.ts` 中新增或修改主题预设对象：
   ```ts
   export const oceanTheme = {
     name: 'ocean',
     label: '海洋蓝',
     light: { primary: '#0066cc', background: '#f8fafc', /* ... */ },
     dark: { primary: '#3b9eff', background: '#0f172a', /* ... */ },
   }
   ```
2. 系统在启动时读取 `localStorage` 中保存的主题 key，通过 `useTheme()` 调用 `injectThemeVars()` 将变量写入 `:root`。
3. 用户通过 UI 面板（如设置页中的「外观」Tab）点击不同主题卡片，实时切换并预览。
4. 若开发者配置了 `brandColor`，则调用 `generatePalette(brandColor)` 自动生成 OKLCH 调色板，覆盖预设中的 primary 系列。

### 涉及的技术点

- **OKLCH 色彩空间**：使用 `culori` 或自研 OKLCH 转换工具函数，确保生成的色彩在人眼感知下亮度一致，避免传统 HSL 的亮度漂移问题。
- **CSS 自定义属性动态注入**：通过 JavaScript 修改 `:root` style 属性，而非切换 class，保证任意时刻都能响应式更新。
- **Tailwind v4 `@theme inline`**：主题变量与 Tailwind 的 `@theme inline` 映射对接，确保 `bg-primary`、`text-primary-foreground` 等工具类始终生效。
- **过渡动画**：延续现有的 `.theme-transitioning` 机制，但在切换「整套主题」时，过渡时长延长至 500ms，并增加 `cubic-bezier` 缓动。

### 与现有架构的衔接方式

- **修改 `useTheme.ts`**：
  - 扩展 `Theme` 类型为 `'light' | 'dark' | 'system' | string`（支持自定义主题 key）。
  - 新增 `applyPreset(themeKey: string)` 方法，从 presets 中查找并注入变量。
  - 保留原有的 `light/dark/system` 语义，作为内置基础预设。
- **新增 `src/themes/` 目录**：
  - `presets.ts`：所有内置预设定义。
  - `generator.ts`：品牌色 -> 完整调色板的生成逻辑。
  - `types.ts`：ThemePreset、ColorScale 等类型定义。
- **修改 `style.css`**：
  - `:root` 和 `.dark` 中的硬编码色值改为引用 CSS 变量，但保持默认回退值，确保无 JS 时也能渲染。
- **新增/修改页面**：
  - 在 `ComponentPlayground.vue` 或新增 `ThemeShowcase.vue` 中增加「主题画廊」区域，展示所有预设主题在按钮、卡片、输入框、图表上的效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/themes/types.ts` | 新增 | 主题预设相关 TS 类型 |
| `src/themes/presets.ts` | 新增 | 内置主题预设（default、ocean、forest、sunset、midnight） |
| `src/themes/generator.ts` | 新增 | 基于 OKLCH 的品牌色生成器 |
| `src/composables/useTheme.ts` | 修改 | 扩展以支持预设切换与变量注入 |
| `src/style.css` | 修改 | 优化 CSS 变量回退与过渡 |
| `src/pages/ThemeShowcase.vue` | 新增 | 主题预览画廊页面（可选） |
| `src/components/ThemeSelector.vue` | 新增 | 主题选择器组件（卡片式 UI） |

## 验收标准

- [ ] 新增至少 5 套主题预设，每套包含 Light/Dark 双版本。
- [ ] 提供 `generatePalette(hexColor)` 函数，输入品牌色可自动生成 12+ 个语义化色阶。
- [ ] `useTheme` 支持 `setTheme('ocean')` 这类预设切换，且切换时全站色彩平滑过渡。
- [ ] ComponentPlayground 或新增页面中可交互式切换主题并实时预览。
- [ ] 文档说明如何添加自定义预设、如何注入品牌色。

## 优先级

P0

## 参考实现

- [shadcn-ui Themes](https://ui.shadcn.com/themes)：展示多种主题预设的视觉效果与变量映射方式。
- [Radix Colors](https://www.radix-ui.com/colors)：OKLCH 感知均匀的色彩 scale 设计哲学。
- [culori](https://culorijs.org/)：JavaScript 色彩空间转换库，可用于运行时生成色板。
