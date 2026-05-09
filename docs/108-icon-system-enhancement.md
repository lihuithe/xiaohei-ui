# 图标系统增强

## 功能背景/动机

当前脚手架的图标方案非常单一：全局使用 `lucide-vue-next`，通过 `import { IconName } from 'lucide-vue-next'` 按需引入。这在实际产品中有以下局限：
1. **无法动态切换图标主题**：Lucide 仅提供一套线性轮廓风格，如果产品需要填充风格（Filled）、双色风格（Duotone）或彩色图标，无法平滑切换。
2. **动态图标加载困难**：如图标名称来自后端配置（如菜单权限系统返回的图标名），需要写大量 `if/else` 或 `component :is` 映射。
3. **自定义 SVG 图标管理混乱**：产品自有图标（如 Logo、特色功能图标）与 Lucide 图标混用，没有统一的注册、命名空间、类型安全机制。
4. **图标尺寸/描边不规范**：不同开发者可能传入 `:size="16"`、`:size="18"`、`:size="20"`，导致同一页面图标大小不一。

提供一套**图标系统增强方案**，能让开发者像使用组件库一样管理、切换、扩展图标，是脚手架的重要基础设施。

## 功能描述

构建一套**图标系统增强方案**，包含：
1. **统一图标注册中心**：所有图标（Lucide + 自定义 SVG）通过 `registerIcon(name, component)` 注册到全局图标库，任何地方通过 `<AppIcon name="xxx" />` 使用。
2. **图标主题切换**：支持 `theme: 'outline' | 'filled' | 'duotone'`，同一图标名在不同主题下自动渲染对应风格的图标组件。
3. **动态图标解析**：图标名支持字符串形式传入（如 `<AppIcon name="settings" />`），无需提前 import，适用于配置化菜单、动态表单等场景。
4. **自定义 SVG 图标管理**：提供 `src/assets/icons/` 目录规范，SVG 文件自动（或半自动）注册为 Vue 组件，并纳入统一命名空间。
5. **图标尺寸规范**：预设 `xs(12)`、`sm(14)`、`md(16)`、`lg(20)`、`xl(24)` 规范尺寸，避免随意传值。
6. **图标颜色继承**：默认继承当前文字颜色（`currentColor`），支持通过 `color` prop 传入语义化颜色 token（`primary`、`muted`、`destructive` 等）。

## 目标用户

- **需要统一管理大量图标的开发者**。
- **菜单/表单等元素需要后端配置化渲染图标的产品**。
- **需要支持多种图标风格（如浅色模式用 outline、深色模式用 filled）的产品**。
- **有大量自有品牌图标的团队**。

## 详细设计

### 交互流程

1. **开发期**：
   - 将自定义 SVG 放入 `src/assets/icons/`（如 `src/assets/icons/logo.svg`）。
   - 运行 `pnpm icons:register`（脚本自动扫描目录并生成注册表），或手动在 `src/icons/registry.ts` 中注册。
2. **使用期**：
   - 开发者在模板中写 `<AppIcon name="logo" size="lg" color="primary" />`。
   - 若当前图标主题为 `filled`，系统优先查找 `logo-filled`；不存在则回退到 `logo`。
3. **动态场景**：
   - 后端返回菜单配置 `[{ label: '设置', icon: 'settings' }]`，前端直接用 `<AppIcon :name="item.icon" />` 渲染。
4. **主题切换**：
   - 用户在设置中选择「图标风格：填充」，全局 `iconTheme` 状态变更，所有 `AppIcon` 自动重新解析并渲染对应风格。

### 涉及的技术点

- **Vue 动态组件与异步加载**：利用 `defineAsyncComponent` 或 `shallowRef` 实现图标组件的按需加载，避免一次性打包所有图标。
- **SVG -> Vue Component 转换**：使用 `vite-plugin-svgr` 或 `unplugin-icons`，将 `.svg` 文件转换为 Vue SFC 组件。
- **图标注册表设计**：`Map<string, IconDefinition>`，其中 `IconDefinition` 包含 `outline`、`filled`、`duotone` 三种实现。
- **Tree-shaking 友好**：虽然提供统一入口，但底层仍利用 Lucide 的按需引入 + Vite 的 Tree-shaking，避免打包全部图标。
- **TypeScript 类型安全**：通过脚本生成 `IconName` 联合类型，确保 `name` prop 有自动补全和编译时检查。

### 与现有架构的衔接方式

- **新增 `src/icons/` 目录**：
  - `registry.ts`：图标注册中心，提供 `registerIcon()`、`resolveIcon()`。
  - `types.ts`：`IconTheme`、`IconDefinition`、`IconName` 等类型。
  - `index.ts`：统一导出。
  - `lucide-mapping.ts`：Lucide 图标名到组件的自动映射表（可通过脚本生成）。
- **新增 `src/components/AppIcon.vue`**：
  - Props: `name: IconName | string`、`size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number`、`color: string`、`theme: IconTheme`。
  - 内部调用 `resolveIcon(name, theme)` 获取组件，通过 `<component :is="iconComponent" />` 渲染。
- **新增 `src/composables/useIconTheme.ts`**：
  - 管理全局 `iconTheme` 状态（与 `useTheme` 并列）。
  - 持久化到 `localStorage`。
- **修改 `src/components/Sidebar.vue`**：
  - 将现有的 `<component :is="item.icon" />` 替换为 `<AppIcon :name="item.icon" />`。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 在「外观」Tab 中新增「图标风格」选择器。
- **新增构建脚本**（可选）：
  - `scripts/generate-icon-types.ts`：扫描 `src/assets/icons/` 和 `lucide-vue-next` 导出，生成 `IconName` 联合类型。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/icons/types.ts` | 新增 | 图标系统类型定义 |
| `src/icons/registry.ts` | 新增 | 图标注册与解析中心 |
| `src/icons/lucide-mapping.ts` | 新增 | Lucide 图标自动映射 |
| `src/icons/index.ts` | 新增 | 统一导出 |
| `src/components/AppIcon.vue` | 新增 | 统一图标渲染组件 |
| `src/composables/useIconTheme.ts` | 新增 | 图标主题状态管理 |
| `src/components/Sidebar.vue` | 修改 | 接入 AppIcon |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增图标风格设置 |
| `src/assets/icons/` | 新增目录 | 自定义 SVG 图标存放 |

## 验收标准

- [ ] `<AppIcon name="settings" />` 可正确渲染 Lucide 的 `Settings` 图标。
- [ ] 支持 `size="md"` 等预设尺寸，也支持 `size="32"` 自定义数值。
- [ ] 图标名支持字符串动态传入，TypeScript 提供 `IconName` 类型（含 Lucide + 自定义图标）。
- [ ] 切换 `iconTheme` 为 `filled` 后，已注册的图标自动渲染填充版本（若存在）。
- [ ] 自定义 SVG 放入 `src/assets/icons/` 后可通过 `<AppIcon name="custom-logo" />` 使用。
- [ ] 设置面板中可交互式切换图标风格并实时预览。
- [ ] 构建产物中未使用的图标被正确 Tree-shaking，不增加包体积。

## 优先级

P1

## 参考实现

- [unplugin-icons](https://github.com/unplugin/unplugin-icons)：按需加载 SVG 图标为 Vue 组件的 Vite 插件。
- [Iconify](https://iconify.design/)：统一图标框架，支持动态加载任意图标集。
- [Ant Design Icon](https://ant.design/components/icon-cn)：React 生态中「Icon 组件 + 字符串 name」的经典实现。
- [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next)：当前使用的图标库，保持兼容。
