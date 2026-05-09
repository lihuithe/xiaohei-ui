# 面包屑与路径导航系统（Breadcrumb & Path Navigation System）

## 功能背景/动机

当前脚手架已包含一个基础的 `Breadcrumb.vue` 组件（基于 RouterStore 的 `breadcrumbs` 数组渲染简单的链接列表）和 shadcn-vue 的 `Breadcrumb` 组件族（`BreadcrumbList`、`BreadcrumbItem`、`BreadcrumbSeparator` 等）。但在桌面应用中，面包屑不仅仅是「首页 > 组件 > 详情」的静态展示，更是一个复杂的导航系统——用户期望通过面包屑快速返回上级、在同级页面间切换、编辑路径（如文件管理器的地址栏）、查看历史访问路径等。目前的实现过于简单，缺少这些桌面应用常见的路径导航模式。

## 功能描述

在现有 Breadcrumb 组件基础上，构建面向桌面应用的路径导航系统：

1. **动态面包屑（Dynamic Breadcrumb）**：面包屑项不仅来自路由配置，还支持运行时动态增删（如文件路径逐层深入时动态追加面包屑）
2. **面包屑下拉菜单（Breadcrumb Dropdown）**：某个面包屑项（如「项目」）有多个同级页面时，点击该项展示下拉菜单，支持同级切换
3. **可编辑路径栏（Editable Path Bar）**：类似文件资源管理器的地址栏，支持点击面包屑进入编辑模式，直接输入路径跳转
4. **历史路径导航（History Path Navigation）**：结合浏览器历史记录，支持面包屑展示「返回上级」和「历史前进/后退」快捷操作
5. **面包屑与页面标题联动（Breadcrumb-Title Sync）**：面包屑最后一项自动同步为当前页面标题，支持页面内动态修改标题时面包屑实时更新
6. **路径分隔符变体（Path Separator Variants）**：支持斜杠、箭头、 Chevron、自定义图标等多种分隔符风格

## 目标用户

- 构建文件管理器、项目管理、多层分类浏览等深度导航应用的开发者
- 需要支持用户在复杂层级结构中快速定位和切换的开发者
- 希望提供操作系统级路径栏体验的应用设计者

## 详细设计

### 交互流程

```
动态面包屑：
用户进入「/projects」→ 面包屑显示「首页 > 项目」
  → 用户点击进入「项目 A」→ 动态追加「项目 A」到面包屑：「首页 > 项目 > 项目 A」
  → 用户点击进入「任务列表」→ 动态追加：「首页 > 项目 > 项目 A > 任务」
  → 面包屑支持两种模式：
    → 路由模式：自动从 route.meta.breadcrumb 生成
    → 手动模式：开发者通过 `pushBreadcrumb()` / `popBreadcrumb()` API 动态控制
  → 点击任意中间项 → 跳转到对应页面 → 其后所有项自动移除

面包屑下拉菜单：
面包屑显示「首页 > 工作区 ▼ > 项目 A」
  → 用户点击「工作区 ▼」→ 下拉菜单展示所有可访问的工作区列表
    → 工作区 A（当前）
    → 工作区 B
    → 工作区 C
  → 用户选择「工作区 B」→ 跳转到工作区 B 首页 → 面包屑更新为「首页 > 工作区 B」
  → 下拉菜单支持搜索过滤（工作区数量多时分组展示）

可编辑路径栏：
用户双击面包屑区域 → 面包屑变为输入框，显示当前路径字符串（如 "/home/projects/a"）
  → 用户输入新路径 → 支持自动补全和历史路径建议（类似命令面板）
  → 按 Enter → 解析路径并跳转
  → 按 Escape → 取消编辑，恢复为面包屑展示
  → 输入无效路径 → 输入框边框变红 → 展示错误提示
  → 失去焦点且未修改 → 自动恢复为面包屑展示

历史路径导航：
面包屑左侧显示「← →」导航按钮（类似浏览器前进/后退）
  → 「←」可点击时高亮，不可点击时置灰
  → 点击「←」→ 返回上一级历史页面（router.back()）
  → 长按「←」→ 展示最近访问路径的下拉列表（类似浏览器历史）
  → 面包屑中的「首页」始终可点击，作为安全返回锚点

面包屑与标题联动：
页面标题设置为「项目 A - 设置」→ 面包屑最后一项自动变为「设置」
  → 页面内用户修改项目名称（如从「项目 A」改为「项目 A（已归档）」）
  → 面包屑对应项实时更新
  → 支持 `useBreadcrumbSync()` composable 监听标题变化自动同步
  → 支持覆盖：某些页面不希望面包屑最后一项等于标题（如只展示固定名称）

分隔符变体：
支持通过 `separator` prop 切换分隔符风格：
  → `slash`：首页 / 项目 / 详情（类 Unix 路径）
  → `chevron`：首页 > 项目 > 详情（默认，箭头）
  → `arrow`：首页 → 项目 → 详情（长箭头）
  → `dot`：首页 · 项目 · 详情（圆点）
  → `custom`：传入自定义图标组件
```

### 涉及的技术点

