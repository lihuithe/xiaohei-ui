# 右键菜单模板（Context Menu Template）

## 功能背景/动机

桌面应用的用户深度依赖右键菜单进行快捷操作。目前脚手架虽然包含了 shadcn-vue 的 `ContextMenu` 组件，但仅提供了底层 UI  primitive，没有针对桌面应用常见场景的右键菜单模板（如 Sidebar 项右键、列表项右键、文本选中右键、文件右键等）。开发者每次都需要重新组装菜单项、处理平台差异（macOS 右键行为与 Windows 的细微差别）、实现点击回调。提供一套预置的右键菜单模板和声明式配置 API，能让开发者通过「配置数组」快速生成符合平台习惯的右键菜单。

## 功能描述

提供一套面向桌面应用常见场景的右键菜单解决方案：

1. **声明式菜单定义**：通过 JSON 数组定义菜单项（label、icon、shortcut、action、separator、submenu）
2. **原生菜单降级**：支持两种模式——应用内自定义菜单（shadcn ContextMenu，美观可定制）和系统原生菜单（Electron `Menu.buildFromTemplate`，完全遵循平台习惯）
3. **场景化模板**：预置 Sidebar 项右键、列表项右键、文本区域右键、文件卡片右键等典型菜单模板
4. **条件渲染**：菜单项支持 `when` 条件，根据上下文动态显示/禁用
5. **快捷键展示**：菜单项右侧自动展示绑定的快捷键
6. **与命令面板联动**：右键菜单中的操作可复用 Command Palette 中注册的命令 action

## 目标用户

- 需要为列表/侧边栏/文本等元素添加快捷操作的开发者
- 希望右键菜单符合平台原生习惯（或选择自定义风格）的开发者
- 需要菜单项根据上下文动态变化的开发者

## 详细设计

### 交互流程

```
定义菜单：
开发者调用 useContextMenu({
  items: [
    { label: '打开', icon: 'ExternalLink', action: openItem, shortcut: 'Enter' },
    { label: '重命名', icon: 'Pencil', action: renameItem, shortcut: 'F2' },
    { type: 'separator' },
    { label: '删除', icon: 'Trash', action: deleteItem, shortcut: 'Mod+Backspace', danger: true }
  ]
})

应用内自定义模式：
用户右键目标元素 → 阻止默认浏览器菜单 → 在鼠标位置渲染 shadcn ContextMenu
  → 菜单项带图标和快捷键提示 → 点击执行 action → 菜单关闭

系统原生模式（主进程）：
用户右键目标元素 → 发送 IPC 到主进程 → 主进程调用 Menu.popup()
  → 展示系统原生右键菜单 → 点击回调通过 IPC 返回渲染进程
```

### 涉及的技术点

- **渲染进程**：shadcn ContextMenu 组件定位、右键事件捕获、坐标计算
- **主进程**：`Menu.buildFromTemplate` + `menu.popup({ window, x, y })`
- **动态定位**：菜单超出视口边界时的智能翻转（向下超出则向上展开）
- **平台差异**：macOS 右键菜单支持「Services」子菜单、Windows 支持图标大小差异

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/context-menu/` | 复用 shadcn ContextMenu 组件族作为应用内自定义菜单的基础 |
| `src/composables/useCommandPalette.ts`（006）| 菜单 action 复用 CommandDef 中的 action 定义 |
| `src/composables/useShortcuts.ts`（001）| 菜单项 shortcut 展示自动读取快捷键绑定 |
| `electron/main.ts` | 注册 `show-context-menu` IPC handler |
| `src/locales/` | 菜单项 label 支持 i18n key |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useContextMenu.ts` — 右键菜单核心 composable
- `src/components/ContextMenuProvider.vue` — 应用内自定义菜单的渲染容器
- `src/components/context-menus/SidebarItemMenu.ts` — Sidebar 项右键菜单模板
- `src/components/context-menus/ListItemMenu.ts` — 列表项右键菜单模板
- `src/components/context-menus/TextAreaMenu.ts` — 文本区域右键菜单模板
- `src/utils/context-menu.ts` — 菜单项过滤、坐标计算、平台适配
- `src/types/context-menu.ts` — MenuItemDef、ContextMenuOptions 类型

