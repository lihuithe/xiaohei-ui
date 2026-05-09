# 应用菜单模板（Application Menu Template）

## 功能背景/动机

桌面应用的原生菜单栏（macOS 的 Menu Bar、Windows/Linux 的 Menu Bar 或 Hamburger Menu）是用户发现和操作功能的核心入口。目前脚手架完全没有配置应用菜单，Electron 默认只展示一个极简的「Electron」菜单。作为模板，提供一套完整的应用菜单模板——包括文件、编辑、视图、窗口、帮助等标准菜单组——不仅能让应用看起来更像原生桌面应用，还能展示菜单与快捷键、命令面板、路由系统的联动方式。

此外，macOS 上应用菜单有特殊要求（如「关于」「偏好设置」「退出」必须在应用菜单下，遵循 HIG），Windows/Linux 则有不同的组织习惯。模板需要提供跨平台的菜单适配方案。

## 功能描述

构建可配置的应用菜单系统：

1. **标准菜单模板**：预置 File / Edit / View / Window / Help 五大菜单组，符合各平台惯例
2. **声明式菜单定义**：通过 JSON/对象数组定义菜单结构，自动适配 macOS（首个菜单为应用名）和 Windows/Linux
3. **菜单与命令联动**：菜单项的 action 复用 Command Palette 中注册的命令，避免重复定义
4. **动态菜单更新**：运行时可动态启用/禁用菜单项、更新标签（如「打开最近」子菜单）
5. **最近打开文件**：File 菜单中维护「最近打开」列表，点击可直接打开
6. **角色菜单项（Role）**：使用 Electron 内置 role（如 `undo`、`redo`、`copy`、`paste`）获得平台原生行为
7. **托盘菜单联动**：系统托盘的右键菜单与应用菜单共享定义数据源

## 目标用户

- 希望应用拥有原生桌面菜单体验的开发者
- 需要菜单与快捷键/命令面板联动的开发者
- 需要跨平台菜单适配的开发者

## 详细设计

### 交互流程

```
菜单定义：
开发者在 menu-config.ts 中声明菜单结构
  → 框架自动适配平台：macOS 插入 App Menu，Windows/Linux 合并到 File
  → 菜单项绑定到 CommandDef action 或 role

运行时更新：
用户执行「打开文件」→ 文件路径加入最近打开列表
  → 调用 MenuManager.updateRecentFiles([...paths])
  → File 菜单的「打开最近」子菜单动态刷新

菜单触发：
用户点击菜单项 → 如果绑定了 role → Electron 自动执行原生行为
  → 如果绑定了 action → 调用对应的 CommandDef action
  → 如果绑定了 route → 触发路由跳转
```

### 涉及的技术点

- **Electron Menu API**：`Menu.buildFromTemplate`、`Menu.setApplicationMenu`、`menu.popup`
- **角色（Role）**：`undo`、`redo`、`cut`、`copy`、`paste`、`selectAll`、`minimize`、`close`、`quit` 等
- **平台适配**：macOS 要求 `appMenu` 作为第一个菜单，包含 About/Preferences/Services/Hide/Quit
- **最近文档**：`app.addRecentDocument` / `app.clearRecentDocuments` + `recent-documents` role
- **动态更新**：通过 `Menu.getApplicationMenu()` 获取实例后修改具体 item

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `electron/main.ts` | 初始化应用菜单 |
| `src/composables/useCommandPalette.ts`（006）| 菜单项 action 复用 CommandDef |
| `src/composables/useShortcuts.ts`（001）| 菜单项 accelerator 复用快捷键绑定 |
| `electron/main.ts` 托盘菜单 | 托盘菜单复用 MenuManager 的部分菜单项 |
| `src/router/index.ts` | 菜单项可绑定路由跳转 |

### 需要新增/修改的文件

**新增文件：**
- `electron/menu/menu-manager.ts` — 菜单管理器（创建、更新、平台适配）
- `electron/menu/menu-config.ts` — 菜单结构声明式定义
- `electron/menu/menu-roles.ts` — 平台角色映射和辅助函数
- `src/composables/useRecentFiles.ts` — 最近文件管理 composable
- `src/types/menu.ts` — MenuItemDef、AppMenuConfig、MenuTemplate 类型

**修改文件：**
- `electron/main.ts` — 启动时调用 MenuManager 创建应用菜单
- `electron/main.ts` 托盘部分 — 托盘菜单通过 MenuManager 生成

### 核心数据结构

```typescript
// src/types/menu.ts
export type MenuItemRole = 
  | 'about' | 'quit' | 'hide' | 'hideOthers' | 'unhide'
  | 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'selectAll'
  | 'minimize' | 'close' | 'zoom' | 'front'
  | 'recentDocuments' | 'clearRecentDocuments'

export interface AppMenuItem {
  label?: string
  role?: MenuItemRole
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'
  accelerator?: string
  icon?: string                   // 仅部分平台支持
  enabled?: boolean
  visible?: boolean
  checked?: boolean               // checkbox/radio 用
  command?: string                // 关联的 CommandDef id
  route?: string                  // 绑定的路由路径
  action?: () => void             // 直接 action（不通过命令系统）
  submenu?: AppMenuItem[]
  when?: () => boolean            // 动态显示条件
}

export interface AppMenuConfig {
  id: string
  label: string
  items: AppMenuItem[]
}
```

