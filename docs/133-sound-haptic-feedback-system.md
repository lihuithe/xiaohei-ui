# 声音与振动反馈系统

## 功能背景/动机

当前脚手架的所有交互反馈都局限于视觉层面（动画、颜色变化、Toast 提示）。在桌面应用中，**声音和振动**是视觉反馈的有力补充，能够：

1. **强化操作确认**：用户点击"保存"时，除了看到对勾动画，听到一个轻微的"叮"声能进一步确认操作成功。
2. **错误警示**：表单校验失败或操作不可执行时，一个短促的"嗡"声或界面抖动（来自 128）的组合能更有效地引起注意。
3. **状态变化提示**：收到新消息、任务完成、定时器结束等异步事件发生时，声音能让用户在不看屏幕的情况下感知状态变化。
4. **无障碍支持**：视障用户依赖屏幕阅读器和声音提示，系统化的音频反馈是无障碍体验的重要组成部分。

Electron 桌面应用相比 Web 应用有天然优势：可以直接调用系统音频 API 和硬件振动（如 MacBook 的 Force Touch 振动马达、Windows 的触觉反馈 API）。提供一套**声音与振动反馈系统**，能让基于此模板的应用拥有更接近原生桌面应用的交互质感。

## 功能描述

构建一套**声音与振动反馈系统**，包含：

1. **声音反馈引擎**：
   - 内置轻量音效库：成功（短促清脆）、错误（低沉短促）、警告（中等音调）、通知（柔和提示）、点击（极短促的"咔哒"）、切换（开关切换时的轻触音）、输入（键盘输入时的轻微敲击音，可选）。
   - 所有音效使用 Web Audio API 合成（而非加载音频文件），零网络依赖、零额外包体积。
   - 支持自定义音效：开发者可通过配置传入自己的 AudioBuffer 或音频文件 URL。
   - 支持音量调节（0-100%）和全局静音。
2. **振动反馈（Haptic Feedback）**：
   - 通过 Electron 主进程调用系统振动 API（macOS 的 `NSHapticFeedbackManager`、Windows 的 `Windows.UI.Input`）。
   - 提供标准化的振动模式：`light`（轻微）、`medium`（中等）、`heavy`（强烈）、`success`（成功双脉冲）、`error`（错误长振动）。
   - 不支持振动的设备自动优雅降级（无操作）。
3. **语义化反馈 API**：
   - `useFeedback()` composable：
     - `feedback.success()`：播放成功音效 + 成功振动 + 可选触发 CheckDraw 动画（128）。
     - `feedback.error()`：播放错误音效 + 错误振动 + 可选触发 Shake 动画（128）。
     - `feedback.warning()`：播放警告音效 + 轻振动。
     - `feedback.notify()`：播放通知音效 + 轻振动。
     - `feedback.click()`：播放点击音效（用于自定义按钮）。
     - `feedback.toggle()`：播放切换音效（用于 Switch、Radio）。
4. **反馈策略配置**：
   - 全局开关：在设置中可开启/关闭声音反馈、振动反馈。
   - 场景级控制：不同场景（表单操作、导航切换、通知接收）可独立配置反馈强度。
   - 时间感知：夜间模式（22:00-08:00）自动降低音量或切换为更柔和的音效。
   - 耳机检测：当检测到耳机插入时，自动降低默认音量（避免惊吓）。
5. **无障碍音频提示**：
   - 与 022（无障碍支持）联动，为屏幕阅读器用户提供额外的音频线索。
   - 支持 `aria-live` 区域的音频同步朗读（如 Toast 出现同时播放简短提示音）。
6. **反馈配置面板**：
   - 在设置页中新增「声音与振动」Tab，提供：
     - 声音开关 + 音量滑块。
     - 振动开关 + 强度选择。
     - 音效试听按钮（点击可逐个试听内置音效）。
     - 场景级配置（表单/导航/通知的独立开关）。

## 目标用户

- **追求"操作有回响"原生桌面体验的开发者**。
- **需要为异步事件（通知、任务完成）提供非视觉提示的产品**。
- **关注无障碍体验、需要为视障用户提供多感官反馈的团队**。

## 详细设计

### 视觉/动画效果描述

本系统主要涉及音频和触觉，但反馈触发时通常伴随视觉动画。设计规范要求**声音、振动、视觉三者时序同步**：

```
用户点击"保存"
   ↓ 0ms
  视觉：按钮按下（scale 0.98，来自 124）
   ↓ 50ms
  音频：点击音（极短促，~60ms）
   ↓ 200ms（保存完成）
  视觉：对勾绘制动画开始（来自 128）
  音频：成功音（清脆，~150ms）
  振动：成功双脉冲（轻-轻，~200ms）
   ↓ 400ms
  视觉：Toast 滑入（来自 113）
```

**内置音效参数（Web Audio API 合成）：**
```typescript
// 成功音：两个快速上升的正弦波
const successSound = {
  type: 'sine',
  frequencies: [523.25, 659.25], // C5 → E5
  durations: [0.08, 0.12],
  envelope: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.1 },
  volume: 0.3,
}

// 错误音：低沉下降的正弦波
const errorSound = {
  type: 'sine',
  frequencies: [200, 150],
  durations: [0.15, 0.2],
  envelope: { attack: 0.02, decay: 0.08, sustain: 0.2, release: 0.15 },
  volume: 0.25,
}

// 点击音：极短促的高频噪声
const clickSound = {
  type: 'triangle',
  frequency: 800,
  duration: 0.03,
  volume: 0.15,
}
```

