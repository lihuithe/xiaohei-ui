# 玻璃拟态/毛玻璃效果系统

## 功能背景/动机

当前脚手架的 UI 风格偏向传统的实色卡片与导航，虽然已支持深浅模式切换，但缺乏现代桌面应用中流行的**玻璃拟态（Glassmorphism）**视觉效果。玻璃拟态通过 `backdrop-blur`、半透明背景与微妙边框，能让界面元素呈现"浮于内容之上"的通透感，在以下场景中极具价值：

1. **浮动面板与弹窗**：模态框、下拉菜单、Context Menu 使用玻璃背景可减少对底层内容的遮挡感。
2. **导航栏与侧边栏**：顶部标题栏或侧边栏采用轻微毛玻璃效果，能让窗口背后的桌面壁纸/其他应用隐约透出，增强桌面应用的"原生感"。
3. **Electron 无边框窗口的天然优势**：脚手架已使用透明背景（`background: transparent`）和圆角窗口，玻璃拟态是将其视觉潜力最大化的关键一步。

然而，玻璃效果若使用不当（如过度模糊、对比度不足）会严重影响可读性。提供一套**系统化的玻璃拟态规范与组件**，能确保下游开发者安全、一致地使用这一视觉语言。

## 功能描述

构建一套**玻璃拟态/毛玻璃效果系统**，包含：

1. **玻璃效果 Token 体系**：定义不同强度的玻璃效果变量——`glass-sm`（轻微）、`glass-md`（标准）、`glass-lg`（强模糊），每档包含 `backdrop-filter` 强度、背景透明度、边框样式、阴影参数。
2. **玻璃容器组件 `GlassCard`**：继承并扩展 `Card.vue`，支持 `glass` 变体，自动适配深浅模式下的透明度与边框亮度。
3. **玻璃导航栏 `GlassNavbar`** / **`GlassSidebar`**：为顶部导航和侧边栏提供玻璃化封装，支持滚动时自动增强模糊强度（滚动前 `glass-sm`，滚动后 `glass-lg`）。
4. **玻璃弹窗/浮层**：扩展 `Dialog`、`Popover`、`Sheet` 等组件，支持 `glass` 模式，底层内容透过半透明背景隐约可见。
5. **玻璃效果安全区检测**：提供 `useGlassContrast()` 工具，自动检测玻璃背景下的文字对比度，若不足则自动叠加暗色/亮色遮罩层或提高背景不透明度。
6. **动态壁纸适配**：当窗口背后为动态/彩色内容（如视频、壁纸）时，玻璃效果需要更高的背景不透明度和更强的边框来保持可读性。提供 `adaptiveGlass` 模式自动调节。

## 目标用户

- **追求现代、通透视觉风格的桌面应用开发者**。
- **使用透明/无边框 Electron 窗口、希望最大化视觉效果的团队**。
- **需要浮动面板、HUD 风格 UI 的工具类应用开发者**（如系统监控、快速启动器）。

## 详细设计

### 视觉/动画效果描述

**玻璃 Token 定义（CSS 变量）：**
```css
:root {
  --glass-sm-blur: 4px;
  --glass-sm-bg: rgba(255, 255, 255, 0.4);
  --glass-sm-border: rgba(255, 255, 255, 0.5);
  --glass-sm-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  --glass-md-blur: 12px;
  --glass-md-bg: rgba(255, 255, 255, 0.55);
  --glass-md-border: rgba(255, 255, 255, 0.6);
  --glass-md-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  --glass-lg-blur: 24px;
  --glass-lg-bg: rgba(255, 255, 255, 0.65);
  --glass-lg-border: rgba(255, 255, 255, 0.7);
  --glass-lg-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.dark {
  --glass-sm-bg: rgba(0, 0, 0, 0.25);
  --glass-sm-border: rgba(255, 255, 255, 0.08);
  --glass-md-bg: rgba(0, 0, 0, 0.4);
  --glass-md-border: rgba(255, 255, 255, 0.1);
  --glass-lg-bg: rgba(0, 0, 0, 0.55);
  --glass-lg-border: rgba(255, 255, 255, 0.12);
}
```

**应用规则：**
- 浅色模式下，玻璃背景以白色为基底（`rgba(255,255,255, x)`），配合白色高光边框，模拟磨砂玻璃质感。
- 深色模式下，玻璃背景以黑色为基底（`rgba(0,0,0, x)`），边框使用低透明度白色，避免死黑。
- OLED 纯黑模式下（112），玻璃效果需进一步降低背景透明度（因为纯黑背景上玻璃效果几乎不可见），或自动回退到实色低透明背景。

