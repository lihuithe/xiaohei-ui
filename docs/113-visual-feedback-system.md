# 视觉反馈系统（Toast、进度、Badge 策略统一）

## 功能背景/动机

当前脚手架已引入 `sonner`（Toast 通知）和 `Badge` 组件，但视觉反馈在「系统性」上仍有欠缺：
1. **Toast 使用不规范**：没有统一的成功/警告/错误/信息 Toast 调用规范，不同开发者可能写出样式不一致的提示。
2. **进度指示器碎片化**：`Progress.vue` 仅提供条形进度条，缺少圆形进度、步骤进度、不确定进度（indeterminate） spinner 等形态，且没有与异步操作联动的封装。
3. **Badge / 红点策略缺失**：没有统一的未读计数 Badge 样式规范，也没有「红点（Dot）vs 数字 vs 文字标签」的使用场景指引和组件封装。
4. **操作成功缺乏非 Toast 反馈**：如按钮点击后的对勾动画、表单保存后的微光闪烁等「即时确认」反馈缺失。

对于桌面应用，视觉反馈是**让用户感知系统正在响应**的核心手段。提供一套统一、完备、可配置的视觉反馈系统，能让基于此模板的应用拥有专业级的交互质感。

## 功能描述

构建一套**视觉反馈系统**，包含：
1. **统一 Toast 规范**：封装 `useToast()` composable，提供 `toast.success()`、`toast.error()`、`toast.warning()`、`toast.info()`、`toast.promise()` 等语义化 API，自动应用对应的图标、颜色、持续时间。
2. **进度指示器家族**：
   - `LinearProgress`：现有 Progress 的增强版，支持 determinate / indeterminate / buffer / query 等模式。
   - `CircularProgress`：圆形进度条，支持中间显示百分比或图标。
   - `StepProgress`：步骤进度指示器（如 1-2-3 步骤向导）。
   - `SkeletonPulse`：不确定加载的脉冲骨架（现有 Skeleton 的增强）。
   - `LoadingOverlay`：局部区域加载遮罩，带模糊背景和 Spinner。
3. **Badge 与红点策略组件**：
   - `Badge` 增强：支持 `count`（数字）、`dot`（纯红点）、`status`（状态文字，如「在线」「离线」）三种模式。
   - `NotificationDot`：独立的红点组件，支持动画（缩放弹出）、偏移定位（如附着在图标右上角）。
   - `BadgeGroup`：多个 Badge 的堆叠展示（如标签组）。
4. **操作成功微动画**：
   - `CheckAnimation`：对勾绘制动画（SVG stroke-dashoffset），用于按钮操作成功后的即时反馈。
   - `SaveIndicator`：保存状态的微型指示器（保存中 -> 已保存 -> 隐藏），常用于表单自动保存场景。
5. **反馈配置面板**：在设置中提供「通知偏好」区域，可配置：
   - Toast 显示位置（左上/右上/左下/右下/顶部居中）。
   - Toast 默认持续时间。
   - 是否启用操作成功微动画。

## 目标用户

- **需要一致反馈体验的产品团队**。
- **需要复杂异步操作进度展示的数据密集型应用开发者**。
- **追求「操作有回响」精致交互体验的独立开发者**。

## 详细设计

### 交互流程

1. **Toast 调用**：
   ```ts
   const { toast } = useToast()
   toast.success('设置已保存', { description: '您的更改已自动同步到云端' })
   toast.promise(saveData(), {
     loading: '保存中...',
     success: '保存成功',
     error: '保存失败，请重试',
   })
   ```
2. **进度展示**：
   - 文件上传场景：`<LinearProgress :value="uploadProgress" :show-label />`。
   - 不确定等待：`<CircularProgress indeterminate size="md" />`。
   - 向导表单：`<StepProgress :steps="['基本信息', '权限配置', '完成']" :current="1" />`。
3. **Badge 使用**：
   - 消息图标右上角：`<NotificationDot :count="3" />` 或 `<NotificationDot show />`（纯红点）。
   - 表格状态列：`<Badge variant="status" status="success">运行中</Badge>`。
4. **操作成功反馈**：
   - 用户点击「复制」按钮后，按钮内的文字瞬间变为对勾动画，1.5 秒后恢复。

