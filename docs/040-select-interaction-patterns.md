# 选择交互模式系统（Select Interaction Patterns）

## 功能背景/动机

当前脚手架已包含 shadcn-vue 的 `Select`、`Combobox`、`TagsInput`、`RangeCalendar` 等选择类组件，但这些组件作为独立 primitive 存在，缺少面向桌面应用常见选择场景的**模式系统**设计。例如：多选下拉框需要「选中项标签展示 + 搜索过滤 + 全选/清空」的完整交互；级联选择需要层级联动和路径展示；日期范围选择需要开始/结束日期的智能联动和快捷预设。开发者每次都需要自行组装这些模式，导致选择交互的体验不一致。提供一套统一的选择交互模式系统，能确保所有选择类组件的交互符合桌面应用用户习惯。

## 功能描述

在现有 Select/Combobox/TagsInput/RangeCalendar 基础上，构建选择交互模式系统：

1. **多选搜索下拉框模式（Multi-select with Search）**：下拉框支持多选，选中项以标签形式展示在输入框内，支持关键词搜索过滤选项，支持全选/清空快捷操作
2. **级联选择模式（Cascading Select）**：多级关联选择（如省→市→区），选择上级自动联动下级选项，支持一次性选择完整路径和扁平化展示
3. **日期范围选择器模式（Date Range Picker）**：基于 RangeCalendar 封装，支持开始/结束日期智能联动（选择开始日后自动聚焦结束日），支持快捷预设（今天/本周/本月/最近7天）
4. **标签输入增强模式（Tags Input Enhanced）**：在现有 TagsInput 基础上增加从下拉选项创建标签、重复标签检测、标签拖拽排序、标签最大数量限制
5. **选择器状态反馈模式（Select State Feedback）**：选择器的加载中状态、空状态、错误状态、异步搜索状态的统一反馈设计

## 目标用户

- 需要构建复杂筛选器、配置表单、数据录入界面的开发者
- 需要级联地址选择、分类选择、权限选择等层级选择场景的开发者
- 希望统一应用中所有选择组件交互体验的开发者

## 详细设计

### 交互流程

```
多选搜索下拉框：
用户点击 Select 触发器 → 下拉面板展开
  → 面板顶部有搜索输入框（自动聚焦）
  → 用户输入关键词 → 实时过滤选项列表（防抖 150ms）
  → 选项列表显示匹配项，无匹配时展示「无结果」空状态
  → 用户勾选选项 → 选中项以 Tag 形式出现在触发器内
    → Tag 显示选项标签和删除按钮（×）
    → 选中项过多时显示「+3 更多」并在 Tooltip 中展示完整列表
  → 触发器内显示「已选 5 项」摘要文本
  → 面板底部显示操作栏：「全选」「清空已选」「确认」
  → 按 Escape → 关闭面板，保留已选状态
  → 按 Enter → 关闭面板，确认选择
  → 支持键盘导航：↑↓ 移动选择，Space 勾选/取消，Enter 关闭

级联选择：
用户点击级联选择器 → 展示第一级选项（省份）
  → 选择「浙江省」→ 自动展开第二级选项（城市）
    → 第二级面板在第一级右侧滑出（桌面端）或下方展开（窄屏）
  → 选择「杭州市」→ 自动展开第三级选项（区县）
  → 选择「西湖区」→ 触发器展示完整路径：「浙江省 / 杭州市 / 西湖区」
  → 点击路径中的任意一级 → 直接跳转到该级选择面板
  → 支持仅选到中间级（如只选到「杭州市」，不选区县）
  → 支持异步加载：选择省份后异步获取城市列表，加载时显示 Spinner

日期范围选择器：
用户点击日期范围输入框 → 弹出双面板日历（左侧开始日，右侧结束日）
  → 用户点击 3 月 1 日 → 开始日设为 3/1，自动高亮 3/1 之后的日期
  → 用户点击 3 月 10 日 → 结束日设为 3/10，中间日期区间高亮
  → 用户先点击 3 月 10 日（未选开始日）→ 智能识别为开始日 → 自动聚焦结束日选择
  → 面板顶部显示快捷预设：「今天」「昨天」「本周」「本月」「最近7天」「最近30天」
    → 点击预设 → 自动填充对应日期范围
  → 支持仅选单日（点击同一天两次）
  → 支持时间选择：展开时间输入框（可选）
  → 按 Escape → 取消选择，恢复原始值
  → 支持自定义禁用日期（如禁用周末、禁用过去日期）

标签输入增强：
用户在 TagsInput 中输入文本 → 按 Enter 或逗号 → 创建新标签
  → 输入时展示下拉建议列表（匹配已有标签或模板标签）
  → 选择建议项 → 直接添加为标签（而非创建重复文本）
  → 输入重复标签 → 输入框震动提示 + 红色边框
  → 标签数量达到上限（如 10 个）→ 输入框禁用，显示「最多 10 个标签」
  → 支持拖拽标签重新排序（与 034 拖拽模式共享 SortableJS）
  → 支持从外部数据源批量粘贴（如粘贴 "tag1, tag2, tag3" 自动拆分）
  → 每个标签支持独立的颜色/样式（如分类标签用不同颜色）

选择器状态反馈：
选项异步加载中 → 下拉面板展示 Skeleton 占位或 Spinner
  → 加载失败 → 展示错误状态（红色提示 + 重试按钮）
  → 无可用选项 → 展示空状态插画 + 「无选项」文本
  → 搜索无匹配 → 展示「无匹配结果」+ 「清空搜索」快捷链接
  → 异步搜索（如远程搜索用户）→ 输入时显示搜索中 Spinner
    → 搜索结果返回 → 展示匹配项
    → 搜索耗时较长 → 展示「搜索中...」提示，防止用户重复输入
```

