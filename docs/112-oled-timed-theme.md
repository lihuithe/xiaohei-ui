# OLED 纯黑模式与定时主题切换

## 功能背景/动机

当前脚手架的深色模式使用 `oklch(0.145 0 0)` 作为背景色，这是一种深灰色而非纯黑。对于配备 OLED 屏幕的设备（如 MacBook Pro、高端 Windows 笔记本、外接 OLED 显示器），纯黑背景（`#000000`）可以带来：
1. **更低的功耗**：OLED 像素自发光，黑色像素完全关闭。
2. **更高的对比度**：纯黑背景让文字和色彩更「弹出」。
3. **更沉浸的夜间体验**：减少屏幕光晕，降低眼疲劳。

此外，许多现代应用（如 Apple Maps、Twitter/X、Telegram）支持**根据时间自动切换主题**（如日落时自动进入深色模式，日出时恢复浅色）。当前脚手架虽然支持 `system` 模式，但缺少基于地理位置日出日落时间或固定时间表的自动切换能力。

提供 **OLED 纯黑模式与定时主题切换**，是深色模式体验的进阶能力，也是展示模板「贴心细节」的亮点。

## 功能描述

构建一套 **OLED 纯黑模式与定时主题切换** 系统，包含：
1. **OLED Black 主题**：新增一种 `oled` 主题模式，在深色模式基础上将背景色、卡片色、侧边栏色等进一步压低至纯黑或接近纯黑，同时调整边框和阴影确保层次可辨。
2. **定时主题切换器**：
   - **日出日落模式**：基于用户地理位置或时区，自动计算当地日出日落时间，在日落时进入深色/OLED 模式，日出时恢复浅色。
   - **固定时间表模式**：用户可设置「每天 22:00 进入深色模式，07:00 恢复浅色模式」。
3. **主题切换调度器**：`useThemeScheduler()` 在后台维护定时器，到达触发时间时自动调用 `setTheme()`，平滑过渡。
4. **地理位置感知**：可选地请求用户地理位置（通过 Electron 主进程调用系统 API 或 IP 定位），用于精确计算日出日落时间；若用户拒绝，则回退到基于时区的估算。
5. **OLED 友好的图像/图表适配**：在 OLED 模式下，自动为图片添加微弱边框或降低亮度，避免纯黑背景上的白色图片边缘「割裂感」；图表色系自动调整为更适合纯黑背景的色板。

## 目标用户

- **使用 OLED 屏幕设备的用户**：追求更低功耗和更高对比度。
- **希望应用像系统一样「智能」跟随昼夜节律的用户**。
- **需要长时间夜间使用桌面应用的专业用户**（如程序员、设计师）。

## 详细设计

### 交互流程

1. 用户进入「设置 > 外观 > 深色模式」：
   - 原有选项：浅色 / 深色 / 跟随系统。
   - 新增选项：OLED 纯黑。
   - 新增「自动切换」区域：
     - 开关：启用定时切换。
     - 模式选择：跟随日出日落 / 固定时间。
     - 若选择「跟随日出日落」：显示当前计算的日出日落时间，提供「获取位置」按钮。
     - 若选择「固定时间」：两个时间选择器（进入深色时间 / 恢复浅色时间）。
2. 启用自动切换后，`useThemeScheduler()` 启动：
   - 计算距离下一个触发点的时间差，设置 `setTimeout`。
   - 触发时调用 `setTheme('dark' | 'oled' | 'light')`。
   - 应用切换前后台或系统休眠唤醒后，重新校验当前时间并校正主题。
3. 当主题为 `oled` 时：
   - `:root` 中的 `--background` 变为 `oklch(0 0 0)`（纯黑）。
   - 卡片背景从 `oklch(0.205 0 0)` 调整为 `oklch(0.08 0 0)`，边框透明度提高以确保层次。
   - 阴影减少或改用发光效果（box-shadow with primary color glow）替代，因为深色阴影在纯黑上不可见。