### 涉及的技术点

- **Web Audio API**：在渲染进程中合成和播放音效，无需加载外部文件。使用 `AudioContext`、`OscillatorNode`、`GainNode`。
- **Electron IPC**：振动反馈需要主进程调用系统原生 API，通过 `ipcRenderer.invoke('haptic-feedback', pattern)` 实现。
- **macOS Haptic Feedback**：`NSHapticFeedbackManager` 的 `performFeedbackPattern`。
- **Windows Haptic Feedback**：`Windows.UI.Input` 或 `InputInjector` API。
- **音量管理**：Web Audio API 的 `GainNode.gain.value` 控制音量，全局静音时设为 0。
- **音频上下文生命周期**：页面可见时保持 `AudioContext`，后台时 `suspend` 以节省资源。

### 与现有架构的衔接方式

- **新增 `src/composables/useFeedback.ts`**：
  - 核心 composable，提供 `success`、`error`、`warning`、`notify`、`click`、`toggle` 等方法。
  - 内部调用 `useSound()` 和 `useHaptic()`。
  - 读取用户反馈偏好（音量、振动强度、场景开关）。
- **新增 `src/composables/useSound.ts`**：
  - 管理 `AudioContext`。
  - 提供 `playSound(config)` 方法，支持内置音效和自定义音频。
  - 提供 `setVolume()`、`mute()`、`unmute()`。
- **新增 `src/composables/useHaptic.ts`**：
  - 提供 `performHaptic(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error')`。
  - 通过 Electron IPC 调用主进程振动 API。
  - 不支持振动的设备自动静默。
- **新增 `src/utils/sound-synthesis.ts`**：
  - Web Audio API 音效合成函数，生成内置音效的 AudioBuffer。
- **修改 Electron 主进程**：
  - `electron/main.ts`：新增 `haptic-feedback` IPC handler，调用系统振动 API。
- **修改现有组件**：
  - `Button.vue`：可选接入 `feedback.click()`（需在 props 中增加 `sound` 选项）。
  - `Switch.vue`、`Checkbox.vue`、`RadioGroupItem.vue`：切换时触发 `feedback.toggle()`。
  - `Toast` / `Sonner` 调用：不同 severity 的 Toast 自动触发对应音效。
  - `Form` 校验失败：触发 `feedback.error()` + `Shake` 动画（128）。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「声音与振动」Tab。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「声音与振动」演示区，可试听所有音效、测试振动模式。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useFeedback.ts` | 新增 | 统一反馈 API |
| `src/composables/useSound.ts` | 新增 | 声音引擎 |
| `src/composables/useHaptic.ts` | 新增 | 振动引擎 |
| `src/utils/sound-synthesis.ts` | 新增 | Web Audio 音效合成 |
| `electron/main.ts` | 修改 | 新增 haptic-feedback IPC handler |
| `src/components/ui/button/Button.vue` | 修改 | 可选接入点击音效 |
| `src/components/ui/switch/Switch.vue` | 修改 | 接入切换音效 |
| `src/components/ui/checkbox/Checkbox.vue` | 修改 | 接入切换音效 |
| `src/components/ui/sonner/Sonner.vue` | 修改 | 不同 severity 自动触发音效 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增声音与振动设置 Tab |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增声音振动演示区 |

## 验收标准

- [ ] 提供至少 6 种内置音效（成功、错误、警告、通知、点击、切换），使用 Web Audio API 合成，无外部文件依赖。
- [ ] `useFeedback()` 提供语义化 API（success/error/warning/notify/click/toggle），一键触发声音+振动+视觉动画。
- [ ] 振动反馈支持 `light/medium/heavy/success/error` 五种模式，在 macOS/Windows 上调用系统原生 API。
- [ ] 不支持振动的设备自动静默降级，无报错。
- [ ] 设置面板中可独立控制声音和振动开关，支持音量滑块和场景级配置。
- [ ] 夜间模式自动降低音效音量或切换为更柔和版本。
- [ ] `prefers-reduced-motion` 或用户关闭反馈时，所有声音和振动禁用。
- [ ] Toast 通知根据 severity 自动播放对应音效（成功/错误/警告/信息）。
- [ ] 表单校验失败时自动播放错误音效 + 触发错误振动 + Shake 动画（128）。
- [ ] ComponentPlayground 中可逐个试听内置音效，测试振动模式。

## 优先级

P2

## 参考实现

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)：浏览器原生音频合成与播放 API。
- [macOS NSHapticFeedbackManager](https://developer.apple.com/documentation/appkit/nshapticfeedbackmanager)：macOS 触觉反馈 API。
- [Windows Haptic Feedback](https://learn.microsoft.com/en-us/windows/uwp/design/input/haptic-feedback)：Windows 触觉反馈文档。
- [Sonos Design System - Sound](https://www.sonos.com/en-us/design-system)：Sonos 的声音设计规范。
- [Apple HIG - Audio](https://developer.apple.com/design/human-interface-guidelines/sound)：Apple 对应用声音的设计建议。
