# 阴影与层级系统（Elevation System）

## 功能背景/动机

当前脚手架的阴影使用非常零散：仅在 `App.vue` 的 `.main-content` 中有一个硬编码的 `box-shadow`，以及 `animations.css` 中 `hover-lift` 的临时阴影。没有一套系统化的**Elevation（高度）体系**来管理组件在不同层级上的阴影表现。

在 Material Design 等成熟设计系统中，Elevation 是表达"元素距离表面高度"的核心视觉语言：
- 层级 0：完全贴合表面，无阴影（如普通文本、扁平按钮）。
- 层级 1-2：轻微上浮，用于卡片、列表项（如 `Card`）。
- 层级 3-4：明显上浮，用于下拉菜单、弹窗、浮层（如 `Popover`、`DropdownMenu`）。
- 层级 5+：最高层级，用于模态框、全屏遮罩、抽屉（如 `Dialog`、`Sheet`）。

缺乏 Elevation 系统会导致：
1. **视觉层级混乱**：开发者随意写阴影值，同一页面中不同组件的阴影方向、模糊度、透明度不一致。
2. **深色模式下阴影失效**：深色背景上黑色阴影几乎不可见，需要改用"发光"或"提亮边缘"来表达层级。
3. **Hover/Active 状态缺乏一致反馈**：按钮、卡片在交互时应该通过阴影变化（而非仅颜色变化）来表达按压/抬升。

## 功能描述

构建一套**阴影与层级系统（Elevation System）**，包含：

1. **Elevation Token 体系**：定义 0-5 共 6 个标准层级，每个层级包含：
   - `box-shadow`（浅色模式：向下扩散的阴影）。
   - `box-shadow`（深色模式：边缘微光/提亮替代阴影，或低透明度高光）。
   - `z-index` 对应值。
2. **语义化 Elevation 工具类**：通过 Tailwind 自定义工具类提供 `.elevation-0` 到 `.elevation-5`，自动适配深浅模式。
3. **`Elevated` 容器组件**：包装组件，接收 `level` prop，自动应用对应层级的阴影和 z-index。
4. **交互式阴影变化**：
   - `elevation-hover`：Hover 时自动提升一个层级（如从 1 到 2）。
   - `elevation-active`：Active/按下时降低一个层级（如从 2 到 1），模拟物理按压。
   - `elevation-drag`：拖拽时提升到最高层级（level 4-5），释放后回弹。
5. **Z-Index 管理规范**：将全应用的 z-index 统一纳入 Elevation 系统管理，避免"9999"乱象。定义标准层级：
   - `z-base` (0)、`z-dropdown` (100)、`z-sticky` (200)、`z-fixed` (300)、`z-modal-backdrop` (400)、`z-modal` (500)、`z-popover` (600)、`z-tooltip` (700)、`z-toast` (800)、`z-devtools` (900)。
6. **阴影配置面板**：在设置页或 ComponentPlayground 中提供 Elevation 可视化预览，展示 0-5 层级的卡片堆叠效果。

## 目标用户

- **需要建立一致视觉层级的团队**：避免不同开发者写出风格迥异的阴影。
- **需要深度定制 UI 风格的产品**：通过调整 Elevation Token 即可全局改变"厚重感"（如从扁平风改为拟物风）。
- **需要在深色模式下保持层级可辨的开发者**。

## 详细设计

### 视觉/动画效果描述

**Elevation Token 定义：**
```css
:root {
  /* 浅色模式：传统向下阴影 */
  --elevation-0: none;
  --elevation-1: 0 1px 2px 0 hsl(0 0% 0% / 0.05);
  --elevation-2: 0 1px 3px 0 hsl(0 0% 0% / 0.08), 0 1px 2px -1px hsl(0 0% 0% / 0.04);
  --elevation-3: 0 4px 6px -1px hsl(0 0% 0% / 0.08), 0 2px 4px -2px hsl(0 0% 0% / 0.04);
  --elevation-4: 0 10px 15px -3px hsl(0 0% 0% / 0.08), 0 4px 6px -4px hsl(0 0% 0% / 0.04);
  --elevation-5: 0 20px 25px -5px hsl(0 0% 0% / 0.08), 0 8px 10px -6px hsl(0 0% 0% / 0.04);
}

.dark {
  /* 深色模式：改用边缘微光（glow）+ 极低透明度阴影 */
  --elevation-1: inset 0 1px 0 0 hsl(0 0% 100% / 0.05), 0 1px 2px 0 hsl(0 0% 0% / 0.2);
  --elevation-2: inset 0 1px 0 0 hsl(0 0% 100% / 0.06), 0 1px 3px 0 hsl(0 0% 0% / 0.25), 0 1px 2px -1px hsl(0 0% 0% / 0.15);
  --elevation-3: inset 0 1px 0 0 hsl(0 0% 100% / 0.07), 0 4px 6px -1px hsl(0 0% 0% / 0.3), 0 2px 4px -2px hsl(0 0% 0% / 0.2);
  --elevation-4: inset 0 1px 0 0 hsl(0 0% 100% / 0.08), 0 10px 15px -3px hsl(0 0% 0% / 0.35), 0 4px 6px -4px hsl(0 0% 0% / 0.25);
  --elevation-5: inset 0 1px 0 0 hsl(0 0% 100% / 0.09), 0 20px 25px -5px hsl(0 0% 0% / 0.4), 0 8px 10px -6px hsl(0 0% 0% / 0.3);
}
```