### 涉及的技术点

- **多选状态管理**：`Set<string>` 存储选中 key，支持全选（取所有可用 key）、清空（清空 Set）、反选
- **级联数据路径计算**：递归遍历级联数据构建扁平化路径映射，支持从子节点回溯到根节点
- **日期范围智能识别**：选择第一个日期时记录，选择第二个日期时判断大小关系，自动确定起止
- **防抖搜索**：Combobox 搜索输入使用 `useDebounceFn`（150ms），异步搜索使用更长的防抖（300ms）
- **标签去重与验证**：`Set` 数据结构天然去重，配合正则拆分粘贴文本

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/select/` | 单选/多选下拉框的基础组件 |
| `src/components/ui/combobox/` | 可搜索下拉框的基础组件 |
| `src/components/ui/tags-input/` | 标签输入的基础组件 |
| `src/components/ui/range-calendar/` | 日期范围选择的基础组件 |
| `src/components/ui/calendar/` | 单日选择的基础组件 |
| `src/components/ui/badge/` | 多选选中项的 Tag 展示 |
| `src/components/ui/skeleton/` | 异步加载的占位状态 |
| `src/composables/useDebounce.ts` | 搜索输入防抖 |
| `src/composables/useSortable.ts`（034）| 标签拖拽排序 |

### 需要新增/修改的文件

**新增文件：**
- `src/components/select-patterns/MultiSelect.vue` — 多选搜索下拉框封装
- `src/components/select-patterns/CascadingSelect.vue` — 级联选择封装
- `src/components/select-patterns/DateRangePicker.vue` — 日期范围选择器封装
- `src/components/select-patterns/EnhancedTagsInput.vue` — 增强标签输入封装
- `src/components/select-patterns/SelectStateFeedback.vue` — 选择器状态反馈组件
- `src/composables/useMultiSelect.ts` — 多选逻辑 composable
- `src/composables/useCascadingSelect.ts` — 级联选择逻辑 composable
- `src/composables/useDateRange.ts` — 日期范围逻辑 composable
- `src/types/select-patterns.ts` — 选择交互模式类型定义

**修改文件：**
- `src/components/ui/combobox/ComboboxInput.vue` — 支持多选 Tag 内嵌展示
- `src/components/ui/tags-input/TagsInput.vue` — 支持下拉建议和拖拽排序

### 核心数据结构

```typescript
// src/types/select-patterns.ts
export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

export interface MultiSelectOptions {
  options: MultiSelectOption[]
  modelValue: string[]
  searchable?: boolean
  clearable?: boolean
  selectAll?: boolean
  maxDisplayTags?: number       // 触发器内最多展示的 Tag 数
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
}

export interface CascadingOption {
  value: string
  label: string
  children?: CascadingOption[]
  disabled?: boolean
  isLeaf?: boolean
}

