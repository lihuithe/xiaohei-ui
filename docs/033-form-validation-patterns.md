# 表单验证与输入交互模式（Form Validation & Input Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Form`、`Field`、`Input`、`Select`、`Switch` 等表单组件，以及 `zod` 类型验证能力（通过 `vee-validate` 或 `@vee-validate/zod`）。但这些组件仅提供了「字段+验证」的原子能力，缺少面向桌面应用常见场景的**表单交互模式**——如表单分步向导（Wizard）、表单分组折叠（Sectioned Form）、实时校验反馈策略、字段联动（一个字段值影响另一个字段的可用性/选项）、批量验证与错误汇总等。在桌面应用中，用户期望表单具备即时反馈、智能联动和清晰的错误引导。提供一套完整的表单验证与输入交互模式，能让开发者快速构建专业级的数据录入界面。

## 功能描述

在现有 Form/Field 组件基础上，构建覆盖桌面应用常见表单场景的交互模式系统：

1. **实时校验反馈模式（Real-time Validation）**：定义不同校验触发策略（input/blur/submit），支持字段级即时错误提示和成功状态反馈
2. **表单分步向导（Form Wizard）**：将长表单拆分为多个步骤，每步独立验证，支持步骤跳转导航和进度指示
3. **表单分组折叠（Sectioned / Collapsible Form）**：将相关字段分组，支持分组展开/折叠，分组级验证状态指示
4. **字段联动模式（Field Dependencies）**：字段A的值变化自动影响字段B的可见性、禁用状态、可选项或验证规则
5. **批量验证与错误汇总（Batch Validation Summary）**：提交时一次性验证所有字段，顶部展示错误汇总面板，支持点击跳转到对应字段
6. **表单自动保存草稿（Auto-save Draft）**：表单内容定时自动保存到 localStorage，用户意外关闭后可恢复

## 目标用户

- 需要构建复杂数据录入界面的开发者（配置工具、管理后台、设置向导等）
- 希望减少表单样板代码、统一验证交互体验的开发者
- 需要分步引导用户完成复杂配置的应用设计者

## 详细设计

### 交互流程

```
实时校验反馈：
用户聚焦输入框 → 显示帮助文本（hint）
  → 用户输入（input 事件）→ 可选触发防抖验证（如搜索用户名是否已存在）
  → 用户移出焦点（blur 事件）→ 触发字段级验证
    → 验证失败 → 输入框边框变红 → 下方显示错误信息 → 输入框右侧显示错误图标
    → 验证通过 → 输入框边框变绿（可选）→ 右侧显示勾选图标
  → 用户点击提交 → 触发全表验证
    → 如有错误 → 第一个错误字段自动聚焦 → 滚动到该字段
    → 无错误 → 进入提交流程

表单分步向导：
用户进入「创建项目向导」→ WizardForm 展示 3 个步骤的 Stepper
  → 步骤1「基本信息」→ 填写项目名称、描述
    → 点击「下一步」→ 验证当前步骤所有字段 → 通过则进入步骤2
    → 未通过 → 错误字段高亮 → 步骤不推进
  → 步骤2「配置选项」→ 选择模板、设置权限
    → 可点击「上一步」回到步骤1修改（已填数据保留）
    → 可点击步骤指示器直接跳转到已访问过的步骤
  → 步骤3「确认信息」→ 展示前两个步骤的信息摘要
    → 点击「完成」→ 提交总数据 → 显示提交中状态
    → 提交成功 → 关闭向导 → 触发 onComplete
    → 提交失败 → 跳回出错步骤 → 展示错误

表单分组折叠：
长表单页面 → 字段按功能分为「基础设置」「高级选项」「通知配置」三个分组
  → 默认展开「基础设置」，折叠其余分组
  → 每个分组标题右侧显示：
    - 该分组内的字段验证状态（全部通过显示 ✓，有错误显示数字角标）
    - 展开/折叠箭头图标
  → 用户点击分组标题 → 平滑展开/折叠动画
  → 提交时验证所有分组（无论折叠与否）
  → 有错误的分组自动展开并滚动到第一个错误字段

字段联动：
表单中「通知方式」选择「邮件」→ 「邮件地址」字段变为必填且可见
  → 选择「短信」→ 「手机号」字段变为必填，「邮件地址」隐藏
  → 选择「不通知」→ 所有联系方式字段隐藏且不参与验证
  → 国家选择「中国」→ 手机号输入框的验证规则变为 11 位手机号正则
  → 国家选择「美国」→ 验证规则变为美国手机号格式
  → 联动变化时，被影响字段的值和验证状态自动重置

批量验证与错误汇总：
用户点击「保存所有设置」→ 触发表单提交
  → 发现 5 个字段有错误 → 表单顶部滑出 ValidationSummary 面板
    → 显示「发现 5 处错误，请修正后重试」
    → 列出所有错误：「用户名不能为空」「邮箱格式不正确」...
    → 每项错误可点击 → 自动滚动并聚焦到对应字段
  → 用户修正错误 → 错误汇总实时更新
  → 全部修正后 → 错误汇总面板自动收起 → 提交成功

自动保存草稿：
用户开始填写表单 → useFormAutoSave 启动定时器（如 5 秒）
  → 用户每输入一次 → 重置定时器 → 空闲 5 秒后自动序列化表单数据
  → 数据存入 localStorage（key: `form-draft:${formId}`）
  → 用户意外关闭应用 → 重新打开 → 检测到有草稿
    → 展示恢复提示：「检测到未提交的草稿，是否恢复？」
    → 用户点击「恢复」→ 表单回填草稿数据
    → 用户点击「丢弃」→ 清除草稿
  → 用户成功提交表单 → 自动清除草稿
```

