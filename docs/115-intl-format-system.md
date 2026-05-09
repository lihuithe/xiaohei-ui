# 国际化日期/数字/货币格式化系统

## 功能背景/动机

当前脚手架的 `src/utils/date.ts` 中仅包含少量简单的日期格式化函数（如 `formatDate`、`relativeTime`），存在以下问题：
1. **未使用原生 Intl API**：手写字符串拼接（如 `YYYY-MM-DD`）难以适配不同地区的日期格式习惯（如美式 `MM/DD/YYYY` vs 欧式 `DD/MM/YYYY` vs 日式 `YYYY/MM/DD`）。
2. **数字格式化缺失**：没有千分位分隔、小数位控制、百分比格式化的统一工具。
3. **货币格式化缺失**：桌面应用常涉及价格展示（如插件市场、付费功能），缺少基于 locale 的货币格式化能力。
4. **相对时间不精确**：手写「2分钟前」「1小时前」逻辑无法处理多语言复数形式和更复杂的语法差异（如阿拉伯语的复数规则）。
5. **与 i18n 割裂**：日期/数字格式化与 `vue-i18n` 的 locale 状态没有自动联动，开发者需要手动传入 locale。

提供一套基于 `Intl` API 的**国际化日期/数字/货币格式化系统**，能让基于此模板的应用天然具备全球化数据展示能力。

## 功能描述

构建一套**国际化日期/数字/货币格式化系统**，包含：
1. **useFormat Composable**：统一封装 `Intl.DateTimeFormat`、`Intl.NumberFormat`、`Intl.RelativeTimeFormat`、`Intl.ListFormat`、`Intl.PluralRules`，自动读取当前 `vue-i18n` 的 locale。
2. **日期格式化**：
   - 预设常用格式：`shortDate`、`longDate`、`shortDateTime`、`longDateTime`、`timeOnly`、`relative`。
   - 支持时区感知：通过 `useAppStore` 中的 `timezone` 偏好，或自动使用系统时区。
   - 支持日历偏好：公历（Gregorian）与部分地区的其他日历系统。
3. **数字格式化**：
   - `formatNumber(value, { decimals, notation })`：支持标准记数法、紧凑记数法（如 `1.2K`、`3.5M`）。
   - `formatPercent(value)`：百分比格式化。
   - `formatFileSize(bytes)`：自动选择 B/KB/MB/GB 并格式化。
4. **货币格式化**：
   - `formatCurrency(value, currency = 'CNY')`：基于 locale 和货币代码输出本地化货币字符串（如 `zh-CN + CNY -> ¥1,234.50`，`en-US + USD -> $1,234.50`）。
5. **列表与复数格式化**：
   - `formatList(items)`：将数组格式化为本地化列表字符串（如 en: "A, B, and C"；zh: "A、B和C"）。
   - `pluralize(count, singular, plural)`：基于 `Intl.PluralRules` 的复数形式选择。
6. **格式化预设面板**：在设置页中提供「区域格式」Tab，用户可选择：
   - 日期格式偏好（自动/YYYY-MM-DD/MM-DD-YYYY 等）。
   - 数字分组符号（自动/,/.）。
   - 时区选择（自动/UTC/具体城市）。

## 目标用户

- **需要展示日期、数字、货币的全球化应用开发者**。
- **需要适配不同地区数字习惯（如小数点符号、千分位符号）的产品**。
- **希望减少手写格式化逻辑、降低本地化 Bug 的开发者**。

## 详细设计

### 交互流程

1. 开发者在组件中使用 `useFormat()`：
   ```ts
   const { formatDate, formatNumber, formatCurrency, formatRelativeTime } = useFormat()
   
   formatDate(new Date()) // -> "2024年5月9日" (zh-CN) 或 "May 9, 2024" (en-US)
   formatNumber(1234567.89) // -> "1,234,567.89" (en-US) 或 "1.234.567,89" (de-DE)
   formatCurrency(99.9, 'USD') // -> "$99.90" (en-US) 或 "99.90 USD" (fr-FR)
   formatRelativeTime(-2, 'hour') // -> "2小时前" (zh-CN) 或 "2 hours ago" (en-US)
   ```
