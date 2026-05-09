# 步骤条与流程导航（Stepper & Flow Navigation）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Stepper` 基础组件（`StepperItem`、`StepperIndicator`、`StepperSeparator` 等），但该组件仅提供了步骤展示的 primitive 能力——显示步骤标题、描述、状态和连接线。在桌面应用中，步骤条是一个完整的流程导航系统，需要与业务逻辑深度结合：步骤验证、可点击回退、步骤内保存草稿、进度持久化、分支流程（条件步骤）、以及步骤条与页面内容的联动滚动。033 号「表单验证与输入交互模式」中的 Form Wizard 已经覆盖了对话框内的分步表单，但桌面应用还需要独立的、页面级的流程导航系统（如安装向导、 onboarding 流程、复杂配置向导）。提供一套完整的步骤条与流程导航模式，能填补页面级流程导航的空白。

## 功能描述

在现有 Stepper 组件基础上，构建面向桌面应用的页面级流程导航系统：

1. **可交互步骤条（Interactive Stepper）**：步骤支持点击跳转（仅限已访问过的步骤），步骤标题悬停显示详细描述，步骤状态支持未开始/进行中/已完成/错误/禁用
2. **步骤验证与守卫（Step Validation Guard）**：每个步骤可配置进入守卫（验证前置条件）和离开守卫（验证当前步骤数据），验证失败阻止步骤切换并提示错误
3. **步骤持久化与恢复（Step Persistence）**：流程进度自动保存到 localStorage，应用意外关闭后恢复到最后访问的步骤和已填数据
4. **分支流程支持（Branching Flow）**：根据用户在前面步骤的选择，动态显示/隐藏后续步骤（如选择「高级模式」后出现额外的配置步骤）
5. **步骤内容与导航联动（Step-Content Sync）**：步骤切换时内容区平滑滚动或淡入淡出动画，支持步骤锚点导航（URL hash 同步，如 `#step-2`）
6. **流程总结与预览（Flow Summary）**：最后一步展示前面所有步骤的数据摘要，支持点击某摘要项直接跳回对应步骤修改

## 目标用户

- 构建安装向导、 onboarding 流程、首次配置引导的开发者
- 需要复杂多步配置界面（如系统设置向导、项目初始化）的开发者
- 希望提供清晰进度感和可控感的应用设计者

## 详细设计

### 交互流程

```
可交互步骤条：
页面顶部展示水平步骤条：「基本信息 → 配置选项 → 确认信息 → 完成」
  → 当前在「配置选项」，该步骤高亮显示
  → 已完成步骤（「基本信息」）显示为绿色 ✓，可点击跳转回退
  → 未开始步骤（「确认信息」「完成」）置灰显示
  → 鼠标悬停已完成步骤 → 显示 Tooltip「点击返回此步骤」
  → 鼠标悬停当前步骤 → 显示该步骤的详细说明
  → 点击已完成步骤 → 询问「返回此步骤将丢失后续步骤的更改，是否继续？」
    → 确认后跳转 → 后续步骤标记为未开始
  → 错误状态：某步骤验证失败 → 该步骤指示器变红 → 显示错误图标

步骤验证与守卫：
用户从「基本信息」点击「下一步」→ 触发「基本信息」的离开守卫
  → 离开守卫验证：检查所有必填字段
    → 验证通过 → 允许离开 → 步骤标记为已完成 → 进入「配置选项」
    → 验证失败 → 阻止切换 → 错误字段高亮 → 步骤指示器变红
  → 用户直接点击「确认信息」（跳过「配置选项」）→ 触发进入守卫
    → 进入守卫检查：「配置选项」是否已完成
    → 未完成 → 阻止进入 → 自动聚焦到「配置选项」步骤
  → 支持异步守卫：如需要远程验证用户名是否可用

步骤持久化：
用户在「配置选项」填写数据 → 数据变化 3 秒后自动保存
  → 保存内容：{ currentStep: 2, stepsData: { step1: {...}, step2: {...} }, visitedSteps: [1, 2] }
  → 用户意外关闭应用 → 重新打开 → 检测到草稿
    → 展示恢复提示：「检测到未完成的配置流程，是否从第 2 步继续？」
    → 用户点击「继续」→ 恢复所有已填数据 → 步骤条恢复到保存状态
    → 用户点击「重新开始」→ 清除草稿，从头开始
  → 流程完成后 → 自动清除持久化数据

分支流程：
步骤条初始显示：「模式选择 → 基础配置 → 完成」
  → 用户在「模式选择」选择「高级模式」
  → 步骤条动态变化：「模式选择 → 基础配置 → 高级选项 → 网络配置 → 完成」
  → 选择「简单模式」→ 步骤条保持：「模式选择 → 基础配置 → 完成」
  → 分支切换时：如后续步骤已有数据 → 询问「切换模式将清除后续配置，是否继续？」
  → 支持条件步骤的显示/隐藏动画（淡入/淡出）
  → 总进度百分比根据可见步骤动态计算

步骤内容与导航联动：
桌面端宽屏 → 步骤条固定在页面顶部或左侧 Sidebar
  → 切换步骤 → 主内容区执行淡入淡出过渡动画（200ms）
  → 支持「滑动」过渡效果：下一步从左滑入，上一步从右滑入
  → URL 同步：进入第 2 步 → URL 更新为 `#step-2`
    → 用户刷新页面 → 根据 hash 自动定位到对应步骤
    → 用户点击浏览器前进/后退 → 步骤条和内容同步切换
  → 支持内容区内部锚点：某步骤内容过长 → 右侧显示子导航锚点
    → 滚动内容区 → 锚点自动高亮当前可见区块（Scroll Spy 联动）

