# 动态语言包加载与翻译管理框架

## 功能背景/动机

当前脚手架的国际化（i18n）采用静态编译方式：所有语言包（zh-CN、en-US）在应用启动时全部加载到内存中。这种方式存在以下问题：
1. **包体积膨胀**：每增加一种语言，主包体积线性增长。对于支持 10+ 语言的桌面应用，这是不可接受的。
2. **无法运行时扩展**：开发者无法在应用发布后通过插件、用户自定义或远程更新方式新增语言包。
3. **翻译缺失处理粗糙**：fallback 仅支持整包回退，无法做到「字段级回退」或「标记未翻译项」。
4. **没有翻译管理工具**：开发者无法直观看到哪些 key 已翻译、哪些缺失，也无法在 UI 中高亮未翻译文本以便定位。

对于需要面向全球市场的桌面应用，提供一套**动态语言包加载与翻译管理框架**，是国际化能力从「可用」到「工程化」的关键跃升。

## 功能描述

构建一套**动态语言包加载与翻译管理框架**，包含：
1. **按需异步加载语言包**：利用 Vue I18n 的 `createI18n` + `setLocaleMessage` + `import()` 动态导入，切换语言时仅加载目标语言包，不打包未使用语言。
2. **字段级回退与缺失标记**：当某个 key 在当前语言中缺失时，先尝试 fallbackLocale 的对应 key，若仍缺失则显示 key 本身并可选地添加 `[!]` 标记或红色下划线（开发模式）。
3. **运行时语言包注册**：提供 `registerLocaleMessages(locale, messages)` API，允许插件、扩展或远程 JSON 在运行时注入新的翻译。
4. **翻译管理面板（DevTools）**：开发模式下，在页面边缘显示「翻译调试」悬浮窗，展示：
   - 当前页面所有 i18n key 列表及翻译状态（已翻译/缺失）。
   - 一键复制缺失 key 到剪贴板。
   - 点击任意文本可快速查看其对应的 i18n key。
5. **语言包热更新**：开发模式下监听 `locales/` 目录变化（通过 Electron 主进程 fs.watch），语言文件修改后自动重载，无需重启应用。
6. **日期/数字/相对时间本地化**：集成 `Intl.DateTimeFormat`、`Intl.NumberFormat`、`Intl.RelativeTimeFormat`，封装为 `useFormat()` composable，与当前 locale 自动联动。

## 目标用户

- **需要支持多语言的全球化产品团队**。
- **希望通过插件机制扩展语言支持的开发者**。
- **需要频繁调整翻译文案并实时预览的本地化工程师**。

## 详细设计

### 交互流程

1. **应用启动**：
   - `src/locales/index.ts` 中仅同步加载默认语言（如 zh-CN）作为基础包。
   - `availableLocales` 列表中包含所有支持语言的元信息（code、name、dir、localeFile）。
2. **切换语言**：
   - 用户选择「English」，`setLocale('en-US')` 被调用。
   - 系统执行 `await import(`@/locales/${locale}.ts`)`，获取语言包后通过 `i18n.global.setLocaleMessage('en-US', messages)` 注册。
   - 若加载失败（如文件不存在），自动回退到 fallbackLocale 并显示提示。
3. **插件注入语言包**：
   - 插件调用 `registerLocaleMessages('ja-JP', jaMessages)`，日语翻译立即生效。
4. **开发模式调试**：
   - 页面右下角出现「🌐 翻译调试」按钮，点击后展开侧边栏。
   - 侧边栏列出当前页面所有 `t('xxx')` 调用，缺失项标红。
   - 点击标红项可直接跳转到对应源码位置（通过 sourcemap 或编译时注入的 `__file` 信息）。

### 涉及的技术点

- **Vue I18n Lazy Loading**：利用 `import()` 实现语言包代码分割，配合 Vite 的 dynamic import 自动 chunk 化。
- **Message Format 兼容性**：保持 Vue I18n 的 `t()`、`tc()`（若需要复数）、`d()`、`n()` API，不与现有代码冲突。
- **Intl API 封装**：Vue I18n 本身支持 `d()` 和 `n()`，但可进一步封装 `useRelativeTime()`、`useCurrency()` 等更上层的组合式函数。
- **Electron fs.watch**：主进程监听语言文件变化，通过 IPC 通知渲染进程重新加载对应语言包。
- **翻译缺失检测**：自定义 Vue I18n 的 `missing` 处理器，记录所有缺失 key 到全局 Set 中供调试面板展示。

### 与现有架构的衔接方式

- **重构 `src/locales/index.ts`**：
  - 移除静态 import 所有语言包的方式。
  - 改为动态加载 + 默认语言同步引入。
  - 导出 `loadLocaleMessages(locale)`、`registerLocaleMessages(locale, messages)`、`setLocale(locale)`。
- **新增 `src/composables/useFormat.ts`**：
  - 封装 `formatDate`、`formatNumber`、`formatRelativeTime`、`formatCurrency`。
  - 自动读取当前 locale 和时区偏好。
- **新增 `src/composables/useLocaleDebug.ts`**（开发模式）：
  - 收集缺失 key、提供调试面板数据。
- **新增 `src/components/dev/LocaleDebugger.vue`**（开发模式）：
  - 翻译调试悬浮面板。
- **修改 `electron/main.ts`**：
  - 增加 `fs.watch` 监听 `locales/` 目录，文件变化时向渲染进程发送 `locale:changed` 事件。
- **修改 `electron/preload.cjs`**：
  - 暴露 `onLocaleChanged(callback)`。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 「语言」Tab 中的语言列表改为从 `availableLocales` 动态渲染。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/locales/index.ts` | 重构 | 动态加载语言包 |
| `src/locales/loader.ts` | 新增 | 语言包加载与注册逻辑 |
| `src/composables/useFormat.ts` | 新增 | Intl 格式化封装 |
| `src/composables/useLocaleDebug.ts` | 新增 | 翻译调试数据收集 |
| `src/components/dev/LocaleDebugger.vue` | 新增 | 翻译调试面板 |
| `electron/main.ts` | 修改 | locales 文件热重载监听 |
| `electron/preload.cjs` | 修改 | 暴露 locale changed API |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 语言设置接入动态加载 |

## 验收标准

- [ ] 应用主包仅包含默认语言，其他语言通过 `import()` 按需加载。
- [ ] 切换语言时界面无缝更新，无闪烁或空白期（加载期间可显示短暂 Loading）。
- [ ] 某个 key 缺失时，先 fallback 到 fallbackLocale，若仍缺失则显示 key 名并标记。
- [ ] 提供 `registerLocaleMessages()` API，支持运行时注入新语言包。
- [ ] `useFormat()` 支持日期、数字、相对时间、货币的本地化格式化，自动跟随当前 locale。
- [ ] 开发模式下，翻译调试面板可展示当前页面所有 i18n key 及缺失状态。
- [ ] 开发模式下，修改 `locales/` 中的语言文件后，应用自动重载对应语言，无需重启。

## 优先级

P1

## 参考实现

- [Vue I18n Lazy Loading](https://vue-i18n.intlify.dev/guide/advanced/lazy.html)：官方异步加载语言包文档。
- [FormatJS / React Intl](https://formatjs.io/)：国际化格式化标准库设计参考。
- [i18next](https://www.i18next.com/)：成熟的动态加载、插件化、缺失 key 处理方案。
- [Electron fs.watch](https://nodejs.org/api/fs.html#fswatchfilename-options-listener)：文件热重载基础 API。
