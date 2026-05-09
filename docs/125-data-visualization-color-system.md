# 数据可视化配色系统

## 功能背景/动机

当前脚手架已通过 114（图表深色模式适配）实现了图表在深浅模式下的基本颜色切换，但缺乏一套**系统化、可扩展、无障碍友好**的数据可视化配色方案。实际开发中，图表配色往往面临以下问题：

1. **配色随意**：开发者直接从主题色中挑选几个颜色用于图表，缺乏分类色（Categorical）、连续色（Sequential）、发散色（Diverging）的区分，导致饼图、柱状图、热力图配色混乱。
2. **深色模式可读性差**：浅色模式下鲜艳的蓝色在深色模式下可能过亮刺眼；低饱和度的灰色在深色模式下可能与背景融合。
3. **色盲不友好**：红绿对比的图表（如涨跌、正负）对红绿色盲用户完全失效。
4. **无配色 Token**：图表颜色未纳入 CSS 变量体系，切换主题时图表颜色硬编码，无法响应主题变化。
5. **多图表一致性差**：同一页面的折线图、柱状图、饼图使用不同的颜色来源，视觉风格割裂。

提供一套**数据可视化配色系统**，能让开发者像使用 `bg-primary` 一样使用图表颜色（如 `chart-categorical-1`、`chart-sequential-start`），并确保在任何主题、任何无障碍需求下都能清晰传达数据含义。

## 功能描述

构建一套**数据可视化配色系统**，包含：

1. **图表配色 Token 体系**：
   - **分类色（Categorical）**：8-12 组高区分度颜色，用于饼图、柱状图、条形图等离散数据系列。每组颜色在深浅模式下有对应值，确保对比度一致。
   - **连续色（Sequential）**：从浅到深的单色系渐变（5-7 阶），用于热力图、地图、密度图。支持基于主题主色生成。
   - **发散色（Diverging）**：双极渐变（如 蓝→白→红），用于展示偏离中心值的数据（温差、涨跌、正负情绪）。
   - **语义色（Semantic）**：与 110 的语义色系统对接，提供 `chart-success`、`chart-warning`、`chart-info`、`chart-danger` 专用于图表场景（通常比 UI 语义色更鲜艳以确保数据可读）。
2. **图表配色生成器**：
   - `generateChartPalette(baseColor: string, type: 'categorical' | 'sequential' | 'diverging')`：输入一个品牌色，自动生成完整的图表配色方案。
   - 基于 OKLCH 色空间生成，确保亮度均匀、色相区分度高。
3. **`ChartColorProvider` 组件/Context**：
   - 包裹图表区域，自动注入当前主题下的完整配色方案。
   - 图表组件（如 Recharts、ECharts、Chart.js 封装）自动从中读取颜色，无需手动传入。
4. **图表配色预览面板**：
   - 在 ComponentPlayground 中新增「图表配色」区域，展示：
     - 分类色的饼图/柱状图预览。
     - 连续色的热力图预览。
     - 发散色的温差图预览。
     - 色盲模拟下的所有图表配色效果（与 110 的色盲模拟联动）。
5. **无障碍图表配色模式**：
   - **高对比度图表模式**：自动将分类色替换为高对比度版本（如黑/白/黄/蓝等高对比组合）。
   - **图案填充模式**：为色盲用户提供除颜色外的图案区分（条纹、点状、斜线等）。
   - **单色友好模式**：所有图表仅使用明度差异来区分数据（去除色相依赖）。

## 目标用户

- **需要为仪表盘、报表、数据面板快速配色的开发者**。
- **需要确保图表对色盲/色弱用户友好的产品团队**。
- **需要根据品牌色自动生成图表配色方案的设计团队**。

## 详细设计

### 视觉/动画效果描述

**分类色 Token（示例）：**
```css
:root {
  /* 浅色模式：使用较高饱和度，在白色背景上清晰可辨 */
  --chart-categorical-1:  oklch(0.6 0.15 250);   /* 蓝 */
  --chart-categorical-2:  oklch(0.65 0.14 160);  /* 绿 */
  --chart-categorical-3:  oklch(0.6 0.16 30);    /* 橙红 */
  --chart-categorical-4:  oklch(0.55 0.13 300);  /* 紫 */
  --chart-categorical-5:  oklch(0.65 0.12 90);   /* 黄 */
  --chart-categorical-6:  oklch(0.55 0.11 190);  /* 青 */
  --chart-categorical-7:  oklch(0.6 0.13 20);    /* 红 */
  --chart-categorical-8:  oklch(0.55 0.1  340);  /* 玫红 */
}

.dark {
  /* 深色模式：降低亮度、降低饱和度，避免刺眼 */
  --chart-categorical-1:  oklch(0.75 0.1  250);
  --chart-categorical-2:  oklch(0.8  0.09 160);
  --chart-categorical-3:  oklch(0.75 0.11 30);
  --chart-categorical-4:  oklch(0.7  0.08 300);
  --chart-categorical-5:  oklch(0.8  0.08 90);
  --chart-categorical-6:  oklch(0.7  0.07 190);
  --chart-categorical-7:  oklch(0.75 0.09 20);
  --chart-categorical-8:  oklch(0.7  0.07 340);
}
```

**连续色 Token：**
```css
:root {
  --chart-sequential-1: oklch(0.95 0.03 250);  /* 最浅 */
  --chart-sequential-2: oklch(0.85 0.06 250);
  --chart-sequential-3: oklch(0.7  0.09 250);
  --chart-sequential-4: oklch(0.55 0.12 250);
  --chart-sequential-5: oklch(0.4  0.14 250);  /* 最深 */
}
```

