# 图表与数据可视化深色模式适配系统

## 功能背景/动机

当前脚手架已包含 `ChartContainer.vue` 等图表基础组件（基于 recharts 或类似库），但存在一个典型的深色模式痛点：**图表在暗色主题下的可读性极差**。具体表现为：
1. **坐标轴/网格线颜色未适配**：深色背景上仍使用浅灰色或黑色网格线，导致几乎不可见或与背景混淆。
2. **数据系列颜色未适配**：在浅色模式下明亮的蓝色、绿色在深色背景下可能过曝或对比度不足。
3. **Tooltip/Legend 背景未适配**：图表提示框仍使用白色背景+黑色文字，在深色模式下形成刺眼的光斑。
4. **没有图表主题 Token 体系**：图表颜色与 UI 色彩系统割裂，开发者需要手动维护两套颜色。

对于数据仪表盘类桌面应用，图表是核心内容。提供一套**图表与数据可视化深色模式适配系统**，能让基于此模板的应用在任何主题下都保持数据可读性。

## 功能描述

构建一套**图表与数据可视化深色模式适配系统**，包含：
1. **图表主题 Token 体系**：定义一套独立于 UI 色彩、专为数据可视化设计的颜色 Token（`chart-axis`、`chart-grid`、`chart-tooltip-bg`、`chart-series-1` 到 `chart-series-8` 等），这些 Token 随 Light/Dark/OLED 主题自动变化。
2. **ChartThemeProvider 组件**：包裹图表区域，自动注入当前主题下的图表颜色配置，子图表组件自动读取。
3. **深色模式图表配色方案**：
   - 浅色模式：使用高饱和、明亮的色板（如 `#3b82f6`、`#22c55e`）。
   - 深色模式：调整为略低饱和、更高亮度的色板（如 `#60a5fa`、`#4ade80`），避免在暗背景上刺眼。
   - 网格线从 `rgba(0,0,0,0.1)` 反转为 `rgba(255,255,255,0.1)`。
4. **Tooltip/Legend 自适应**：图表提示框背景、文字颜色、边框自动跟随当前 UI 主题。
5. **图表动画配置统一**：提供统一的图表入场/更新动画参数（duration、easing），并支持全局动画开关控制。
6. **数据表格深色优化**：`DataTableLayout` 中的表格在深色模式下自动应用更适合的斑马纹（从 `rgba(0,0,0,0.02)` 反转为 `rgba(255,255,255,0.02)`）、选中行高亮、排序箭头颜色等。

## 目标用户

- **需要构建数据仪表盘、BI 工具、监控面板的开发者**。
- **希望图表在任何主题下都能自动保持可读性的团队**。
- **基于脚手架开发数据密集型桌面应用的用户**。

## 详细设计

### 交互流程

1. 开发者在图表页面使用 `ChartThemeProvider` 包裹图表：
   ```vue
   <ChartThemeProvider>
     <LineChart :data="data">
       <!-- 图表内部无需手动设置颜色 -->
     </LineChart>
   </ChartThemeProvider>
   ```
2. `ChartThemeProvider` 读取当前主题（通过 `useTheme()`），注入对应的图表颜色配置到 CSS 变量或 provide/inject。
3. `LineChart` / `BarChart` / `PieChart` 等封装组件内部读取这些变量，自动设置坐标轴颜色、网格线颜色、系列色、tooltip 样式。
4. 用户切换 Light -> Dark 主题时，图表颜色平滑过渡（CSS transition 作用于 SVG 元素的 `stroke` 和 `fill`）。
5. 表格场景中，`DataTableLayout` 的 `<Table>` 自动根据 `.dark` class 切换斑马纹和悬停背景色。

### 涉及的技术点

- **CSS 变量驱动 SVG 样式**：SVG 元素（如 `<path>`、`<line>`）的 `stroke` 和 `fill` 可以直接使用 CSS 变量，配合 `transition` 实现主题切换动画。
- **图表库封装**：当前项目已使用 recharts（从 `ChartContainer.vue` 推断），可通过 `ChartThemeProvider` 提供 `theme` 对象，在子组件中通过 `<XAxis stroke="var(--chart-axis)" />` 等方式注入。
- **色板生成**：基于主色生成图表色板时，在深色模式下自动提升亮度（Lightness）约 10-15%，降低饱和度约 5-10%，确保在暗背景上的可读性。
- **表格深色适配**：Tailwind 的 `dark:` 变体已能处理大部分场景，但需要为 `Table` 组件增加 `dark:even:bg-white/5` 等规则。

