# 应用内通知中心（In-App Notification Center）

## 功能背景/动机

桌面应用需要向用户传达各类状态变更、操作反馈和系统事件。目前脚手架仅集成了 `vue-sonner` 提供基础的 Toast 弹窗，缺少一个完整的通知基础设施：通知的持久化存储、历史查阅、分类筛选、批量管理等功能。作为模板，提供通知中心能让下游开发者开箱即用，避免每个项目重复实现通知队列、状态管理和 UI 面板。

此外，Electron 应用可以同时使用系统原生通知（`Notification` API）和应用内通知中心，两者的协调策略也是桌面应用开发的常见痛点。本功能提供一套统一的抽象层。

## 功能描述

构建一套分层通知系统：

1. **Toast 通知层**：基于现有 `vue-sonner` 扩展，提供即时非阻塞反馈
2. **通知中心面板**：侧滑/下拉面板，展示历史通知列表，支持分类、筛选、标记已读、批量清除
3. **通知 Store**：Pinia 管理的通知状态，支持内存 + localStorage 持久化
4. **统一通知 API**：`notify()` 函数，自动决策使用系统通知还是应用内通知
5. **通知分类体系**：info / success / warning / error / system 五级分类，附带优先级和过期策略
6. **徽章/红点联动**：Sidebar 或 TitleBar 上的通知徽章与未读数实时同步

## 目标用户

- 需要向用户展示操作反馈的通用桌面应用开发者
- 需要系统通知与应用内通知协调管理的开发者
- 希望提供「消息中心」体验的协作类/工具类应用开发者

## 详细设计

### 交互流程

```
触发通知：
开发者调用 notify({ title, body, type, actions? }) 
  → 判断是否满足系统通知条件（权限 + 用户偏好 + 优先级）
  → 是：调用 electron Notification API
  → 否/同时：写入通知 Store → 触发 Toast → 更新徽章计数

用户查看通知：
点击 TitleBar 铃铛图标 / 或快捷键唤出通知中心
  → 侧滑面板展示通知列表（未读优先，按时间倒序）
  → 点击单条通知：跳转对应页面 / 执行 action / 标记已读
  → 支持一键全部已读 / 清除某分类 / 清除 7 天前通知

通知生命周期：
创建 → 展示(Toast + 可选系统通知) → 用户交互或自动过期 → 归档或删除
```

### 涉及的技术点

- **Electron 主进程**：`Notification` API 权限申请、系统通知展示、通知点击回调
- **渲染进程**：通知状态管理、通知中心 UI、Toast 触发
- **持久化**：IndexedDB / localStorage 存储历史通知（避免过度增长需设上限）
- **徽章计数**：与 Sidebar 组件联动，通过 Pinia store 同步
- **动画**：面板滑入滑出、通知项插入/删除动画（利用现有 StaggerList）

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `vue-sonner` | 保留作为 Toast 层，封装在 `notify()` 内部调用 `toast()` |
| `src/stores/app.ts` | 新增 `notification` store 或在 `app.ts` 中扩展通知相关状态 |
| `src/components/Sidebar.vue` | 底部设置按钮旁添加铃铛图标 + 未读徽章 |
| `src/components/ui/sheet/` | 复用 Sheet 组件作为通知中心面板容器 |
| `src/components/ui/badge/` | 复用 Badge 作为未读计数徽章 |
| `electron/main.ts` | 新增 `show-notification` IPC handler |
| `src/composables/useTheme.ts` | 通知中心面板需适配深浅主题（已自动支持） |

### 需要新增/修改的文件

**新增文件：**
- `src/stores/notification.ts` — 通知状态管理（列表、未读数、筛选条件、持久化）
- `src/composables/useNotification.ts` — 封装 `notify()`、`notifySystem()`、`useNotificationCenter()`
- `src/components/NotificationCenter.vue` — 通知中心面板（Sheet 内嵌通知列表）
- `src/components/NotificationItem.vue` — 单条通知卡片组件
- `src/components/NotificationBadge.vue` — 铃铛图标 + 未读徽章
- `src/types/notification.ts` — 通知相关类型定义

**修改文件：**
- `src/App.vue` — 在 header 区域集成 NotificationBadge
- `electron/main.ts` — 新增通知 IPC 处理和权限检查
- `electron/preload.cjs` — 暴露通知相关 API
- `src/locales/zh-CN.ts` / `src/locales/en-US.ts` — 添加通知相关 i18n key

### 核心数据结构

```typescript
// src/types/notification.ts
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationAction {
  label: string
  callback: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface AppNotification {
  id: string
  title: string
  body: string
  type: NotificationType
  priority: NotificationPriority
  read: boolean
  archived: boolean
  createdAt: number
  expiresAt?: number           // 过期时间戳，可选
  source?: string              // 来源模块标识
  actions?: NotificationAction[]
  route?: { path: string; query?: Record<string, string> }  // 点击跳转路由
}

export interface NotificationPreferences {
  enableSystemNotification: boolean
  enableSound: boolean
  desktopNotifyFor: NotificationType[]
  maxHistoryCount: number      // 默认 100
  autoArchiveDays: number      // 默认 7 天自动归档
}
```

### 关键实现策略

1. **系统通知权限**：首次调用时检查 `Notification.permission`，未授权时静默降级为仅应用内通知
2. **存储上限**：默认保留最近 100 条通知，超出时自动清除最早已读通知
3. **过期策略**：支持 `expiresAt` 字段，定时清理过期通知
4. **Toast 与通知中心分离**：Toast 是短暂提示，通知中心是持久历史；高优先级通知同时触发两者
5. **防抖聚合**：短时间内同类通知（如连续保存成功）自动聚合为一条

## 验收标准

- [ ] 提供 `notify()` 和 `notifySystem()` 两个 API，TypeScript 类型完备
- [ ] 通知中心面板从右侧滑出，展示所有通知，未读带高亮标识
- [ ] 支持按类型筛选（全部 / 未读 / info / success / warning / error / system）
- [ ] 支持一键标记全部已读、清除全部、清除某分类
- [ ] TitleBar / Sidebar 上的铃铛图标实时显示未读数量徽章
- [ ] 通知持久化到 localStorage，刷新页面后历史通知不丢失
- [ ] 系统通知在 macOS / Windows 上正常展示（需测试）
- [ ] 提供通知偏好设置模板（是否启用系统通知、声音、各类型通知策略）
- [ ] 通知列表支持虚拟滚动（当历史通知 > 50 条时自动启用）
- [ ] 包含至少 5 个使用示例（操作成功、操作失败、系统更新、网络断开、新消息提醒）

## 优先级

**P0** — 通知是桌面应用的基础能力，与现有 `vue-sonner` 和 UI 组件体系高度契合，实现成本适中但模板价值极高。

## 参考实现

- [GitHub Desktop Notification Center](https://docs.github.com/en/desktop/configuring-and-customizing-github-desktop/configuring-notifications-in-github-desktop)
- [VS Code Notification API](https://code.visualstudio.com/api/references/vscode-api#window.showInformationMessage)
- [Linear.app 通知中心设计](https://linear.app) — 简洁高效的通知面板交互
- [Notion 通知体验](https://www.notion.so) — 分类筛选和批量操作