流程总结与预览：
用户到达最后一步「确认信息」→ 页面展示前面所有步骤的数据摘要
  → 摘要按步骤分组展示：
    「基本信息」
      名称：xxx（点击可跳转回步骤1编辑）
      描述：xxx
    「配置选项」
      主题：深色（点击可跳转回步骤2编辑）
  → 点击摘要项旁的「编辑」图标 → 直接跳转到对应步骤的对应字段
  → 用户确认无误 → 点击「完成」→ 提交总数据 → 展示成功状态
  → 成功后可选择「返回修改」或「开始新流程」
```

### 涉及的技术点

- **状态机管理**：流程状态用有限状态机管理（idle → step1 → step2 → ... → completed），支持向前/向后/跳转
- **守卫模式**：进入/离开守卫使用 Promise，支持同步和异步验证
- **持久化策略**：使用 localStorage 存储流程状态，支持 `persistKey` 区分不同流程实例
- **动态步骤计算**：根据条件响应式计算可见步骤列表，进度百分比基于可见步骤计算
- **Vue Router hash 同步**：监听步骤变化更新 `window.location.hash`，监听 hashchange 更新步骤

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/stepper/` | 扩展 StepperItem 支持点击跳转和错误状态 |
| `src/components/ui/form/` | 每个步骤的表单验证复用 Form/Field 组件 |
| `src/components/ui/alert/` | 步骤切换被阻止时的错误提示 |
| `src/components/ui/tooltip/` | 步骤悬停提示 |
| `src/composables/useFormAutoSave.ts`（033）| 步骤数据自动保存 |
| `src/utils/storage.ts` | 流程进度持久化 |
| `src/router/index.ts` | URL hash 同步和路由守卫 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/stepper-patterns/FlowStepper.vue` — 流程步骤条封装（集成所有模式）
- `src/components/stepper-patterns/FlowContent.vue` — 流程内容容器（支持过渡动画）
- `src/components/stepper-patterns/FlowSummary.vue` — 流程总结预览组件
- `src/components/stepper-patterns/StepperGuard.vue` — 步骤守卫提示组件
- `src/composables/useFlow.ts` — 流程导航核心 composable（状态机、守卫、持久化）
- `src/composables/useFlowStep.ts` — 单步骤逻辑 composable
- `src/types/flow.ts` — 流程导航类型定义

**修改文件：**
- `src/components/ui/stepper/StepperItem.vue` — 支持点击、错误状态、禁用状态
- `src/components/ui/stepper/StepperIndicator.vue` — 支持错误图标和动画过渡

### 核心数据结构

```typescript
// src/types/flow.ts
export type StepStatus = 'idle' | 'active' | 'completed' | 'error' | 'disabled'