2. `useFormat()` 内部读取 `i18n.global.locale.value`，所有 `Intl.*Format` 实例基于此 locale 创建。
3. 用户进入「设置 > 区域格式」：
   - 选择时区为「东京」，所有时间展示自动切换为 JST。
   - 选择日期格式为「YYYY-MM-DD」，覆盖自动检测的 locale 默认格式。
4. 当 locale 切换时（如从 zh-CN 到 en-US），所有已格式化的值无需刷新页面，下次渲染自动更新。

### 涉及的技术点

- **Intl API 全家桶**：现代浏览器已原生支持 `Intl.DateTimeFormat`、`Intl.NumberFormat`、`Intl.RelativeTimeFormat`、`Intl.ListFormat`、`Intl.PluralRules`，无需额外依赖库。
- **时区处理**：`Intl.DateTimeFormat` 支持 `timeZone` 选项；时区列表可从 `Intl.supportedValuesOf('timeZone')` 获取（Chrome 89+）。
- **缓存机制**：`Intl.*Format` 实例创建有一定开销，可在 `useFormat()` 内部通过 `computed` + `new Intl.*Format(locale, options)` 缓存实例，locale 变化时重新创建。
- **与 vue-i18n 联动**：`useFormat()` 通过 `watch(i18n.global.locale, ...)` 或 `computed` 自动响应语言切换。
- **用户偏好持久化**：时区、日期格式偏好保存在 `localStorage` 或 Pinia store 中。

### 与现有架构的衔接方式

- **重构 `src/utils/date.ts` 为 `src/utils/format.ts`**：
  - 保留原有简单函数作为兼容层（或标记为 deprecated）。
  - 新增基于 Intl 的完整格式化函数集。
- **新增 `src/composables/useFormat.ts`**：
  - 封装所有 Intl 格式化能力，提供响应式 API。
  - 自动读取当前 locale 和用户格式偏好。
- **修改 `src/stores/app.ts`**：
  - 增加 `timezone`、`dateFormat`、`numberFormat` 等用户偏好字段，持久化到 localStorage。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「区域格式」Tab，集成时区选择、日期格式、数字格式设置。
- **修改 `src/locales/index.ts`**：
  - 确保 locale 切换时通知 `useFormat()` 重新创建 Intl 实例。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/utils/format.ts` | 新增/重构 | 基于 Intl 的格式化工具函数 |
| `src/composables/useFormat.ts` | 新增 | 响应式格式化 composable |
| `src/stores/app.ts` | 修改 | 增加区域格式偏好 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增区域格式设置 Tab |
| `src/utils/date.ts` | 重构/兼容 | 保留或迁移原有函数 |

## 验收标准

- [ ] `useFormat()` 提供 `formatDate`、`formatDateTime`、`formatTime`、`formatRelativeTime`、`formatNumber`、`formatPercent`、`formatCurrency`、`formatFileSize`、`formatList`、`pluralize` 等方法。
- [ ] 所有格式化方法自动跟随 `vue-i18n` 的当前 locale，切换语言后无需刷新。
- [ ] `formatDate` 支持 `short`、`long`、`full` 等预设，也支持自定义 `options`（如 `{ weekday: 'long', month: 'short' }`）。
- [ ] `formatCurrency` 支持主流货币代码（CNY、USD、EUR、JPY 等），输出符合当地习惯的格式。
- [ ] `formatRelativeTime` 正确支持多语言复数规则（如阿拉伯语的 zero/one/two/few/many/other）。
- [ ] 设置面板中可配置时区、日期格式、数字格式偏好，配置后全站实时生效。
- [ ] 原有使用 `date.ts` 的代码迁移后功能保持一致。

## 优先级

P1

## 参考实现

- [MDN Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)：原生国际化 API 权威文档。
- [Vue I18n Formatting](https://vue-i18n.intlify.dev/guide/essentials/number.html)：Vue I18n 对数字和日期的内置支持。
- [date-fns](https://date-fns.org/)：轻量级日期处理库，其 API 设计可作为 `useFormat()` 的接口参考。
- [ECMAScript Intl Locale Info](https://tc39.es/proposal-intl-locale-info/)：时区、日历系统等元数据标准提案。
