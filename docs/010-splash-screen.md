# 启动页与闪屏（Splash Screen & Launch Experience）

## 功能背景/动机

目前脚手架在应用启动时直接创建主窗口并加载内容，没有启动页（Splash Screen）或加载进度反馈。对于需要初始化较多资源（加载配置、建立数据库连接、检查更新、预热渲染进程）的桌面应用，用户可能面对数秒的白屏或黑屏，产生「应用卡住了」的负面感知。作为专业桌面应用模板，提供启动流程优化方案——包括闪屏窗口、加载进度展示、错误降级处理——能让下游开发者打造流畅的启动体验。

此外，Electron 应用的「首次启动」和「日常启动」应有不同的体验：首次启动可能需要引导页（Onboarding），日常启动则应尽可能快。本功能提供可配置的启动流程编排能力。

## 功能描述

构建可编排的启动流程：

1. **闪屏窗口（Splash Window）**：独立的小窗口，展示 Logo、应用名、加载进度条，主窗口准备完毕后自动关闭
2. **启动任务编排**：声明式定义启动阶段（如 init-config → check-update → load-cache → create-main-window），支持串行/并行执行
3. **加载进度反馈**：每个启动任务向闪屏窗口报告进度，用户可见启动状态
4. **启动错误处理**：某个任务失败时的降级策略（跳过、重试、终止并展示错误）
5. **首次启动引导**：检测是否首次运行，展示 Onboarding 向导（可选）
6. **启动性能计时**：记录各阶段耗时，开发模式下输出到 Console，用于优化启动速度

## 目标用户

- 应用启动需要初始化较多资源的开发者
- 希望打造品牌感启动体验的开发者
- 需要首次启动用户引导的开发者

## 详细设计

### 交互流程

```
应用启动（app.whenReady）：
创建 SplashWindow（400x300，无边框，居中，alwaysOnTop）
  → 启动任务队列开始执行：
     阶段1: init-config      [=====>    ] 20%
     阶段2: init-database    [=========>] 40%
     阶段3: check-update     [==========> ] 60%
     阶段4: load-locale      [=============> ] 80%
     阶段5: create-main      [================] 100%
  → 所有任务完成 → 关闭 SplashWindow → 显示 MainWindow
  → 若某任务失败 → 根据策略处理（重试/跳过/终止）

首次启动：
检测无用户配置 → 标记为首次启动 → 主窗口加载后展示 Onboarding 覆盖层
  → 引导用户完成基本设置（语言、主题、数据目录）
  → 完成后标记 onboarding 完成，下次不再展示

开发模式：
跳过 SplashWindow（或最小化显示）→ 直接创建主窗口并加载 DevTools
```

### 涉及的技术点

- **Electron 多窗口**：SplashWindow 和 MainWindow 的协调（先显示 Splash，完成后淡入 Main）
- **IPC 进度报告**：主进程任务 → 通过 IPC → SplashWindow 渲染进程更新进度条
- **任务编排**：基于 Promise 的任务队列，支持超时、重试、依赖关系
- **Onboarding UI**：基于现有 Dialog/Stepper 组件构建引导流程
- **性能计时**：`performance.now()` 记录每个阶段耗时

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `electron/window-manager.ts`（003）| SplashWindow 作为特殊 role 由 WindowManager 管理 |
| `src/components/ui/progress/` | 复用 Progress 组件作为闪屏进度条 |
| `src/components/ui/stepper/` | 复用 Stepper 组件构建 Onboarding 向导 |
| `src/components/ui/dialog/` | 复用 Dialog 作为启动错误提示 |
| `src/stores/app.ts` | 添加 `launchPhase` 和 `onboardingCompleted` 状态 |
| `electron/store/settings-store.ts`（005）| 读取配置判断是否为首次启动 |

### 需要新增/修改的文件