### 涉及的技术点

- **Sonner 深度封装**：在现有 `sonner` 基础上封装类型安全、主题一致的 API。Sonner 已支持 `toast.promise` 和自定义 JSX，可直接利用。
- **SVG Stroke Animation**：`CheckAnimation` 利用 `stroke-dasharray` + `stroke-dashoffset` + CSS `@keyframes` 实现对勾绘制效果。
- **CSS Indeterminate Animation**：`LinearProgress` 和 `CircularProgress` 的 indeterminate 模式通过 CSS `@keyframes` 实现流光/旋转动画。
- **Position-aware Toast**：Sonner 支持 `position` prop，将其与用户配置绑定。
- **Vue Transition 组合**：Toast 进入/退出、Badge 弹出、NotificationDot 缩放均使用统一的缓动曲线（`--ease-out-back`）。

### 与现有架构的衔接方式

- **新增 `src/composables/useToast.ts`**：
  - 封装 Sonner 的调用，提供语义化方法。
  - 读取用户 Toast 偏好（位置、持续时间）。
- **修改 `src/components/ui/sonner/index.ts` 或 `Sonner.vue`**：
  - 接入主题色、暗色模式样式定制。
- **新增 `src/components/feedback/` 目录**：
  - `LinearProgress.vue`
  - `CircularProgress.vue`
  - `StepProgress.vue`
  - `LoadingOverlay.vue`
  - `CheckAnimation.vue`
  - `SaveIndicator.vue`
  - `NotificationDot.vue`
- **修改 `src/components/ui/badge/Badge.vue`**：
  - 扩展 props，支持 `count`、`dot`、`status` 模式。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 在「通知」Tab 中增加 Toast 位置、持续时间、微动画开关。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「反馈系统」演示区，展示所有 Toast、进度、Badge、微动画效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useToast.ts` | 新增 | Toast 语义化封装 |
| `src/components/feedback/LinearProgress.vue` | 新增 | 线性进度条增强 |
| `src/components/feedback/CircularProgress.vue` | 新增 | 圆形进度条 |
| `src/components/feedback/StepProgress.vue` | 新增 | 步骤进度 |
| `src/components/feedback/LoadingOverlay.vue` | 新增 | 局部加载遮罩 |
| `src/components/feedback/CheckAnimation.vue` | 新增 | 对勾绘制动画 |
| `src/components/feedback/SaveIndicator.vue` | 新增 | 保存状态指示器 |
| `src/components/feedback/NotificationDot.vue` | 新增 | 红点通知 |
| `src/components/ui/badge/Badge.vue` | 修改 | 扩展 count/dot/status |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 通知偏好设置 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增反馈系统演示区 |

## 验收标准

- [ ] `useToast()` 提供 `success/error/warning/info/promise` 五种语义化调用方式，样式与主题一致。
- [ ] Toast 位置可在设置中配置（四个角 + 顶部居中），实时生效。
- [ ] `LinearProgress` 支持 determinate/indeterminate/buffer 三种模式。
- [ ] `CircularProgress` 支持 determinate/indeterminate，可中间显示百分比。
- [ ] `StepProgress` 支持步骤标签、已完成/进行中/待办三种状态样式。
- [ ] `Badge` 支持数字徽标、纯红点、状态文字三种展示模式。
- [ ] `CheckAnimation` 可在按钮内播放对勾绘制动画，时长约 400ms。
- [ ] `SaveIndicator` 可展示「保存中... -> 已保存 -> 隐藏」的三态流转。
- [ ] ComponentPlayground 中可交互式预览所有反馈组件。

## 优先级

P1

## 参考实现

- [Sonner](https://sonner.emilkowal.ski/)：当前已集成的 Toast 库，其 `toast.promise` 和自定义样式是核心参考。
- [Material Design Progress Indicators](https://m3.material.io/components/progress-indicators/overview)：Google 进度指示器设计规范。
- [Ant Design Badge](https://ant.design/components/badge-cn)：徽标数的独立红点、数字、状态设计。
- [Chakra UI Circular Progress](https://v2.chakra-ui.com/docs/components/circular-progress)：圆形进度条实现参考。
