# 全局快捷键系统（Global Shortcuts System）

## 功能背景/动机

桌面应用区别于 Web 应用的核心特征之一是键盘驱动的高效交互。目前脚手架中只有一个硬编码的 `⌘K` 组件搜索快捷键，缺乏一套通用的快捷键注册、管理、冲突检测和提示面板机制。作为模板，提供完整的快捷键系统能让下游开发者快速实现类似 VS Code、Figma 等专业桌面工具的键盘操作体验，大幅提升开发者体验（DX）和最终用户体验。

## 功能描述

提供一套覆盖渲染进程和主进程的全局快捷键基础设施，包括：

1. **快捷键注册表**：声明式定义快捷键及其对应的 action
2. **作用域管理**：支持全局 / 页面级 / 组件级快捷键作用域
3. **快捷键提示面板（Cheatsheet）**：`?` 或 `⌘/` 唤起的快捷键速查面板
4. **冲突检测**：注册时自动检测快捷键冲突并给出警告
5. **可配置性**：支持用户自定义快捷键（存储在本地配置中）
6. **跨平台适配**：自动处理 macOS(`⌘`) 与 Windows/Linux(`Ctrl`) 的差异

## 目标用户

- 需要为桌面应用添加快捷键交互的中级开发者
- 希望提供「专业级」键盘操作体验的独立开发者
- 需要快捷键可配置能力的工具类应用开发者

## 详细设计

### 交互流程

```
开发者使用流程：
1. 在 composables/useShortcuts.ts 中定义 shortcuts 配置数组
2. 在组件中调用 useShortcuts() 注册当前作用域的快捷键
3. 用户按下组合键 → 系统匹配最高优先级的作用域 → 执行对应 action
4. 用户按 ⌘/ 或 ? → 唤起 Cheatsheet 面板展示所有可用快捷键
5. 用户在设置页修改快捷键 → 触发冲突检测 → 保存到本地存储

运行时流程：
按键事件 → KeybindingMatcher → 作用域过滤 → 冲突检测 → 执行 action → 阻止默认行为(可选)
```

### 涉及的技术点

- **渲染进程**：`keydown`/`keyup` 事件监听、组合键解析（modifier + key）、作用域栈管理
- **主进程**：`globalShortcut`（Electron API）用于真正的全局快捷键（如 app 未聚焦时）
- **存储**：Pinia + localStorage 存储用户自定义快捷键映射
- **UI**：基于现有 CommandDialog 组件扩展 Cheatsheet 面板

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/composables/useTheme.ts` | 参考其模式，创建 `useShortcuts.ts` |
| `src/stores/app.ts` | 扩展 store，添加 `shortcuts` 状态和 `shortcutOverrides` 持久化 |
| `src/components/ui/command/` | 复用 CommandDialog 作为 Cheatsheet 的 UI 基础 |
| `electron/main.ts` | 新增 IPC 通道 `register-global-shortcut` / `unregister-global-shortcut` |
| `electron/preload.cjs` | 暴露 `registerGlobalShortcut` / `unregisterGlobalShortcut` API |
| `src/locales/` | 添加快捷键相关 i18n key |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useShortcuts.ts` — 核心 composable，提供注册/注销/匹配能力
- `src/composables/useShortcutScope.ts` — 作用域管理
- `src/components/ShortcutCheatsheet.vue` — 快捷键速查面板
- `src/components/ShortcutInput.vue` — 设置页中用于录制快捷键的输入组件
- `src/utils/keybinding.ts` — 键值标准化、组合键序列化/反序列化、平台适配
- `src/types/shortcut.ts` — ShortcutDef、ShortcutScope、ShortcutAction 等类型定义

**修改文件：**
- `src/stores/app.ts` — 添加 shortcuts 相关状态
- `electron/main.ts` — 添加 globalShortcut IPC 处理
- `electron/preload.cjs` — 扩展 exposed API
- `src/App.vue` — 在应用根级别初始化全局快捷键监听

### 核心数据结构

```typescript
// src/types/shortcut.ts
export interface ShortcutDef {
  id: string                    // 唯一标识，如 'search.components'
  keybinding: string            // 如 'mod+shift+k', 'mod+k', '?'
  description: string           // 描述，支持 i18n key
  scope: 'global' | 'app' | 'page' | 'component'
  action: () => void | Promise<void>
  when?: () => boolean         // 条件判断，返回 false 时不生效
  preventDefault?: boolean
}

export interface ShortcutOverride {
  id: string
  keybinding: string | null     // null 表示禁用
}
```

### 关键实现策略

1. **键值标准化**：使用 `mod` 作为跨平台修饰符别名（macOS 映射为 Meta，Win/Linux 映射为 Ctrl）
2. **作用域栈**：采用栈结构管理作用域，后注册的同级作用域优先级更高
3. **主进程全局快捷键**：仅对「真正的全局快捷键」（如 `Cmd+Shift+X` 全局唤起）使用 Electron `globalShortcut`，其余在渲染进程处理以避免与系统冲突
4. **Cheatsheet 分组**：按作用域和页面分组展示，支持搜索过滤

## 验收标准

- [ ] 任意页面按下 `⌘/` 或 `?` 可唤出快捷键速查面板
- [ ] 面板内展示当前作用域下所有可用快捷键，按类别分组
- [ ] 面板支持搜索过滤（如输入 "theme" 筛选出主题相关快捷键）
- [ ] 开发者可通过 `useShortcuts([...defs])` 一行代码注册页面级快捷键
- [ ] 注册冲突快捷键时，控制台输出警告并提示冲突来源
- [ ] 设置页提供快捷键自定义界面，修改后即时生效并持久化
- [ ] 所有快捷键展示自动适配平台（macOS 显示 ⌘，Windows 显示 Ctrl）
- [ ] 提供完整的 TypeScript 类型定义和 JSDoc 注释
- [ ] 包含至少 3 个使用示例（全局搜索、主题切换、侧边栏折叠）

## 优先级

**P0** — 桌面应用的基础交互能力，对模板价值提升显著，且与现有架构高度兼容。

## 参考实现

- [VS Code Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings)
- [GitHub Desktop 快捷键系统](https://docs.github.com/en/desktop/getting-started-with-github-desktop/keyboard-shortcuts)
- [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook) — React 生态的参考思路
- [mousetrap](https://github.com/ccampbell/mousetrap) — 轻量级快捷键库的设计哲学
