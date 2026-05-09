# 全局命令面板（Command Palette）

## 功能背景/动机

当前脚手架在 ComponentsPage 中实现了一个基于 `CommandDialog` 的组件搜索面板（`⌘K`），但它仅限于搜索组件，且与页面逻辑紧耦合。作为桌面应用模板，应当提供一套通用的 Command Palette 基础设施，让开发者可以注册任意命令（跳转页面、执行操作、切换设置等），并通过统一的搜索界面快速触达。这是现代专业桌面工具（VS Code、Figma、Notion、Raycast）的标配交互模式，能显著提升用户的操作效率和产品的专业感。

Command Palette 与「全局快捷键系统」形成互补：快捷键适合高频操作，Command Palette 适合低频但重要的操作，两者共享 action 注册表。

## 功能描述

将现有的组件搜索升级为全局命令面板系统：

1. **命令注册中心**：声明式注册命令，支持页面导航、执行函数、切换状态等多种命令类型
2. **统一入口**：`⌘K` / `⌘P` / `⌘Shift+P` 唤起，支持最近使用排序
3. **上下文感知**：根据当前页面/选区动态调整可用命令列表
4. **命令分组**：按类别分组展示（导航、操作、设置、最近使用）
5. **参数化命令**：支持需要用户输入参数的命令（如「跳转到行号」）
6. **模糊搜索**：基于 fuse.js 或自定义算法的命令名称/描述模糊匹配
7. **与快捷键联动**：命令列表中展示绑定的快捷键，支持从面板跳转到快捷键设置

## 目标用户

- 希望提供「专业级」键盘驱动交互的桌面应用开发者
- 应用功能较多、需要统一入口让用户快速发现能力的开发者
- 需要与全局快捷键系统联动的开发者

## 详细设计

### 交互流程

```
注册命令：
开发者调用 useCommandPalette().register({
  id: 'go-to-settings',
  title: '打开设置',
  subtitle: 'Preferences',
  group: '导航',
  shortcut: 'mod+,',
  action: () => router.push('/settings'),
  when: () => route.path !== '/settings'
})

唤出面板：
用户按 ⌘K → CommandPalette 组件显示 → 输入框聚焦
  → 输入关键词 → 实时过滤匹配命令
  → 上下箭头选择 → Enter 执行 → 面板关闭

参数化命令：
用户选择 "跳转到页面..." → 面板进入参数输入模式
  → 展示子命令列表（所有页面）→ 用户选择或输入 → 执行跳转
```

### 涉及的技术点

- **命令注册表**：基于 Map 的数据结构，支持动态注册/注销
- **模糊搜索**：fuse.js 轻量级模糊匹配，支持中文拼音（可选）
- **上下文过滤**：`when` 条件函数在每次唤出时求值
- **快捷键展示**：与全局快捷键系统共享数据，在命令项右侧展示绑定
- **最近使用**：localStorage 存储最近执行的 10 个命令，优先排序
- **动画过渡**：利用现有 CommandDialog 的打开/关闭动画

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/command/` | 直接复用并扩展为全局命令面板 |
| `src/composables/useShortcuts.ts`（001）| 共享命令定义，Command Palette 自动读取快捷键绑定 |
| `src/router/index.ts` | 导航类命令自动读取路由表生成 |
| `src/stores/app.ts` | 添加 `commandPaletteOpen` 状态 |
| `src/locales/` | 命令标题和描述支持 i18n |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useCommandPalette.ts` — 命令注册、搜索、执行的核心 composable
- `src/components/CommandPalette.vue` — 全局命令面板组件（扩展现有组件搜索）
- `src/types/command.ts` — CommandDef、CommandGroup、CommandContext 类型定义
- `src/utils/fuzzySearch.ts` — 模糊搜索工具（基于 fuse.js 或自研）

**修改文件：**
- `src/App.vue` — 在根组件挂载全局 CommandPalette，绑定 ⌘K 唤起
- `src/pages/ComponentsPage.vue` — 将原有组件搜索迁移到全局命令面板（或作为其中一个命令组）
- `src/router/index.ts` — 导出路由表供命令面板自动生成导航命令

### 核心数据结构

```typescript
// src/types/command.ts
export type CommandType = 'navigation' | 'action' | 'toggle' | 'recent'

export interface CommandDef {
  id: string
  title: string
  subtitle?: string              // 辅助描述，如 "Preferences > Appearance"
  group: string                  // 分组标识，如 "nav", "action", "settings"
  icon?: string                  // lucide icon name
  keywords?: string[]            // 额外搜索关键词
  shortcut?: string              // 绑定的快捷键，如 "mod+k"
  action: () => void | Promise<void>
  when?: () => boolean          // 上下文条件
  type?: CommandType
}

export interface CommandContext {
  route: string
  selection?: unknown
  focusedElement?: HTMLElement
}

export interface CommandPaletteOptions {
  placeholder?: string
  maxRecentCommands?: number
  enableFuzzySearch?: boolean
  groupsOrder?: string[]         // 分组展示顺序
}
```

### 关键实现策略

1. **与快捷键系统解耦但可联动**：命令面板不依赖快捷键系统独立工作，但如果快捷键系统存在（001 号功能），自动读取其绑定信息展示在命令旁
2. **路由命令自动生成**：扫描 `src/router/index.ts` 导出的路由表，自动为每个路由生成「跳转到 xxx」命令
3. **上下文懒过滤**：唤出面板时才执行所有 `when()` 条件，避免频繁求值
4. **参数化命令的子面板**：选择参数化命令后，面板内容切换为参数选择界面（如页面列表），支持 `Escape` 返回上级
5. **空状态引导**：无匹配命令时展示提示「尝试其他关键词」或「查看所有命令」

## 验收标准

- [ ] 任意页面按 `⌘K` / `⌘P` 可唤出全局命令面板
- [ ] 面板内支持模糊搜索命令标题、subtitle 和 keywords
- [ ] 命令按分组展示，支持分组折叠/展开
- [ ] 最近使用的命令自动置顶并显示「最近」标签
- [ ] 命令项右侧展示绑定的快捷键（如有）
- [ ] 支持上下文过滤，当前不可用的命令不显示
- [ ] 导航类命令自动从路由表生成，无需手动注册
- [ ] 选择命令后面板自动关闭，执行对应 action
- [ ] 支持参数化命令（如选择后进入子列表）
- [ ] 从命令面板可直接跳转快捷键设置页
- [ ] 包含至少 8 个预置命令示例（首页、组件、设置、主题切换、侧边栏折叠等）

## 优先级

**P1** — Command Palette 是专业桌面应用的标志性功能，与现有 `CommandDialog` 组件高度契合，实现成本较低但体验提升显著。

## 参考实现

- [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette) — 业界标杆
- [Raycast](https://www.raycast.com) — 现代命令面板交互设计
- [Notion Command Menu](https://www.notion.so) — 简洁的上下文感知命令
- [Figma Quick Actions](https://help.figma.com/hc/en-us/articles/360039281154-Quick-Actions) — 设计工具的快速操作面板
- [cmdk](https://cmdk.paco.me) — React 命令面板组件，交互设计参考
