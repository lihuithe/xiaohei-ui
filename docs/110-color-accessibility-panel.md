# 色彩无障碍与配置面板

## 功能背景/动机

当前脚手架的色彩体系基于 shadcn-vue 默认的 OKLCH 灰度色调，虽然已支持 Light/Dark 切换，但在**色彩无障碍（Color Accessibility）**方面存在明显不足：
1. **对比度未量化**：开发者无法直观看到当前主题下各文本/背景组合的实际对比度比率（Contrast Ratio）。
2. **色盲友好性缺失**：未针对色盲/色弱用户（Protanopia、Deuteranopia、Tritanopia）提供色彩适配或模拟预览。
3. **色彩配置分散**：品牌色、语义色（success/warning/info）分散在各组件中，没有集中式的色彩配置面板。
4. **缺少语义化色彩扩展**：除了 primary/secondary/destructive，没有标准化的 `success`、`warning`、`info` 语义色体系。

对于需要满足 WCAG 2.1 AA 甚至 AAA 标准的应用，以及希望「一键让产品对色盲用户友好」的团队，提供一套**色彩无障碍与配置面板**具有极高的模板价值。

## 功能描述

构建一套**色彩无障碍与配置面板**，包含：
1. **语义化色彩扩展**：在现有色彩体系基础上，增加 `success`、`warning`、`info` 三套语义色，每套包含背景、文字、边框、hover 等色阶，并映射到 Tailwind 工具类（`text-success`、`bg-warning` 等）。
2. **实时对比度检测**：提供一个 `ContrastChecker` 工具组件/composable，输入前景色和背景色可实时计算 WCAG AA/AAA 对比度是否达标。
3. **色盲模拟预览**：在主题配置面板中增加「色盲视角」切换按钮，支持模拟 Protanopia（红盲）、Deuteranopia（绿盲）、Tritanopia（蓝盲）、Achromatopsia（全色盲）四种模式，实时预览 UI 在色盲用户眼中的样子。
4. **色彩配置面板**：新增「色彩」设置 Tab，提供：
   - 各语义色的色值选择器（Color Picker）。
   - 对比度实时提示（红/黄/绿标识）。
   - 一键生成无障碍友好配色（基于输入色自动调整亮度直到对比度达标）。
5. **CSS 滤镜模拟**：色盲模拟通过 `filter: url(#protanopia)` SVG 滤镜实现，应用在整个 App 根容器上即可全局预览。

## 目标用户

- **需要满足无障碍合规（WCAG）的政府/企业/教育软件开发者**。
- **希望产品对色盲/色弱用户友好的设计团队**。
- **需要自定义语义色并确保其可读性的开发者**。

## 详细设计

### 交互流程

1. 开发者在 `src/themes/semantic.ts` 中定义语义色 Token：
   ```ts
   export const semanticColors = {
     success: { DEFAULT: '#22c55e', foreground: '#ffffff', muted: '#dcfce7' },
     warning: { DEFAULT: '#f59e0b', foreground: '#ffffff', muted: '#fef3c7' },
     info:    { DEFAULT: '#3b82f6', foreground: '#ffffff', muted: '#dbeafe' },
   }
   ```
2. 这些 Token 被注入 CSS 变量并映射到 Tailwind：`--color-success`、`--color-success-foreground` 等。
3. 用户进入「设置 > 色彩」：
   - 看到当前各语义色的色块和对比度指示（如 success 的 DEFAULT + foreground 组合显示「AA 通过 ✅」）。
   - 点击某个色块打开 Color Picker，调整色值后实时看到 UI 预览和对比度变化。
   - 若对比度不足（如 `< 4.5`），显示警告并提供「自动修复」按钮，系统将自动调整亮度直至达标。
4. 用户点击「色盲模拟」下拉框，选择「红盲」，整个应用蒙上一层 SVG 滤镜，所有色彩变为红盲视角。
5. 开发者可在组件中使用 `<Badge variant="success">`、`<Alert variant="warning">` 等语义化变体。

### 涉及的技术点

