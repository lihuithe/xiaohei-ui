# 圆角与间距 Token 系统

## 功能背景/动机

当前脚手架的圆角和间距主要依赖 Tailwind 的默认值（如 `rounded-md`、`p-4`、`gap-2`）以及 shadcn-vue 组件内部的硬编码值。虽然 Tailwind 提供了一套实用的工具类，但对于需要**精细化、品牌化**的桌面应用而言，存在以下问题：

1. **圆角不统一**：`Button.vue` 中使用 `rounded-lg`，`Card.vue` 中使用 `rounded-xl`（或 `--radius` 变量），`Input.vue` 中可能是 `rounded-md`，同一页面中不同组件的圆角缺乏统一的"家族感"。
2. **间距随意**：开发者使用 `p-2`、`p-3`、`p-4` 全凭手感，没有基于 4px/8px 基准网格的严格规范，导致页面排版微观上"东倒西歪"。
3. **无全局调控能力**：若想将产品的整体风格从"大圆角亲和风"改为"小圆角专业风"，需要逐文件修改大量组件。
4. **密度模式缺失**：不同场景（如数据密集型表格 vs 设置表单）需要不同的间距密度，当前无此概念。

建立一套**圆角与间距 Token 系统**，能让开发者通过修改几个变量即可全局改变产品的"气质"，同时保证所有组件遵循同一套网格纪律。

## 功能描述

构建一套**圆角与间距 Token 系统**，包含：

1. **圆角 Token 体系（Radius Scale）**：
   - 定义从 `radius-none` 到 `radius-full` 的完整圆角阶梯（如 0px / 4px / 8px / 12px / 16px / 24px / 9999px）。
   - 语义化命名：`radius-sm`（标签、小按钮）、`radius-md`（输入框、小卡片）、`radius-lg`（按钮、弹窗）、`radius-xl`（大卡片、面板）、`radius-2xl`（特殊装饰元素）。
   - 全局基准圆角 `--radius-base`：修改此变量可一键将全应用圆角整体调大或调小。
2. **间距 Token 体系（Spacing Scale）**：
   - 基于 4px 基准网格，定义从 `space-0` (0px) 到 `space-20` (80px) 的完整阶梯。
   - 语义化命名：`space-xs`（紧凑内联间距）、`space-sm`（相关元素间距）、`space-md`（组件内部间距）、`space-lg`（组件之间间距）、`space-xl`（区块之间间距）、`space-2xl`（页面级间距）。
   - 支持密度模式：`density-compact`、`density-default`、`density-comfortable` 三档，分别将间距缩放为 0.75x / 1x / 1.25x。
3. **网格系统（Grid System）**：
   - 定义桌面应用的基准栅格：12 列或 24 列网格。
   - 提供 `Grid`、`GridItem` 组件，支持 `span`、`offset`、`gutter` 等 prop。
4. **尺寸 Token 体系（Size Scale）**：
   - 标准化的元素尺寸：`size-xs`（20px，极小按钮/图标）、`size-sm`（24px）、`size-md`（32px，标准按钮/输入框高度）、`size-lg`（40px）、`size-xl`（48px，大按钮/导航项）。
5. **Token 配置面板**：在设置页中提供「间距与圆角」Tab，可实时调节：
   - 圆角风格滑块（锐利 / 默认 / 柔和 / 圆润）。
   - 密度模式选择（紧凑 / 默认 / 宽松）。
   - 实时预览区展示按钮、卡片、输入框在不同设置下的效果。

## 目标用户

- **需要快速统一产品视觉风格的设计团队/开发者**。
- **需要根据用户偏好调节界面密度的应用**（如开发者工具偏好紧凑，消费级应用偏好宽松）。
- **希望学习现代 Design Token 化实践的开发者**。

## 详细设计

### 视觉/动画效果描述

**圆角 Token：**
```css
:root {
  --radius-base: 1; /* 全局圆角乘数，1 = 默认，0.5 = 锐利，1.5 = 圆润 */
  --radius-none: 0px;
  --radius-xs: calc(2px * var(--radius-base));
  --radius-sm: calc(4px * var(--radius-base));
  --radius-md: calc(8px * var(--radius-base));
  --radius-lg: calc(12px * var(--radius-base));
  --radius-xl: calc(16px * var(--radius-base));
  --radius-2xl: calc(24px * var(--radius-base));
  --radius-full: 9999px;
}
```

**间距 Token：**
```css
:root {
  --density: 1; /* 密度乘数：compact=0.75, default=1, comfortable=1.25 */
  --space-0: 0px;
  --space-1: calc(4px * var(--density));
  --space-2: calc(8px * var(--density));
  --space-3: calc(12px * var(--density));
  --space-4: calc(16px * var(--density));
  --space-5: calc(20px * var(--density));
  --space-6: calc(24px * var(--density));
  --space-8: calc(32px * var(--density));
  --space-10: calc(40px * var(--density));
  --space-12: calc(48px * var(--density));
  --space-16: calc(64px * var(--density));
  --space-20: calc(80px * var(--density));
}
```

**尺寸 Token：**
```css
:root {
  --size-xs: 20px;
  --size-sm: 24px;
  --size-md: 32px;  /* 标准按钮、输入框高度 */
  --size-lg: 40px;
  --size-xl: 48px;
  --size-2xl: 56px;
}
```