**发散色 Token（以蓝-白-红为例）：**
```css
:root {
  --chart-diverging-negative-2: oklch(0.5  0.14 250); /* 深蓝 */
  --chart-diverging-negative-1: oklch(0.7  0.1  250); /* 浅蓝 */
  --chart-diverging-neutral:    oklch(0.95 0 0);      /* 白 */
  --chart-diverging-positive-1: oklch(0.7  0.1  30);  /* 浅红 */
  --chart-diverging-positive-2: oklch(0.5  0.14 30);  /* 深红 */
}
```

**语义色（图表专用，比 UI 语义色更鲜艳）：**
```css
:root {
  --chart-success: oklch(0.65 0.18 145);
  --chart-warning: oklch(0.75 0.16 85);
  --chart-info:    oklch(0.65 0.15 250);
  --chart-danger:  oklch(0.6  0.18 25);
}
```

### 涉及的技术点

- **OKLCH 色空间生成**：使用 `culori` 或自研函数在 OKLCH 空间中均匀分布色相/亮度，生成分类色和渐变。
- **WCAG 对比度计算**：确保每种图表颜色与其背景（浅色/深色）的对比度 ≥ 3:1（图表元素属于"大文本/图形"，3:1 即可）。
- **色盲友好配色算法**：生成分类色时，避免红绿相邻、确保色相在色盲模拟下仍有足够明度差异。
- **CSS 变量动态注入**：与 101（动态主题预设）联动，切换主题时自动重新生成并注入图表配色。
- **图表库适配**：提供适配层，将 Token 转换为 Recharts 的 `colors` 数组、ECharts 的 `color` 数组等。

### 与现有架构的衔接方式

- **新增 `src/themes/chart-colors.ts`**：
  - 图表配色的默认 Token 定义（TypeScript 对象）。
  - `generateChartPalette()` 函数：基于输入色生成完整配色方案。
  - `getChartColors(mode: 'light' | 'dark')`：返回当前模式下的颜色数组。
- **新增 `src/themes/chart-patterns.ts`**（可选）：
  - SVG pattern 定义（条纹、点状、斜线），用于色盲友好模式。
- **修改 `src/style.css`**：
  - 在 `:root` 和 `.dark` 中注入所有 `--chart-*` CSS 变量。
  - 在 `@theme inline` 中增加 `--color-chart-*` 映射。
- **新增 `src/composables/useChartColors.ts`**：
  - 读取当前主题，返回响应式的图表颜色数组。
  - 提供 `chartColor(index: number)` 按索引获取分类色。
  - 提供 `sequentialColors(count: number)` 生成指定阶数的连续色。
- **新增 `src/components/chart/ChartColorProvider.vue`**：
  - Provide/Inject 模式，向子图表组件注入配色方案。
- **修改 `src/components/ui/chart/` 下的图表组件**：
  - 接入 `useChartColors()` 或 `ChartColorProvider`，自动使用主题配色。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 在「色彩」Tab 中新增「图表配色」区域，可预览和调整。
- **修改 `ComponentPlayground.vue`**：
  - 新增「图表配色」演示区，展示饼图、柱状图、热力图、发散图。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/themes/chart-colors.ts` | 新增 | 图表配色 Token 与生成器 |
| `src/themes/chart-patterns.ts` | 新增 | SVG 图案定义（色盲友好） |
| `src/style.css` | 修改 | 注入 --chart-* CSS 变量 |
| `src/composables/useChartColors.ts` | 新增 | 图表颜色响应式获取 |
| `src/components/chart/ChartColorProvider.vue` | 新增 | 图表配色上下文提供 |
| `src/components/chart/ChartColorPreview.vue` | 新增 | 配色预览组件 |
| `src/components/ui/chart/ChartContainer.vue` | 修改 | 接入自动配色 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增图表配色设置 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增图表配色演示区 |

## 验收标准

- [ ] 定义完整的分类色（8-12 组）、连续色（5-7 阶）、发散色（5 阶）Token，深浅模式均有对应值。
- [ ] `generateChartPalette()` 可基于任意品牌色生成完整图表配色方案。
- [ ] 图表组件（ChartContainer 等）自动读取当前主题配色，无需手动传入颜色。
- [ ] 分类色在色盲模拟（红盲/绿盲）下仍可通过明度区分。
- [ ] 提供高对比度图表模式，配色对比度 ≥ 3:1。
- [ ] 提供图案填充模式，色盲用户可通过纹理区分数据系列。
- [ ] 切换主题预设（101）时，图表配色自动平滑过渡。
- [ ] ComponentPlayground 中可交互式预览所有图表配色效果。

## 优先级

P1

## 参考实现

- [D3 Color Schemes](https://d3js.org/d3-scale-chromatic)：D3 的分类/连续/发散配色方案集合。
- [Observable Plot - Color Schemes](https://observablehq.com/plot/features/scales#color-schemes)：数据可视化配色最佳实践。
- [ColorBrewer](https://colorbrewer2.org/)：经典的制图配色工具，色盲友好性考量。
- [Google Material Design - Data Visualization Colors](https://m3.material.io/styles/color/overview)：Material Design 数据可视化配色规范。
- [IBM Carbon - Data Visualization](https://carbondesignsystem.com/data-visualization/color-palettes/)：IBM 数据可视化配色系统。