**新增文件：**
- `electron/windows/splash-window.ts` — SplashWindow 创建和更新逻辑
- `electron/launch/launch-manager.ts` — 启动任务编排器
- `electron/launch/tasks/` — 各启动任务实现（init-config、check-update 等）
- `src/pages/SplashPage.vue` — 闪屏窗口的渲染内容（Logo、进度条、状态文本）
- `src/components/OnboardingDialog.vue` — 首次启动引导对话框
- `src/composables/useLaunchPhase.ts` — 渲染进程获取启动阶段的 composable
- `src/types/launch.ts` — LaunchTask、LaunchPhase、LaunchErrorPolicy 类型

**修改文件：**
- `electron/main.ts` — 重写启动流程，先创建 SplashWindow 再执行启动任务
- `src/App.vue` — 应用挂载后检测是否需要展示 Onboarding
- `src/router/index.ts` — 添加 `/splash` 路由（闪屏窗口专用）

### 核心数据结构

```typescript
// src/types/launch.ts
export type LaunchPhase = 
  | 'idle' 
  | 'initializing' 
  | 'checking-updates' 
  | 'loading-cache' 
  | 'creating-window' 
  | 'ready' 
  | 'error'

export interface LaunchTask {
  id: string
  name: string                    // 展示名称
  weight: number                  // 进度权重（总进度 = 各任务 weight 之和）
  run: () => Promise<void>
  onError: 'abort' | 'skip' | 'retry'
  maxRetries?: number
  timeout?: number                // ms
  dependencies?: string[]         // 依赖的其他任务 id
}

export interface LaunchProgress {
  phase: LaunchPhase
  currentTask: string
  totalWeight: number
  completedWeight: number
  percentage: number
  errors: LaunchError[]
}

export interface LaunchError {
  taskId: string
  message: string
  timestamp: number
}
```

### 关键实现策略

1. **闪屏窗口生命周期**：SplashWindow `ready-to-show` 后淡入（opacity 0→1，300ms）；主窗口准备完毕后，SplashWindow 淡出关闭，同时主窗口淡入，形成无缝过渡
2. **任务并行化**：无依赖关系的任务并行执行（如 init-config 和 load-locale 可同时运行），减少总启动时间
3. **进度估算**：每个任务分配 weight，完成任务后累加 completedWeight，计算 percentage。对于未知耗时的异步任务，先展示「忙碌」动画，完成后跳转到该任务的终点进度
4. **错误降级**：init-config 失败可 abort（应用无法运行）；check-update 失败可 skip（不影响核心功能）
5. **Onboarding 条件**：不仅检测「是否首次启动」，也检测「配置版本是否过旧」（重大更新后重新引导）

## 验收标准

- [ ] 应用启动时先展示闪屏窗口，展示 Logo、应用名称和加载进度
- [ ] 各启动任务按依赖关系串行或并行执行，进度条平滑更新
- [ ] 主窗口准备完毕后，闪屏窗口优雅关闭，主窗口淡入显示
- [ ] 开发模式下可配置跳过闪屏或最小化显示
- [ ] 启动任务失败时根据配置策略处理（重试/跳过/终止）
- [ ] 终止时展示错误信息和建议操作（如重置配置、联系支持）
- [ ] 首次启动自动展示 Onboarding 向导，支持多步骤配置
- [ ] Onboarding 完成后状态持久化，下次启动不再展示
- [ ] 开发模式下 Console 输出各启动阶段耗时，便于性能优化
- [ ] 提供至少 3 个预置启动任务模板（配置初始化、更新检查、缓存加载）

## 优先级

**P1** — 启动体验直接影响用户对产品品质的第一印象；实现与现有 WindowManager（003）和 UI 组件配合良好，适合作为进阶模板能力。

## 参考实现

- [VS Code 启动流程](https://github.com/microsoft/vscode/tree/main/src/vs/code/electron-main) — 复杂的启动阶段管理
- [Figma Splash Screen](https://www.figma.com) — 简洁的品牌化闪屏
- [Linear.app 启动体验](https://linear.app) — 快速启动 + 首次引导
- [Postman Onboarding](https://www.postman.com) — 桌面应用的首次用户引导
- [electron-splashscreen](https://github.com/nuruzaman-milon/electron-splashscreen) — 社区闪屏实现参考