export interface FlowStep {
  id: string
  title: string
  description?: string
  icon?: string
  status?: StepStatus
  hidden?: boolean | Ref<boolean>     // 条件控制显示/隐藏
  validate?: () => boolean | Promise<boolean>  // 离开守卫
  canEnter?: () => boolean | Promise<boolean>   // 进入守卫
  component: Component
  data?: Record<string, unknown>
}

export interface FlowOptions {
  steps: FlowStep[]
  initialStep?: string
  persistKey?: string
  allowBackToCompleted?: boolean      // 是否允许回退到已完成步骤
  allowSkip?: boolean                 // 是否允许跳过步骤
  onComplete?: (flowData: Record<string, unknown>) => void | Promise<void>
  onStepChange?: (from: string, to: string) => void
}

export interface FlowState {
  currentStepId: string
  visitedSteps: string[]
  completedSteps: string[]
  stepsData: Record<string, Record<string, unknown>>
  isSubmitting: boolean
}

export interface FlowSummaryItem {
  stepId: string
  stepTitle: string
  fields: { label: string; value: string; fieldKey: string }[]
}
```

### 关键实现策略

1. **流程状态机**：使用 Pinia Store 或全局 reactive 对象管理流程状态。提供 `goNext()`、`goPrev()`、`goTo(stepId)` 三个导航方法，每个方法内部执行守卫检查 → 状态更新 → 持久化 → 触发回调的完整流程
2. **守卫链执行**：步骤切换时按顺序执行：当前步骤的 `validate()`（离开守卫）→ 目标步骤的 `canEnter()`（进入守卫）→ 两者都通过才执行切换。守卫返回 Promise 时显示 loading 状态，防止用户重复点击
3. **分支步骤动画**：使用 Vue `<TransitionGroup>` 实现步骤条的动态增删动画。隐藏步骤时淡出+宽度收缩，显示步骤时淡入+宽度展开。避免步骤条突然跳动造成的视觉不适
4. **URL hash 双向绑定**：`useFlow` 内部监听 `currentStepId` 变化，自动更新 `window.location.hash`。同时监听 `window.hashchange` 事件，用户点击浏览器前进/后退时同步切换步骤。注意避免循环更新
5. **摘要可跳转**：FlowSummary 组件接收 `stepsData` 和步骤定义，渲染每组数据。每个字段值旁显示编辑图标，点击时调用 `flow.goTo(stepId, { focusField: fieldKey })`，目标步骤组件通过 `onMounted` 或 `watch` 检测到 `focusField` 后自动聚焦到对应字段

## 验收标准

- [ ] 提供 `FlowStepper` 组件，支持步骤点击跳转（仅限已访问/已完成步骤）
- [ ] 支持步骤进入守卫和离开守卫，验证失败阻止切换并提示错误
- [ ] 支持流程进度自动持久化，意外关闭后可恢复到上次步骤和数据
- [ ] 支持分支流程，根据前面步骤选择动态显示/隐藏后续步骤
- [ ] 支持 URL hash 同步（`#step-2`），刷新和浏览器前进/后退同步步骤
- [ ] 步骤切换时内容区支持淡入淡出/滑动过渡动画
- [ ] 提供 `FlowSummary` 组件，展示所有步骤数据摘要，支持点击跳转回编辑
- [ ] 支持步骤错误状态指示（步骤指示器变红 + 错误图标）
- [ ] 提供 `useFlow()` composable，支持状态机管理、守卫、持久化、分支计算
- [ ] 包含至少 4 个使用示例（基础流程、带守卫流程、分支流程、持久化恢复）

## 优先级

**P1** — 流程导航是 onboarding、安装向导、复杂配置的核心模式，与现有 Stepper 组件高度契合；页面级流程导航与 033 的 Form Wizard（对话框内）形成互补，覆盖更多场景。

## 参考实现

- [Ant Design Steps](https://ant.design/components/steps) — 步骤条交互和状态展示
- [Vuetify Stepper](https://vuetifyjs.com/en/components/steppers/) — 可编辑步骤和验证守卫
- [Material Design Stepper](https://m3.material.io/components/steppers/overview) — 流程步骤的 Material 设计规范
- [Linear Onboarding](https://linear.app/) — 简洁的向导流程设计参考
- [GitHub Repo Creation Flow](https://github.com/new) — 分支步骤和摘要预览