**修改文件：**
- `electron/main.ts` — 原生菜单模式的支持
- `electron/preload.cjs` — 暴露 `showNativeContextMenu` API
- `src/App.vue` — 根组件挂载 ContextMenuProvider

### 核心数据结构

```typescript
// src/types/context-menu.ts
export type MenuItemType = 'item' | 'separator' | 'submenu'

export interface MenuItemDef {
  type?: 'item'
  id?: string
  label: string
  icon?: string                   // lucide icon name
  shortcut?: string               // 展示用，如 "⌘C"
  action?: () => void | Promise<void>
  when?: () => boolean
  disabled?: boolean | (() => boolean)
  danger?: boolean                // 红色强调（如删除）
}

export interface MenuSeparatorDef {
  type: 'separator'
}

export interface MenuSubmenuDef {
  type: 'submenu'
  label: string
  icon?: string
  items: MenuItemDef[]
  when?: () => boolean
}

export type ContextMenuItem = MenuItemDef | MenuSeparatorDef | MenuSubmenuDef

export interface ContextMenuOptions {
  items: ContextMenuItem[]
  mode?: 'native' | 'custom'      // native = 系统菜单, custom = shadcn 组件
  x?: number
  y?: number
}
```

### 关键实现策略

1. **默认自定义模式**：开发模式下默认使用 shadcn ContextMenu（美观、可主题化）；生产环境可选切换为 native 模式
2. **坐标传递**：右键事件的 `clientX/clientY` 直接传给菜单定位，边界检测由组件内部处理
3. **Action 复用**：菜单项的 `action` 直接引用 Command Palette 或快捷键系统中注册的 action 函数，避免重复定义
4. **批量操作**：列表项右键支持「多选后右键」模式，菜单项根据选中数量动态变化（如单选显示「重命名」，多选显示「批量删除」）
5. **键盘导航**：自定义模式下支持 ↑↓ 选择、Enter 执行、Escape 关闭、→ 展开子菜单

## 验收标准

- [ ] 提供 `useContextMenu(items)` composable，支持一行代码为目标元素绑定右键菜单
- [ ] 支持「应用内自定义」和「系统原生」两种模式切换
- [ ] 预置至少 3 个场景模板（Sidebar 项、列表项、文本区域）
- [ ] 菜单项支持 `when` 条件动态显示/隐藏，`disabled` 动态禁用
- [ ] 菜单项右侧自动展示对应快捷键（与全局快捷键系统联动）
- [ ] 支持子菜单嵌套（submenu），支持分割线（separator）
- [ ] 危险操作（如删除）菜单项以红色高亮展示
- [ ] 菜单超出视口边界时自动翻转定位
- [ ] 自定义模式支持键盘导航（上下选择、Enter 执行、Esc 关闭）
- [ ] 包含与 Command Palette 命令复用的示例

## 优先级

**P1** — 右键菜单是桌面应用的高频交互，与现有 shadcn ContextMenu 组件高度契合；实现成本较低，模板价值高。

## 参考实现

- [VS Code Context Menus](https://code.visualstudio.com/api/references/contribution-points#menus) — 声明式菜单配置
- [GitHub Desktop Right-Click Menus](https://docs.github.com/en/desktop/making-changes-in-a-branch/managing-branches-in-github-desktop) — 桌面应用右键菜单
- [Radix Context Menu](https://www.radix-ui.com/primitives/docs/components/context-menu) — shadcn ContextMenu 的底层实现参考
- [Electron Menu.popup](https://www.electronjs.org/docs/latest/api/menu#menupopupoptions) — 原生菜单 API