- **WCAG 对比度算法**：基于相对亮度（Relative Luminance）计算对比度：`(L1 + 0.05) / (L2 + 0.05)`，正常文本需 ≥ 4.5:1（AA），大文本需 ≥ 3:1。
- **SVG 色盲滤镜**：使用预定义的 SVG `feColorMatrix` 滤镜模拟各类色盲，如 Protanopia 的矩阵变换。将滤镜应用到 `html` 元素即可全局预览。
- **OKLCH 亮度调整**：当对比度不足时，在 OKLCH 色空间中调整 `L`（亮度）值而非直接操作 RGB，确保色相不变、人眼感知平滑。
- **Color Picker 组件**：可利用原生 `<input type="color">` 或引入 `@vueuse/components` 的 `UseColorPicker`，或 shadcn-vue 生态中的颜色选择器。
- **Tailwind v4 自定义颜色**：通过 `@theme inline` 将语义色变量映射为工具类。

### 与现有架构的衔接方式

- **新增 `src/themes/semantic.ts`**：
  - 语义色 Token 定义（success / warning / info）。
  - 对比度计算与自动修复函数。
- **修改 `src/style.css`**：
  - 在 `:root` 和 `.dark` 中增加语义色 CSS 变量。
  - `@theme inline` 中增加 `--color-success`、`--color-warning`、`--color-info` 映射。
- **新增 `src/composables/useColorAccessibility.ts`**：
  - `getContrastRatio(fg, bg)`：计算对比度。
  - `isContrastValid(fg, bg, level = 'AA')`：判断是否达标。
  - `fixContrast(color, bg, level)`：自动调整亮度至达标。
  - `setColorBlindMode(mode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia')`。
- **新增 `src/components/ColorPicker.vue`**：
  - 封装颜色选择器 + 对比度指示。
- **新增 `src/components/ColorBlindSimulator.vue`**：
  - 色盲模拟控制条（下拉选择 + 开关）。
- **修改 `src/components/ui/badge/index.ts` 和 `src/components/ui/alert/index.ts`**：
  - 增加 `success`、`warning`、`info` 变体。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「色彩」Tab，集成语义色配置与色盲模拟。
- **新增 `src/components/SvgColorBlindFilters.vue`**：
  - 定义 SVG 滤镜组件，通过 `<Teleport to="body">` 挂载隐藏 SVG，供 CSS `filter: url(#id)` 引用。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/themes/semantic.ts` | 新增 | 语义色 Token 与对比度工具 |
| `src/composables/useColorAccessibility.ts` | 新增 | 色彩无障碍逻辑 |
| `src/components/ColorPicker.vue` | 新增 | 带对比度提示的颜色选择器 |
| `src/components/ColorBlindSimulator.vue` | 新增 | 色盲模拟控制组件 |
| `src/components/SvgColorBlindFilters.vue` | 新增 | SVG 色盲滤镜定义 |
| `src/style.css` | 修改 | 语义色变量与 Tailwind 映射 |
| `src/components/ui/badge/index.ts` | 修改 | 新增语义色变体 |
| `src/components/ui/alert/index.ts` | 修改 | 新增语义色变体 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增色彩配置 Tab |

## 验收标准

- [ ] 新增 `success`、`warning`、`info` 三套语义色，每套含 DEFAULT / foreground / muted，且深色模式下有对应色值。
- [ ] Tailwind 支持 `bg-success`、`text-warning`、`border-info` 等工具类。
- [ ] `ContrastChecker` 可正确计算任意两色的 WCAG 对比度，并给出 AA/AAA 判定。
- [ ] 对比度不足时提供「自动修复」功能，修复后的色彩保持色相不变且对比度达标。
- [ ] 色盲模拟支持红盲、绿盲、蓝盲、全色盲四种模式，切换后全站 UI 实时预览。
- [ ] Badge 和 Alert 组件支持 `success`、`warning`、`info` 变体，在色盲模拟下仍可通过形状/文字区分。
- [ ] 设置面板中的色彩配置 Tab 可实时调整语义色并预览效果。

## 优先级

P1

## 参考实现

- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)：对比度计算标准工具。
- [Stark (Figma/Sketch Plugin)](https://www.getstark.co/)：设计工具中的色盲模拟与对比度检查标杆。
- [Color Matrix Filters for Color Blindness](https://github.com/hail2u/color-blindness-matrix)：色盲模拟的 SVG/CSS 滤镜矩阵。
- [Radix Colors Semantic](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)：语义化色彩 scale 设计参考。
- [Tailwind CSS Custom Colors](https://tailwindcss.com/docs/customizing-colors)：自定义颜色工具类文档。