### 涉及的技术点

- **表单状态管理**：vee-validate + zod 的 `useForm` / `useField` 封装
- **防抖验证**：对异步校验（如远程查重）使用 `useDebounceFn` 避免频繁请求
- **步骤数据隔离**：Wizard 的每步数据存储在独立对象中，最终合并提交
- **动画过渡**：分组折叠使用 CSS grid-template-rows 动画，错误汇总使用 slide-down 动画
- **字段依赖图**：构建字段依赖关系图（DAG），值变化时按拓扑顺序更新被影响字段
- **草稿序列化**：仅序列化表单值（非组件状态），恢复时重新运行验证

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/form/` | 复用 Form/FormItem/FormControl/FormMessage 进行字段级验证展示 |
| `src/components/ui/field/` | Field/FieldError/FieldDescription 作为字段包装器的替代/补充 |
| `src/components/ui/stepper/` | Wizard Form 的步骤导航组件 |
| `src/components/ui/collapsible/` | 表单分组折叠的展开/折叠容器 |
| `src/components/ui/alert/` | ValidationSummary 的错误汇总展示 |
| `src/components/ui/input/`、`select/`、`switch/` | 表单字段的基础输入组件 |
| `src/utils/storage.ts` | 自动保存草稿的 localStorage 读写 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/form-patterns/FormWizard.vue` — 表单分步向导组件
- `src/components/form-patterns/FormSection.vue` — 表单分组折叠组件
- `src/components/form-patterns/ValidationSummary.vue` — 批量错误汇总面板组件
- `src/components/form-patterns/DependentField.vue` — 联动字段包装组件
- `src/composables/useFormWizard.ts` — 表单向导逻辑 composable
- `src/composables/useFormAutoSave.ts` — 表单自动保存 composable
- `src/composables/useFieldDependency.ts` — 字段联动逻辑 composable
- `src/composables/useValidationStrategy.ts` — 校验策略配置 composable
- `src/types/form-patterns.ts` — 表单模式类型定义

**修改文件：**
- `src/components/ui/form/FormItem.vue` — 支持实时校验状态图标（success/error/loading）
- `src/components/ui/form/FormMessage.vue` — 支持多种错误展示样式（inline/banner/tooltip）

### 核心数据结构