### 涉及的技术点

- **日出日落时间计算**：使用 `suncalc` 库或自研算法，根据经纬度和日期计算日出（sunrise）、日落（sunset）、民用曙暮光（civil twilight）时间。
- **Electron 地理位置**：主进程可通过 Node.js 获取系统时区；精确经纬度可通过 `navigator.geolocation`（渲染进程）或主进程调用系统服务获取。考虑到隐私，优先使用 IP 定位作为粗略估算。
- **定时调度与唤醒校正**：单纯 `setTimeout` 不可靠（设备休眠会暂停计时器），需在 `visibilitychange` 和 Electron 的 `resume` 事件中重新计算。
- **OLED 色彩调校**：
  - 纯黑背景 `#000000` 上的文字需避免使用过细的 font-weight（最低 400）。
  - 边框需从 `hsl(1 0 0 / 10%)` 提升到 `hsl(1 0 0 / 15%)` 或更高，确保在纯黑上可见。
  - 图片适配：通过 CSS `img { opacity: 0.92 }` 或自动添加 `border: 1px solid rgba(255,255,255,0.08)` 减少割裂感。
- **Tailwind CSS 暗色变体扩展**：通过 `dark` class 或 `oled` class 的组合，利用 Tailwind 的 `@custom-variant` 支持 `.oled *` 选择器。

### 与现有架构的衔接方式

- **修改 `src/composables/useTheme.ts`**：
  - 扩展 `Theme` 类型：`'light' | 'dark' | 'oled' | 'system'`。
  - `applyTheme` 增加对 `oled` 的处理（添加 `oled` class，覆盖部分 CSS 变量）。
  - 新增 `setOledMode(enabled: boolean)`。
- **新增 `src/composables/useThemeScheduler.ts`**：
  - 管理自动切换逻辑、定时器、日出日落计算。
  - 导出 `isScheduled`、`nextSwitchTime` 等状态。
- **新增 `src/utils/suncalc.ts`**：
  - 日出日落时间计算工具（可封装 `suncalc` 库或自研）。
- **修改 `src/style.css`**：
  - 增加 `.oled` 选择器，覆盖背景、卡片、边框、阴影变量。
  - 增加 `.oled img` 等图片适配样式。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 「外观」Tab 中扩展主题选项和自动切换配置。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useTheme.ts` | 修改 | 扩展 Theme 类型，支持 oled |
| `src/composables/useThemeScheduler.ts` | 新增 | 定时主题切换调度器 |
| `src/utils/suncalc.ts` | 新增 | 日出日落计算 |
| `src/style.css` | 修改 | OLED 主题变量覆盖 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增 OLED 和自动切换设置 |

## 验收标准

- [ ] 新增「OLED 纯黑」主题选项，切换后背景为纯黑，各层级通过边框/微光区分。
- [ ] 支持「跟随日出日落」自动切换，能根据时区/位置计算当日日出日落时间。
- [ ] 支持「固定时间表」自动切换，用户可设置进入/退出深色模式的具体时间。
- [ ] 定时切换触发时，主题平滑过渡（与手动切换相同的过渡动画）。
- [ ] 应用从休眠/后台恢复时，自动校验当前时间并校正主题。
- [ ] OLED 模式下，图片和图表自动适配（降低亮度或添加微弱边框），避免纯黑背景割裂感。
- [ ] 与系统「减少动画」偏好兼容，自动切换时若减少动画开启则禁用过渡。

## 优先级

P2

## 参考实现

- [suncalc](https://github.com/mourner/suncalc)：JavaScript 日出日落计算库。
- [Apple OLED Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)：Apple 对 OLED 屏幕深色模式的设计建议。
- [Telegram Auto-Night Mode](https://telegram.org/blog/night-mode)：Telegram 的定时夜间模式实现。
- [Twitter/X OLED Theme](https://help.twitter.com/en/using-x/x-dark-mode)：X 的「暗色」与「更暗」双档深色模式设计。