### 与现有架构的衔接方式

- **修改 `src/style.css`**：
  - 在 `:root` 和 `.dark` 中增加图表专属 CSS 变量：
    ```css
    :root {
      --chart-axis: oklch(0.556 0 0);
      --chart-grid: oklch(0.922 0 0);
      --chart-tooltip-bg: oklch(1 0 0);
      --chart-tooltip-fg: oklch(0.145 0 0);
      --chart-series-1: oklch(0.57 0.2 260);
      --chart-series-2: oklch(0.65 0.18 145);
      /* ... */
    }
    .dark {
      --chart-axis: oklch(0.556 0 0);
      --chart-grid: oklch(1 0 0 / 10%);
      --chart-tooltip-bg: oklch(0.205 0 0);
      --chart-tooltip-fg: oklch(0.985 0 0);
      --chart-series-1: oklch(0.67 0.18 260);
      --chart-series-2: oklch(0.75 0.16 145);
      /* ... */
    }
    ```
- **新增 `src/components/chart/ChartThemeProvider.vue`**：
  - 读取当前主题，通过 `provide(CHART_THEME_KEY, config)` 向下传递。
- **修改 `src/components/ui/chart/ChartContainer.vue`**：
  - 接入 CSS 变量，设置默认坐标轴、网格、tooltip 样式。
- **新增 `src/components/chart/LineChart.vue`、`BarChart.vue`、`PieChart.vue`**：
  - 基于 recharts 的封装，自动读取 ChartThemeProvider 配置。
- **修改 `src/components/ui/table/Table.vue` / `TableRow.vue`**：
  - 增加深色模式下的斑马纹和悬停样式。
- **修改 `src/components/layouts/DashboardLayout.vue`**：
  - 将现有图表占位替换为接入主题系统的真实图表组件。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/style.css` | 修改 | 增加图表专属 CSS 变量 |
| `src/components/chart/ChartThemeProvider.vue` | 新增 | 图表主题上下文提供 |
| `src/components/chart/LineChart.vue` | 新增 | 折线图封装 |
| `src/components/chart/BarChart.vue` | 新增 | 柱状图封装 |
| `src/components/chart/PieChart.vue` | 新增 | 饼图封装 |
| `src/components/ui/chart/ChartContainer.vue` | 修改 | 接入主题变量 |
| `src/components/ui/table/TableRow.vue` | 修改 | 深色斑马纹与悬停 |
| `src/components/layouts/DashboardLayout.vue` | 修改 | 接入图表组件展示 |

## 验收标准

- [ ] 图表主题变量在 `:root` 和 `.dark` 中有完整定义（至少 8 个数据系列色）。
- [ ] `ChartThemeProvider` 包裹下的图表在 Light/Dark 切换时，坐标轴、网格、tooltip 颜色自动适配。
- [ ] 深色模式下图表数据系列色自动提升亮度，避免刺眼或不可读。
- [ ] 表格在深色模式下斑马纹为 `rgba(255,255,255,0.03)`，选中行有明显高亮。
- [ ] 图表颜色切换时有 CSS 过渡动画（约 300ms）。
- [ ] DashboardLayout 中的统计图表在两种主题下均清晰可读。

## 优先级

P2

## 参考实现

- [Recharts Theming](https://recharts.org/en-US/examples/CustomizedLabelLineChart)：Recharts 主题定制官方示例。
- [Radix Colors Chart](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-chart)：为图表设计的色彩 scale 方法论。
- [Ant Design Charts Theme](https://ant-design-charts.antgroup.com/zh/examples/case/theme/#theme)：图表主题切换实现参考。
- [Tailwind CSS Dark Mode Tables](https://tailwindcss.com/docs/table-layout)：深色模式表格样式工具类。