```typescript
// src/types/form-patterns.ts
import type { ZodSchema } from 'zod'

export type ValidationTrigger = 'input' | 'blur' | 'change' | 'submit'

export interface ValidationStrategy {
  trigger: ValidationTrigger
  debounceMs?: number           // input 模式下的防抖毫秒
  validateOnMount?: boolean
}

export interface WizardStep<T = unknown> {
  id: string
  title: string
  description?: string
  schema: ZodSchema
  initialValues?: T
  validateOnNext?: boolean      // 点击下一步时是否验证
  skippable?: boolean
}

export interface FormSectionDef {
  id: string
  title: string
  icon?: string
  description?: string
  fields: string[]              // 该分组包含的字段名
  defaultCollapsed?: boolean
}

export interface FieldDependency {
  sourceField: string           // 依赖的源字段
  targetField: string           // 被影响的目标字段
  condition: (sourceValue: unknown) => boolean
  effects: {
    visible?: boolean
    disabled?: boolean
    required?: boolean
    options?: { label: string; value: unknown }[]
    resetValue?: unknown | (() => unknown)
  }
}

export interface AutoSaveOptions {
  formId: string
  intervalMs?: number           // 默认 5000
  storage?: 'localStorage' | 'sessionStorage'
  excludeFields?: string[]      // 不保存的敏感字段
}
```

### 关键实现策略

1. **校验策略可配置**：提供 `ValidationStrategy` 配置，开发者可选择不同场景的校验触发时机。例如搜索表单用 `input` + 300ms 防抖，设置表单用 `blur`，登录表单用 `submit`
2. **Wizard 数据合并**：每步的表单数据存储在 `stepsData[stepId]` 中，点击「完成」时合并为完整对象提交。步骤切换时保留已填数据，支持「返回修改」
3. **依赖关系自动收集**：`DependentField` 组件通过 `provide/inject` 向父级 Form 注册依赖关系，父级在源字段值变化时自动计算并应用 effects
4. **错误汇总实时更新**：ValidationSummary 订阅 vee-validate 的 `errors` 对象，任何字段错误变化时自动更新面板内容。面板支持 `sticky` 模式固定在表单顶部
5. **草稿恢复策略**：自动保存的草稿包含 `savedAt` 时间戳，恢复时对比表单 `createdAt`，仅恢复比表单创建时间更新的草稿，避免恢复过期数据

## 验收标准

- [ ] 提供 `FormWizard` 组件，支持多步骤表单，每步独立验证和导航
- [ ] 提供 `FormSection` 组件，支持分组折叠，显示分组级验证状态
- [ ] 提供 `ValidationSummary` 组件，支持批量错误汇总和点击跳转定位
- [ ] 提供 `DependentField` 组件/指令，支持字段联动（可见性/禁用/选项/验证规则）
- [ ] 提供 `useFormAutoSave()` composable，支持定时自动保存和草稿恢复
- [ ] 支持多种校验触发策略（input/blur/change/submit）和防抖配置
- [ ] 字段级验证支持即时错误提示、成功状态反馈、异步校验 loading 指示
- [ ] 提交时自动聚焦并滚动到第一个错误字段
- [ ] 表单向导支持步骤跳转、进度指示、数据隔离和合并提交
- [ ] 包含至少 5 个使用示例（实时校验、向导、分组折叠、字段联动、自动保存）

## 优先级

**P1** — 表单是桌面应用数据录入的核心场景，与现有 Form/Field/Stepper 组件高度契合；模式系统能显著减少开发者的表单样板代码，提升数据录入体验。

## 参考实现

- [VeeValidate](https://vee-validate.logaretm.com/v4/) — Vue 表单验证框架
- [Zod](https://zod.dev) — Schema 验证和类型推导
- [React Hook Form Wizard](https://react-hook-form.com/advanced-usage#wizardformfunnel) — 分步表单实现思路
- [Ant Design Form](https://ant.design/components/form) — 字段联动、校验反馈模式
- [GitHub Settings Forms](https://github.com/settings/profile) — 分组折叠和自动保存的交互参考
