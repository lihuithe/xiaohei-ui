# 多语言扩展框架增强（i18n Enhancement）

## 功能背景/动机

当前脚手架已集成 `vue-i18n`，提供了基础的中英文切换能力。但作为面向开发者的模板，现有的国际化实现过于简单——仅支持两个硬编码语言文件，没有语言动态加载、复数规则、日期/数字本地化、RTL（从右到左）布局支持等现代国际化框架应具备的能力。下游开发者如果要做多语言应用，需要自行解决语言包按需加载、翻译缺失回退、界面文本提取等通用问题。提供一套增强的国际化模板，能显著降低多语言应用的开发门槛。

## 功能描述

在现有 `vue-i18n` 基础上扩展以下能力：

1. **语言包动态加载**：按需异步加载语言文件，避免一次性打包所有语言
2. **翻译缺失检测**：开发模式下自动检测缺失的翻译 key，Console 输出警告
3. **日期/数字/相对时间本地化**：基于 `Intl.DateTimeFormat`、`Intl.NumberFormat`、`Intl.RelativeTimeFormat` 的封装
4. **复数规则支持**：正确的中英文复数处理，以及阿拉伯语、俄语等复杂复数规则的框架支持
5. **RTL 布局适配**：检测 RTL 语言（阿拉伯语、希伯来语等），自动翻转布局方向
6. **语言切换过渡**：切换语言时界面文字平滑过渡，避免闪烁
7. **翻译管理工具**：提供脚本扫描源码中的 `t('xxx')` 调用，自动生成/更新语言文件

## 目标用户

- 需要支持多种语言的桌面应用开发者
- 需要日期、数字、货币本地化的国际化应用开发者
- 需要 RTL 语言支持的全球化应用开发者

## 详细设计

### 交互流程

```
动态加载语言：
用户切换语言到 Deutsch → vue-i18n 加载 `src/locales/de-DE.ts`
  → 若文件不存在 → 尝试从 `public/locales/de-DE.json` 异步加载
  → 加载成功后切换 locale → UI 文字更新
  → 同时更新 document.dir（LTR/RTL）和 html lang 属性

开发模式缺失检测：
组件渲染时调用 t('nav.settings') → vue-i18n 找不到对应翻译
  → 开发模式：Console 输出 [i18n] Missing translation: "nav.settings" for locale "en-US"
  → 生产模式：静默回退到 fallbackLocale

日期本地化：
const { formatDate } = useLocale()
formatDate(new Date(), { dateStyle: 'long' })
  // zh-CN: "2024年1月15日"
  // en-US: "January 15, 2024"
  // de-DE: "15. Januar 2024"

数字本地化：
const { formatNumber } = useLocale()
formatNumber(1234567.89, { style: 'currency', currency: 'EUR' })
  // de-DE: "1.234.567,89 €"

RTL 切换：
用户选择 العربية → document.documentElement.dir = 'rtl'
  → Sidebar 从左侧移到右侧
  → 文本对齐方式自动调整
  → margin/padding 逻辑属性自动适配（或使用 CSS logical properties）
```

### 涉及的技术点

- **vue-i18n 高级特性**：`loadLocaleMessages`、`setLocaleMessage`、`datetimeFormats`、`numberFormats`
- **Intl API**：`Intl.DateTimeFormat`、`Intl.NumberFormat`、`Intl.RelativeTimeFormat`、`Intl.ListFormat`
- **RTL 检测**：基于语言代码判断（ar、he、fa、ur 等为 RTL）
- **CSS 逻辑属性**：`margin-inline-start` 替代 `margin-left`，`text-align: start` 替代 `left`
- **AST 扫描**：使用 `@babel/parser` 或 `typescript` API 扫描 `.vue` 和 `.ts` 文件中的 `t()` 调用

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/locales/index.ts` | 扩展为支持动态加载和 RTL 检测 |
| `src/locales/zh-CN.ts`、`en-US.ts` | 保留，添加 datetimeFormats 和 numberFormats |
| `src/composables/useTheme.ts` | 语言切换时同步更新 document.dir |
| `src/components/Sidebar.vue` | 通过 CSS logical properties 支持 RTL 布局翻转 |
| `src/utils/date.ts` | 迁移为基于 `useLocale` 的国际化日期格式化 |
| `src/utils/format.ts` | 迁移为基于 `useLocale` 的国际化数字/货币格式化 |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useLocale.ts` — 国际化高级封装（日期、数字、RTL、列表格式化）
- `src/composables/useTranslation.ts` — 增强版翻译 composable（含缺失检测）
- `src/utils/i18n-scanner.ts` — 翻译 key 扫描脚本（Node.js 脚本）
- `src/utils/rtl-languages.ts` — RTL 语言代码列表和检测函数
- `src/types/i18n.ts` — LocaleConfig、DateTimeFormatOptions、NumberFormatOptions 类型