- **Vue Router 集成**：监听路由变化自动生成面包屑，支持 `route.meta.breadcrumb` 和动态 API 两种来源
- **Pinia Store 状态管理**：RouterStore 扩展面包屑操作 API（push/pop/replace/clear）
- **DropdownMenu 复用**：面包屑项的下拉菜单复用现有 DropdownMenu 组件
- **输入框与展示切换**：面包屑项在「文本展示」和「输入框编辑」两种模式间切换的焦点管理
- **历史栈管理**：结合 Vue Router 的 history stack 提供前进/后退能力

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/breadcrumb/` | 扩展 BreadcrumbItem 支持下拉菜单和编辑模式 |
| `src/components/ui/dropdown-menu/` | 面包屑下拉菜单的选项列表容器 |
| `src/components/ui/input/` | 可编辑路径栏的输入框组件 |
| `src/components/Breadcrumb.vue` | 重写/扩展为路径导航系统的主组件 |
| `src/router/index.ts` | 路由变化时自动更新面包屑 |
| `src/stores/router.ts` | 扩展面包屑状态管理 API |

### 需要新增/修改的文件

**新增文件：**
- `src/components/breadcrumb-patterns/PathBreadcrumb.vue` — 路径面包屑主组件（集成所有模式）
- `src/components/breadcrumb-patterns/BreadcrumbDropdown.vue` — 面包屑下拉菜单项组件
- `src/components/breadcrumb-patterns/EditableBreadcrumb.vue` — 可编辑路径栏组件
- `src/components/breadcrumb-patterns/BreadcrumbHistoryNav.vue` — 历史前进/后退导航组件
- `src/composables/useBreadcrumb.ts` — 面包屑操作 composable（push/pop/replace）
- `src/composables/useBreadcrumbSync.ts` — 面包屑与页面标题同步 composable
- `src/types/breadcrumb.ts` — 面包屑导航系统类型定义

**修改文件：**
- `src/components/Breadcrumb.vue` — 替换为基于新系统的实现（或标记为 deprecated）
- `src/stores/router.ts` — 扩展面包屑状态管理（动态增删、历史记录）
- `src/router/index.ts` — 路由守卫中增强面包屑动态生成逻辑

### 核心数据结构

```typescript
// src/types/breadcrumb.ts
export interface BreadcrumbItem {
  path: string
  title: string
  icon?: string
  isCurrent?: boolean
  dropdownItems?: BreadcrumbDropdownItem[]  // 同级可切换项
  editable?: boolean                        // 该项是否支持编辑
}

export interface BreadcrumbDropdownItem {
  path: string
  title: string
  icon?: string
  shortcut?: string
}

export interface BreadcrumbOptions {
  separator?: 'slash' | 'chevron' | 'arrow' | 'dot' | Component
  showHome?: boolean
  homePath?: string
  homeTitle?: string
  maxItems?: number             // 超过时折叠中间项为 "..."
  enableDropdown?: boolean
  enableEditing?: boolean
  enableHistoryNav?: boolean
  syncWithTitle?: boolean
}

export interface BreadcrumbHistoryEntry {
  path: string
  title: string
  timestamp: number
}
```

### 关键实现策略

1. **双模式数据源**：面包屑支持「路由驱动模式」（自动从 `route.meta.breadcrumb` 读取）和「手动控制模式」（开发者通过 `useBreadcrumb().push()` 动态管理）。两种模式可混合使用——基础层级来自路由，运行时追加来自 API
2. **折叠超长面包屑**：当面包屑项数超过 `maxItems`（默认 5）时，中间项折叠为「...」下拉菜单。例如：「首页 > ... > 祖父 > 父级 > 当前」点击「...」展开被隐藏的中间项
3. **可编辑路径栏的实现**：使用 `contenteditable` 或 Input 组件覆盖面包屑区域。进入编辑模式时：将面包屑项转换为路径字符串（如 `/projects/a/tasks`），用户编辑后按 Enter 解析字符串为面包屑项数组并尝试路由跳转。无效路径显示错误但不阻止继续编辑
4. **历史栈与 Router 集成**：利用 Vue Router 的 `history.state` 和 `router.options.history` 检测前进/后退可用性。长按前进/后退按钮展示最近 10 条历史记录的下拉列表
5. **标题同步机制**：提供 `useBreadcrumbSync(titleRef)` composable，组件挂载时将页面标题注册到同步系统，标题变化时自动更新面包屑最后一项。支持 `excludeFromSync` 标记跳过特定页面

## 验收标准

- [ ] 提供 `PathBreadcrumb` 组件，支持路由驱动和手动控制两种数据源模式
- [ ] 支持面包屑项下拉菜单，展示同级可切换页面列表
- [ ] 支持可编辑路径栏，双击/点击编辑进入路径输入模式，支持自动补全
- [ ] 提供历史前进/后退导航按钮，支持长按展示历史记录列表
- [ ] 面包屑最后一项支持与页面标题实时同步
- [ ] 支持多种分隔符变体（slash、chevron、arrow、dot、自定义）
- [ ] 超长面包屑自动折叠中间项为「...」下拉菜单
- [ ] 支持动态增删面包屑项（`pushBreadcrumb` / `popBreadcrumb` API）
- [ ] 点击面包屑中间项跳转后，其后所有项自动移除
- [ ] 包含至少 4 个使用示例（动态面包屑、下拉菜单、可编辑路径、历史导航）

## 优先级

**P1** — 面包屑导航是深度层级桌面应用的核心组件，与现有 Breadcrumb 和路由系统高度契合；路径栏模式能显著提升文件管理/项目管理类应用的体验。

## 参考实现

- [macOS Finder Path Bar](https://support.apple.com/guide/mac-help/mchlp2304/mac) — 可点击、可编辑的文件路径栏
- [Windows Explorer Address Bar](https://support.microsoft.com/windows) — 面包屑与路径编辑切换
- [VS Code Breadcrumbs](https://code.visualstudio.com/docs/editor/editingevolved#_breadcrumbs) — 符号级面包屑导航
- [Ant Design Breadcrumb](https://ant.design/components/breadcrumb) — 下拉菜单和分隔符变体