export interface CascadingSelectOptions {
  options: CascadingOption[]
  modelValue: string[]          // 完整路径的 value 数组
  maxLevel?: number
  allowIncomplete?: boolean     // 是否允许选择到中间级
  lazyLoad?: (level: number, parentValue: string) => Promise<CascadingOption[]>
  separator?: string            // 默认 " / "
}

export interface DateRangePreset {
  label: string
  getValue: () => [Date, Date]
}

export interface DateRangePickerOptions {
  modelValue?: [Date | null, Date | null]
  presets?: DateRangePreset[]
  disabledDates?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  showTime?: boolean
  placeholder?: [string, string]
}

export interface EnhancedTagsInputOptions {
  modelValue: string[]
  suggestions?: string[]        // 建议标签列表
  maxTags?: number
  allowDuplicates?: boolean
  delimiter?: string | string[] // 默认 [',', 'Enter']
  draggable?: boolean
  tagColors?: Record<string, string>  // 标签颜色映射
}
```

### 关键实现策略

1. **多选 Tag 溢出处理**：触发器内展示最多 `maxDisplayTags`（默认 3）个 Tag，超出显示「+N 更多」。触发器宽度自适应，过窄时自动减少展示的 Tag 数量。Tag 使用 Badge 组件渲染，支持删除按钮
2. **级联面板布局**：桌面端采用横向级联面板（类似 Ant Design Cascader），每级一个垂直列表面板，逐级向右展开。面板宽度固定（如 160px），超出屏幕时整体向左偏移。窄屏模式下改为垂直堆叠展开
3. **日期范围智能纠错**：用户选择的第一个日期暂存为 `pendingDate`，选择第二个日期时与 `pendingDate` 比较：若第二个 > 第一个，则前者为开始、后者为结束；反之则交换。若再次点击已选日期，则清除该端点重新选择
4. **标签粘贴智能拆分**：监听 `paste` 事件，读取剪贴板文本，按常见分隔符（逗号、分号、换行、空格）拆分，批量添加有效标签。拆分前检测是否只有单个标签（无分隔符），避免误拆分
5. **异步搜索状态机**：选择器搜索有 4 种状态——idle（空闲）、typing（输入中）、loading（加载中）、done（完成）。输入时立即显示 typing 状态（透明度过渡），加载完成后过渡到 done。避免加载中显示空状态造成闪烁

## 验收标准

- [ ] 提供 `MultiSelect` 组件，支持多选、搜索过滤、Tag 展示、全选/清空
- [ ] 提供 `CascadingSelect` 组件，支持多级联动、异步加载、路径展示、可跳转到中间级
- [ ] 提供 `DateRangePicker` 组件，支持双面板日历、快捷预设、智能起止识别、禁用日期
- [ ] 提供 `EnhancedTagsInput` 组件，支持下拉建议、重复检测、拖拽排序、批量粘贴
- [ ] 提供统一的选择器状态反馈（加载中、空状态、错误、搜索中）
- [ ] 多选下拉框支持键盘导航（↑↓选择、Space勾选、Enter确认、Escape关闭）
- [ ] 级联选择支持键盘导航（→展开下级、←返回上级、↑↓同级移动、Enter选中）
- [ ] 日期范围选择支持仅选单日和快捷预设一键填充
- [ ] 标签输入支持最大数量限制和独立标签颜色
- [ ] 包含至少 5 个使用示例（多选、级联、日期范围、标签输入、状态反馈）

## 优先级

**P1** — 选择交互是表单和数据筛选的核心场景，与现有 Select/Combobox/TagsInput/RangeCalendar 高度契合；模式系统能显著提升复杂选择场景的开发效率和用户体验。

## 参考实现

- [Ant Design Select](https://ant.design/components/select) — 多选搜索、级联选择的交互标杆
- [Ant Design Cascader](https://ant.design/components/cascader) — 级联选择的展开策略和路径展示
- [Ant Design DatePicker](https://ant.design/components/date-picker) — 日期范围选择器的预设和联动
- [shadcn-vue Combobox](https://www.shadcn-vue.com/docs/components/combobox.html) — 可搜索下拉框基础
- [Notion Tag Input](https://www.notion.so/) — 标签创建和建议的交互参考