**修改文件：**
- `src/locales/index.ts` — 扩展动态加载、缺失检测、RTL 支持
- `src/locales/zh-CN.ts`、`en-US.ts` — 添加 datetime/number 格式配置
- `src/main.ts` — 初始化时检测 RTL 并设置 document.dir
- `src/App.vue` — 根元素使用 CSS logical properties 或动态 class 适配 RTL
- `package.json` scripts — 添加 `i18n:scan` 脚本

### 核心数据结构

```typescript
// src/types/i18n.ts
export interface LocaleConfig {
  code: string
  name: string
  nativeName: string
  dir: 'ltr' | 'rtl'
  flag?: string
  dateFormat: Intl.DateTimeFormatOptions
  numberFormat: Intl.NumberFormatOptions
  relativeTimeFormat: Intl.RelativeTimeFormatOptions
}

export interface I18nPreferences {
  locale: string
  fallbackLocale: string
  availableLocales: LocaleConfig[]
}

export interface TranslationMissingReport {
  key: string
  locale: string
  component?: string
  file?: string
  line?: number
}
```

### 关键实现策略

1. **按需加载**：语言文件按 `locales/[locale].json` 放在 `public/` 目录，切换时通过 `fetch` 动态加载，减少主包体积
2. **内置语言 + 外部语言**：zh-CN、en-US 作为内置语言直接 import，其他语言按需加载
3. **缺失检测开发插件**：创建一个 Vue 自定义插件，拦截 `$t` 调用，开发模式下收集缺失 key 并输出到 Console 和文件
4. **RTL CSS 策略**：基础方案是使用 CSS logical properties（`inline-start`、`block-start`）；兼容方案是为 `html[dir="rtl"]` 添加镜像样式
5. **语言切换动画**：切换 locale 时，给 `body` 添加 `opacity: 0` 过渡 100ms，切换完成后再淡入，避免文字突变
6. **扫描脚本**：`pnpm i18n:scan` 扫描所有 `.vue` 和 `.ts` 文件，提取 `t('xxx')` 和 `$t('xxx')` 中的 key，对比语言文件输出缺失列表

## 验收标准

- [ ] 支持至少 3 种内置语言（zh-CN、en-US、ja-JP），其他语言可动态加载
- [ ] 语言切换时异步加载语言包，切换完成后 UI 平滑过渡
- [ ] 开发模式下自动检测缺失翻译并输出到 Console，可选生成报告文件
- [ ] 提供 `useLocale()` composable，封装日期、数字、货币、相对时间的本地化格式化
- [ ] 切换至 RTL 语言时，document.dir 自动更新，Sidebar 和布局自动翻转
- [ ] 所有布局使用 CSS logical properties 或 rtl-aware class，无需为每种 RTL 语言写单独样式
- [ ] 复数规则正确处理（英文 1 apple / 2 apples，中文无变化）
- [ ] 提供 `pnpm i18n:scan` 脚本，自动扫描源码提取翻译 key 并检测缺失
- [ ] 语言偏好持久化到本地存储，重启后恢复
- [ ] 包含完整的国际化最佳实践文档和添加新语言的步骤指南

## 优先级

**P2** — 现有 vue-i18n 已满足基础需求，增强版属于进阶能力；但国际化是现代应用的标配，模板提供完整方案能显著降低开发者成本。

## 参考实现

- [vue-i18n Documentation](https://vue-i18n.intlify.dev/) — 官方高级特性文档
- [Intl API MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) — 浏览器原生国际化 API
- [React-i18next RTL Guide](https://react.i18next.com/latest/rtl-languages) — RTL 实现参考
- [Notion Localization](https://www.notion.so) — 桌面应用的多语言切换体验
- [Figma RTL Support](https://help.figma.com/hc/en-us/articles/360039382634-RTL-Languages-in-Figma) — 设计工具的 RTL 适配