**Z-Index Token：**
```css
:root {
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
  --z-devtools: 900;
}
```

**交互阴影变化：**
- `.elevation-hover-1` → Hover 时 `box-shadow` 从当前层级提升到 `当前层级 + 1`，过渡 200ms。
- `.elevation-active-1` → Active 时降低 1 个层级，过渡 100ms。
- `.elevation-transition` → 所有阴影变化带有 `transition: box-shadow var(--duration-normal) var(--ease-out)`。

### 涉及的技术点

- **CSS 自定义属性（Token）**：将所有阴影和 z-index 抽象为变量，支持运行时全局调整。
- **Tailwind v4 自定义工具类**：通过 `@utility` 或 `@layer utilities` 注册 `.elevation-*` 类，使其与 Tailwind 的 `shadow-*` 类共存但语义更清晰。
- **深色模式适配**：深色模式下黑色阴影不可见，需通过 `inset` 顶部高光 + 深色阴影组合来模拟层级。
- **OLED 纯黑模式适配**：纯黑背景上任何阴影都极难察觉，需要更强的顶部高光或边框亮度差异。
- **性能优化**：使用 `will-change: box-shadow` 谨慎优化频繁交互的组件（如卡片列表）。

### 与现有架构的衔接方式

- **新增 `src/styles/elevation.css`**：
  - 定义所有 Elevation Token 变量。
  - 定义 `.elevation-0` 到 `.elevation-5` 工具类。
  - 定义 `.elevation-hover-*`、`.elevation-active-*` 交互类。
  - 定义 z-index 工具类（`.z-dropdown`、`.z-modal` 等）。
- **修改 `src/style.css`**：
  - `@import './styles/elevation.css'`。
  - 在 `@theme inline` 中映射 `--shadow-elevation-*` 供 Tailwind 使用。
- **新增 `src/components/ui/Elevated.vue`**：
  - Props: `level: 0-5`、`hover?: boolean`、`active?: boolean`、`as?: string`。
  - 自动应用对应工具类。
- **修改现有组件**：
  - `Card.vue`：默认应用 `elevation-1`，支持 `elevation` prop 覆盖。
  - `DialogContent.vue`、`SheetContent.vue`：应用 `elevation-5`。
  - `PopoverContent.vue`、`DropdownMenuContent.vue`：应用 `elevation-3`。
  - `TooltipContent.vue`：应用 `elevation-2`。
  - `Button.vue`：根据 variant 自动应用交互阴影（如 `default` 按钮 Hover 时 elevation+1）。
- **修改 `App.vue`**：
  - 将 `.main-content` 的硬编码阴影替换为 `elevation-1`。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/elevation.css` | 新增 | Elevation Token 与工具类 |
| `src/style.css` | 修改 | 导入 elevation.css 并映射 Tailwind |
| `src/components/ui/Elevated.vue` | 新增 | 层级包装组件 |
| `src/components/ui/card/Card.vue` | 修改 | 默认应用 elevation-1 |
| `src/components/ui/dialog/DialogContent.vue` | 修改 | 应用 elevation-5 |
| `src/components/ui/sheet/SheetContent.vue` | 修改 | 应用 elevation-5 |
| `src/components/ui/popover/PopoverContent.vue` | 修改 | 应用 elevation-3 |
| `src/components/ui/dropdown-menu/DropdownMenuContent.vue` | 修改 | 应用 elevation-3 |
| `src/components/ui/button/Button.vue` | 修改 | 交互时阴影变化 |
| `src/App.vue` | 修改 | 硬编码阴影替换为 Token |

## 验收标准

- [ ] 定义 0-5 共 6 个标准 Elevation 层级，浅色模式使用向下阴影，深色模式使用顶部高光+深色阴影组合。
- [ ] 提供 `.elevation-0` 到 `.elevation-5` 工具类，以及 `.elevation-hover-*`、`.elevation-active-*` 交互类。
- [ ] Z-Index 全应用标准化，消灭随意编写的 `z-index: 9999`。
- [ ] `Elevated` 组件可通过 `level` prop 快速应用层级。
- [ ] `Card`、`Dialog`、`Popover`、`Tooltip` 等核心组件默认接入对应 Elevation 层级。
- [ ] 深色模式和 OLED 纯黑模式下，层级依然可辨。
- [ ] ComponentPlayground 中可交互式预览 0-5 层级的堆叠效果。
- [ ] 调整 `--elevation-*` CSS 变量可全局实时改变阴影风格（如从柔和改为硬朗）。

## 优先级

P0

## 参考实现

- [Material Design 3 - Elevation](https://m3.material.io/styles/elevation/overview)：Google 官方 Elevation 系统设计规范。
- [Apple Design - Layering](https://developer.apple.com/design/human-interface-guidelines/layering)：macOS/iOS 层级与阴影设计指南。
- [Ant Design Shadow](https://ant.design/docs/spec/shadow-cn)：Ant Design 的阴影层级规范。
- [Tailwind CSS Box Shadow](https://tailwindcss.com/docs/box-shadow)：Tailwind 默认阴影工具类参考。