### 涉及的技术点

- **`backdrop-filter: blur()`**：核心 CSS 属性，在支持的浏览器/ Electron 中自动生效。需处理不支持时的优雅降级（fallback 到纯色半透明背景）。
- **CSS `@supports` 查询**：`@supports (backdrop-filter: blur(12px))` 用于检测支持性，不支持时回退到 `background: var(--glass-md-bg)`。
- **饱和度增强**：`backdrop-filter: blur(12px) saturate(1.2)` 可增强玻璃背后的色彩饱和度，让效果更通透。
- **背景隔离**：玻璃元素需设置 `isolation: isolate` 或 `transform: translateZ(0)` 以创建新的层叠上下文，避免模糊效果泄漏到意外区域。
- **性能考量**：过度使用 `backdrop-filter` 在低端设备上可能导致 GPU 占用过高。提供 `reduceGlass` 开关（与 109 的动画降级联动）。

### 与现有架构的衔接方式

- **新增 `src/styles/glass.css`**：
  - 定义 `.glass-sm`、`.glass-md`、`.glass-lg` 工具类。
  - 定义 `@custom-variant glass (&:is(.glass *))` 供 Tailwind 使用。
- **修改 `src/style.css`**：
  - 在 `:root` 和 `.dark` 中注入玻璃 Token 变量。
  - 在 `@theme inline` 中增加 `--color-glass-*` 映射（可选）。
- **新增 `src/components/ui/glass/` 目录**：
  - `GlassCard.vue`：玻璃卡片容器。
  - `GlassNavbar.vue`：玻璃导航栏。
  - `GlassOverlay.vue`：玻璃遮罩层（用于 Dialog/Sheet 的 backdrop）。
- **新增 `src/composables/useGlassScroll.ts`**：
  - 监听滚动位置，动态切换玻璃模糊强度。
- **修改现有弹窗组件**：
  - `DialogOverlay.vue`、`SheetOverlay.vue`：增加 `glass` prop，启用时替换为 `GlassOverlay`。
- **扩展 `useTheme.ts`**：
  - 在 `oled` 模式下自动降低玻璃背景透明度或禁用玻璃效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/styles/glass.css` | 新增 | 玻璃效果工具类与 Token |
| `src/style.css` | 修改 | 注入玻璃 CSS 变量 |
| `src/components/ui/glass/GlassCard.vue` | 新增 | 玻璃卡片容器 |
| `src/components/ui/glass/GlassNavbar.vue` | 新增 | 玻璃导航栏 |
| `src/components/ui/glass/GlassOverlay.vue` | 新增 | 玻璃遮罩层 |
| `src/composables/useGlassScroll.ts` | 新增 | 滚动时玻璃强度切换 |
| `src/components/ui/dialog/DialogOverlay.vue` | 修改 | 支持 glass prop |
| `src/components/ui/sheet/SheetOverlay.vue` | 修改 | 支持 glass prop |

## 验收标准

- [ ] 提供 `glass-sm`、`glass-md`、`glass-lg` 三档玻璃效果工具类，在深浅模式下均有良好可读性。
- [ ] `GlassCard` 组件支持玻璃变体，圆角、边框、阴影与现有 `Card` 一致但带有通透感。
- [ ] 玻璃效果在不支持 `backdrop-filter` 的环境中优雅降级为纯色半透明背景。
- [ ] `GlassNavbar` 在滚动时自动增强模糊强度，过渡平滑。
- [ ] Dialog/Sheet 的 Overlay 支持玻璃模式，底层内容隐约可见。
- [ ] OLED 纯黑模式下玻璃效果自动适配（提高不透明度或回退实色），不出现"消失"问题。
- [ ] 与 109 的动画降级开关联动，关闭动画时可选择同时降低玻璃模糊强度以节省性能。

## 优先级

P1

## 参考实现

- [Apple Design - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)：macOS 系统级玻璃/材质效果设计规范。
- [Microsoft Fluent Design - Acrylic](https://learn.microsoft.com/en-us/windows/apps/design/style/acrylic)：Windows Acrylic 材质（毛玻璃）设计指南。
- [Glassmorphism CSS Generator](https://ui.glass/)：在线玻璃效果生成器，参数参考。
- [Tailwind CSS Backdrop Blur](https://tailwindcss.com/docs/backdrop-blur)：Tailwind 毛玻璃工具类文档。