### 关键实现策略

1. **macOS 适配**：第一个菜单自动设为应用名（`app.getName()`），包含 About、Preferences、Services、Hide、Hide Others、Show All、Quit，遵循 Apple HIG
2. **Windows/Linux 适配**：没有独立的 App Menu，About 和 Preferences 合并到 Help 和 File 菜单
3. **菜单项与命令复用**：菜单项通过 `command` 字段引用 CommandDef，MenuManager 自动查找对应 action 和 accelerator
4. **最近文件列表**：通过 `app.addRecentDocument(path)` 注册，菜单中使用 `recentDocuments` role 自动展示系统级最近文档（macOS/Windows 支持）
5. **开发模式菜单**：开发模式下自动添加「View > Toggle Developer Tools」「View > Reload」等调试菜单
6. **菜单状态同步**：当 CommandDef 的 `when` 条件变化时（如当前页面改变），自动刷新对应菜单项的 enabled 状态

### 示例菜单结构

```typescript
// electron/menu/menu-config.ts
export const menuConfig: AppMenuConfig[] = [
  {
    id: 'file',
    label: '文件',
    items: [
      { label: '新建项目', command: 'file.new-project', accelerator: 'Mod+Shift+N' },
      { label: '打开...', command: 'file.open', accelerator: 'Mod+O' },
      { type: 'separator' },
      { role: 'recentDocuments', label: '打开最近' },
      { role: 'clearRecentDocuments', label: '清除最近' },
      { type: 'separator' },
      { label: '关闭窗口', role: 'close', accelerator: 'Mod+W' },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    items: [
      { role: 'undo', accelerator: 'Mod+Z' },
      { role: 'redo', accelerator: 'Mod+Shift+Z' },
      { type: 'separator' },
      { role: 'cut', accelerator: 'Mod+X' },
      { role: 'copy', accelerator: 'Mod+C' },
      { role: 'paste', accelerator: 'Mod+V' },
      { role: 'selectAll', accelerator: 'Mod+A' },
    ],
  },
  {
    id: 'view',
    label: '视图',
    items: [
      { label: '命令面板', command: 'view.command-palette', accelerator: 'Mod+Shift+P' },
      { type: 'separator' },
      { label: '放大', command: 'view.zoom-in', accelerator: 'Mod+=' },
      { label: '缩小', command: 'view.zoom-out', accelerator: 'Mod+-' },
      { label: '重置缩放', command: 'view.zoom-reset', accelerator: 'Mod+0' },
    ],
  },
  {
    id: 'window',
    label: '窗口',
    items: [
      { role: 'minimize', accelerator: 'Mod+M' },
      { role: 'close', accelerator: 'Mod+W' },
    ],
  },
  {
    id: 'help',
    label: '帮助',
    items: [
      { label: '快捷键参考', command: 'help.shortcuts', accelerator: 'Mod+/' },
      { label: '查看日志', command: 'help.logs' },
      { type: 'separator' },
      { label: '关于', command: 'help.about' },
    ],
  },
]
```

## 验收标准

- [ ] macOS 上展示标准的应用菜单（App Menu + File + Edit + View + Window + Help）
- [ ] Windows/Linux 上展示适配的菜单结构（无独立 App Menu）
- [ ] 菜单项通过声明式配置定义，自动适配平台差异
- [ ] 菜单项可绑定到 CommandDef（命令面板）、role（原生行为）或 route（路由跳转）
- [ ] 支持运行时动态启用/禁用菜单项（如未选中内容时 Cut/Copy 禁用）
- [ ] File 菜单支持「最近打开」列表，可点击打开历史文件
- [ ] 开发模式下自动添加 Toggle DevTools / Reload 等调试菜单
- [ ] 系统托盘右键菜单复用部分菜单定义（如 Quit、Show Window）
- [ ] 菜单项的快捷键展示与全局快捷键系统（001）自动同步
- [ ] 提供完整的菜单配置文档和自定义示例

## 优先级

**P1** — 应用菜单是桌面应用的原生体验基础，实现成本较低（主要使用 Electron 原生 API），但对模板的专业度提升显著。

## 参考实现

- [Electron Menu API](https://www.electronjs.org/docs/latest/api/menu) — 官方菜单文档
- [macOS Human Interface Guidelines - Menus](https://developer.apple.com/design/human-interface-guidelines/menus) — macOS 菜单规范
- [VS Code Menu Contributions](https://code.visualstudio.com/api/references/contribution-points#menus) — 声明式菜单设计
- [GitHub Desktop Menu](https://github.com/desktop/desktop/blob/development/app/src/main-process/menu/build-default-menu.ts) — 跨平台菜单实现
- [Figma Desktop Menu](https://www.figma.com) — 设计工具的标准菜单结构