**语义化映射到 Tailwind：**
```css
@theme inline {
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-2xl: var(--radius-2xl);
  --spacing-1: var(--space-1);
  --spacing-2: var(--space-2);
  /* ... */
}
```

### 涉及的技术点

- **CSS 变量乘数**：通过 `--radius-base` 和 `--density` 两个乘数变量，实现"一键调控"全站圆角和间距。
- **Tailwind v4 `@theme inline`**：将 Token 映射到 Tailwind 的工具类，确保 `rounded-lg`、`p-4`、`gap-2` 等类使用我们的 Token 值。
- **CSS `calc()` 嵌套**：`calc(4px * var(--density))` 在运行时动态计算。
- **组件尺寸一致性**：所有按钮、输入框、标签、图标容器均从 `size-md` / `size-sm` 等 Token 中选取，杜绝随意写 `h-9`、`h-[38px]`。
- **Grid 系统**：使用 CSS Grid + `repeat(12, 1fr)`，配合 `gap` Token 实现响应式栅格。

### 与现有架构的衔接方式

- **新增 `src/themes/spacing.ts`**：
  - 定义 Spacing/Radius/Size Token 的 TypeScript 类型和默认值。
- **修改 `src/style.css`**：
  - 在 `:root` 中注入 `--radius-base`、`--density`、所有 `--radius-*`、所有 `--space-*`、所有 `--size-*`。
  - 在 `@theme inline` 中将 Tailwind 的 spacing、radius 映射到这些变量。
  - 移除现有硬编码的 `--radius-sm`、`--radius-md` 等（改为引用 Token）。
- **修改所有 UI 组件**：
  - `Button.vue`：高度从 `h-8` 改为 `h-[var(--size-md)]`，圆角从 `rounded-lg` 改为 `rounded-[var(--radius-lg)]`。
  - `Input.vue`、`Textarea.vue`：高度和圆角改为 Token 引用。
  - `Card.vue`：圆角改为 `rounded-[var(--radius-xl)]`。
  - `Badge.vue`：圆角改为 `rounded-[var(--radius-full)]`（pill 形状）。
  - `Avatar.vue`：尺寸改为 `size-[var(--size-lg)]` 等。
  - 所有组件的 `p-*`、`gap-*`、`m-*` 类改为对应的 Token 值。
- **新增 `src/composables/useDensity.ts`**：
  - 管理 `density` 状态（compact / default / comfortable）。
  - 持久化到 `localStorage`。
  - 提供 `applyDensity()` 修改 `--density` CSS 变量。
- **新增 `src/components/ui/grid/` 目录**：
  - `Grid.vue`：栅格容器。
  - `GridItem.vue`：栅格子项。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「间距与圆角」Tab，提供圆角滑块和密度选择。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/themes/spacing.ts` | 新增 | Token 类型与默认值定义 |
| `src/style.css` | 修改 | 注入 Token 变量并映射 Tailwind |
| `src/composables/useDensity.ts` | 新增 | 密度模式状态管理 |
| `src/components/ui/grid/Grid.vue` | 新增 | 栅格容器 |
| `src/components/ui/grid/GridItem.vue` | 新增 | 栅格子项 |
| `src/components/ui/button/Button.vue` | 修改 | 接入 size/radius Token |
| `src/components/ui/input/Input.vue` | 修改 | 接入 size/radius Token |
| `src/components/ui/card/Card.vue` | 修改 | 接入 radius Token |
| `src/components/ui/badge/Badge.vue` | 修改 | 接入 radius Token |
| `src/components/ui/avatar/Avatar.vue` | 修改 | 接入 size Token |
| `src/App.vue` | 修改 | 间距接入 Token |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增间距圆角设置 Tab |

## 验收标准

- [ ] 定义完整的 Radius Scale（none/xs/sm/md/lg/xl/2xl/full），通过 `--radius-base` 可全局调节。
- [ ] 定义基于 4px 网格的 Spacing Scale（0-20，即 0-80px），通过 `--density` 可三档调节密度。
- [ ] 定义标准化的 Size Scale（xs-2xl），按钮、输入框、Avatar 等组件统一从中选取。
- [ ] Tailwind 的 `rounded-*`、`p-*`、`gap-*`、`m-*` 等类映射到 Token 值。
- [ ] 提供 `Grid` / `GridItem` 组件，支持 12 列栅格布局。
- [ ] 设置面板中可实时调节圆角风格和密度模式，预览区即时响应。
- [ ] 从紧凑切换到宽松模式后，所有组件间距自动响应，无硬编码值"掉队"。
- [ ] 与 RTL 布局（103）兼容，Grid 的 offset/span 在 RTL 下自动镜像。

## 优先级

P0

## 参考实现

- [Tailwind CSS Spacing](https://tailwindcss.com/docs/customizing-spacing)：Tailwind 默认间距 scale 设计参考。
- [Material Design 3 - Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)：Material Design 间距规范。
- [Ant Design Grid](https://ant.design/components/grid-cn)：24 列栅格系统实现参考。
- [Radix UI - Design Tokens](https://www.radix-ui.com/themes/docs/theme/spacing)：Radix 的间距 Token 设计哲学。
- [IBM Carbon Design System - Spacing](https://carbondesignsystem.com/elements/spacing/overview/)：IBM 的 2px 基准网格规范。
