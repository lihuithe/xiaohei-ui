# 动态壁纸/背景系统

## 功能背景/动机

当前脚手架的背景设计非常朴素：`App.vue` 使用 `background: transparent` 让系统桌面隐约透出，`style.css` 中定义了深浅两色的纯色背景。对于追求个性化和视觉吸引力的桌面应用而言，这种设计虽然干净但缺乏"灵魂"——用户无法自定义应用背景，开发者也无法通过背景传达品牌调性。

Electron 桌面应用相比 Web 应用有一个独特优势：**窗口可以与操作系统桌面环境深度融合**。提供一套**动态壁纸/背景系统**，能让应用：

1. **支持动态背景**：渐变流动、粒子效果、几何图案、动态模糊视频帧等，让窗口"活"起来。
2. **支持用户自定义背景**：用户可选择纯色、渐变、图片、动态效果作为应用背景。
3. **与主题系统联动**：背景色调自动与当前主题预设（101）的主色协调，切换主题时背景平滑过渡。
4. **适配透明窗口**：Electron 窗口已设为透明，动态背景可以充分利用这一特性，创造独特的视觉层次。
5. **性能可控**：背景动画在窗口失焦或最小化时自动暂停，避免无谓的 GPU 占用。

这套系统不是为特定业务功能服务，而是为**所有基于此模板的应用提供可复用的背景能力**——无论是笔记应用、聊天应用还是工具面板，都能一键获得精致的动态背景。

## 功能描述

构建一套**动态壁纸/背景系统**，包含：

1. **背景类型引擎**：
   - **Solid（纯色）**：使用主题背景色，支持透明度调节。
   - **Gradient（渐变）**：线性/径向/角向渐变，支持 2-5 个色标，颜色自动从主题预设中提取。
   - **Mesh Gradient（网格渐变）**：流动的有机色块渐变（使用 CSS `blur` + 动画的轻量实现，或 WebGL 的高级实现）。
   - **Geometric Pattern（几何图案）**：点阵、网格线、六边形、噪点等 SVG/CSS 图案，低对比度作为纹理背景。
   - **Image（图片）**：用户可选择本地图片作为背景，支持模糊度、暗度、遮罩色调节。
   - **Video（视频）**：循环播放本地视频或动态壁纸文件（如 macOS 动态桌面），支持静音和播放速度。
   - **Dynamic Effect（动态效果）**：粒子星云、浮动气泡、波浪网格等纯 CSS/Canvas 动画背景。
2. **背景适配层**：
   - `DynamicBackground` 组件：接收 `type` 和 `config`，自动渲染对应背景。
   - 背景位于 `App.vue` 的最底层（`z-index: -1`），所有 UI 内容浮于其上。
   - 支持 `overlay` 遮罩层：在动态背景上叠加半透明色块（`--background` 带透明度），确保文字可读性。
3. **主题联动**：
   - 切换主题预设（101）时，渐变背景的色标自动从主题调色板中重新计算。
   - 深色模式下，背景自动降低亮度或增加暗色遮罩。
   - OLED 纯黑模式下，动态背景可自动替换为极暗版本或完全禁用（节省电量）。
4. **性能管理**：
   - `useBackgroundPerformance()`：窗口失焦、最小化、进入节能模式时，自动暂停/降级背景动画。
   - 提供 `reduced-motion` 兼容：系统偏好减少动画时，动态效果回退为静态渐变或纯色。
   - Canvas/WebGL 背景使用 `requestAnimationFrame`，帧率限制在 30fps（非活跃窗口）或 60fps（活跃窗口）。
5. **背景配置面板**：
   - 在设置页中新增「背景」Tab，提供：
     - 背景类型选择器（图标卡片式）。
     - 渐变编辑：色标增删、角度调节、类型切换。
     - 图片/视频选择：调用 Electron 的 `dialog.showOpenDialog` 选择本地文件。
     - 效果强度滑块：粒子密度、动画速度、模糊度。
     - 实时预览：小窗口实时展示背景效果。
6. **预设背景包**：
   - 内置 5-8 组精心调校的背景预设（如 "极光"、"深海"、"砂岩"、"星际"、"极简网格"），每组包含深浅两版。
   - 预设以 JSON 配置形式存储，开发者可轻松添加新预设。

## 目标用户

- **希望应用具有独特视觉识别度的开发者**。
- **追求个性化、允许用户自定义界面的产品**。
- **需要为不同场景（专注模式/休闲模式）切换背景氛围的应用**。

## 详细设计

### 视觉/动画效果描述

**Mesh Gradient（轻量 CSS 实现）：**
```css
.mesh-gradient {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(at 40% 20%, hsla(250, 60%, 60%, 0.3) 0px, transparent 50%),
    radial-gradient(at 80% 0%, hsla(190, 60%, 55%, 0.25) 0px, transparent 50%),
    radial-gradient(at 0% 50%, hsla(340, 60%, 60%, 0.2) 0px, transparent 50%),
    radial-gradient(at 80% 50%, hsla(270, 60%, 55%, 0.25) 0px, transparent 50%),
    radial-gradient(at 0% 100%, hsla(220, 60%, 55%, 0.2) 0px, transparent 50%);
  animation: mesh-move 20s ease-in-out infinite alternate;
}
@keyframes mesh-move {
  0% { background-position: 0% 0%, 100% 0%, 0% 100%, 100% 100%, 50% 50%; }
  100% { background-position: 100% 100%, 0% 100%, 100% 0%, 0% 0%, 50% 50%; }
}
```

**几何图案（噪点纹理）：**
```css
.geometric-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
}
```

**动态效果（粒子星云 - Canvas 伪代码）：**
```
- 50-100 个半透明圆点随机分布
- 每个点以极慢速度随机漂移
- 点与点之间距离 < 100px 时绘制连线
- 鼠标/光标附近产生轻微斥力或引力
- 颜色使用主题主色的极低透明度版本
```

**背景叠加层：**
```css
.background-overlay {
  position: fixed;
  inset: 0;
  background: var(--background);
  opacity: var(--background-overlay-opacity, 0.85);
  backdrop-filter: blur(var(--background-overlay-blur, 0px));
}
```

### 涉及的技术点

- **CSS 渐变动画**：`background-position` 动画实现轻量动态效果，性能开销极低。
- **Canvas 2D / WebGL**：粒子效果、复杂动态背景使用 Canvas API 或轻量 WebGL（如 Three.js 的极小化封装）。
- **Electron 文件选择**：通过 `ipcRenderer.invoke('select-background')` 调用主进程的 `dialog.showOpenDialog`。
- **CSS `backdrop-filter: blur()`**：图片/视频背景的毛玻璃遮罩效果。
- **Intersection Observer / Page Visibility API**：检测窗口可见性，暂停后台动画。
- **`requestAnimationFrame` 节流**：非活跃窗口将动画帧率限制到 30fps 或完全暂停。

### 与现有架构的衔接方式

- **新增 `src/components/background/` 目录**：
  - `DynamicBackground.vue`：背景主容器，根据 `type` 渲染对应子组件。
  - `SolidBackground.vue`
  - `GradientBackground.vue`
  - `MeshGradientBackground.vue`
  - `GeometricBackground.vue`
  - `ImageBackground.vue`
  - `VideoBackground.vue`
  - `ParticleBackground.vue`（Canvas 粒子）
  - `BackgroundOverlay.vue`（遮罩层）
- **新增 `src/composables/useBackground.ts`**：
  - 管理背景类型、配置、预设选择。
  - 持久化到 `localStorage`。
  - 提供 `applyBackground()` 动态切换。
- **新增 `src/composables/useBackgroundPerformance.ts`**：
  - 监听窗口焦点、可见性，自动暂停/恢复动画。
- **新增 `src/themes/background-presets.ts`**：
  - 内置背景预设定义（JSON 配置数组）。
- **修改 `src/App.vue`**：
  - 在 `.app-layout` 最底层插入 `<DynamicBackground />`。
  - 确保所有内容区域有 `BackgroundOverlay` 或足够的背景不透明度保证可读性。
- **修改 `src/style.css`**：
  - 增加 `--background-overlay-opacity` 和 `--background-overlay-blur` 变量。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「背景」Tab，集成背景选择器和编辑器。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「动态背景」演示区，可切换所有预设背景。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/background/DynamicBackground.vue` | 新增 | 背景主容器 |
| `src/components/background/GradientBackground.vue` | 新增 | 渐变背景 |
| `src/components/background/MeshGradientBackground.vue` | 新增 | 网格渐变背景 |
| `src/components/background/GeometricBackground.vue` | 新增 | 几何图案背景 |
| `src/components/background/ImageBackground.vue` | 新增 | 图片背景 |
| `src/components/background/ParticleBackground.vue` | 新增 | Canvas 粒子背景 |
| `src/components/background/BackgroundOverlay.vue` | 新增 | 遮罩层 |
| `src/composables/useBackground.ts` | 新增 | 背景配置状态管理 |
| `src/composables/useBackgroundPerformance.ts` | 新增 | 背景性能管理 |
| `src/themes/background-presets.ts` | 新增 | 内置背景预设 |
| `src/App.vue` | 修改 | 插入动态背景层 |
| `src/style.css` | 修改 | 背景遮罩变量 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增背景设置 Tab |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增背景演示区 |

## 验收标准

- [ ] 支持 7 种背景类型：纯色、渐变、网格渐变、几何图案、图片、视频、粒子动态效果。
- [ ] 内置 5-8 组背景预设，每组包含深浅两版，切换主题时自动适配。
- [ ] 渐变背景支持 2-5 个色标、角度/类型调节，色标可从主题调色板自动提取。
- [ ] 图片/视频背景支持本地文件选择，支持模糊度和暗度调节。
- [ ] 所有动态背景在窗口失焦/最小化时自动暂停动画，恢复后自动继续。
- [ ] `prefers-reduced-motion` 时动态效果回退为静态渐变或纯色。
- [ ] OLED 纯黑模式下可选择禁用动态背景以节省电量。
- [ ] 背景上方有可调透明度的遮罩层，确保任何背景上文字都可读。
- [ ] 背景切换时平滑过渡（300-500ms），无闪烁。
- [ ] ComponentPlayground 中可交互式切换所有预设背景并调节参数。

## 优先级

P2

## 参考实现

- [macOS Dynamic Desktop](https://support.apple.com/en-us/HT208721)：macOS 动态桌面壁纸机制。
- [Windows Spotlight](https://support.microsoft.com/en-us/windows/windows-spotlight-pictures-5a6bda57-5ba5-4e8e-8f81-771832df835c)：Windows 锁屏动态壁纸。
- [Mesh Gradient Generators](https://meshgradient.com/)：网格渐变生成工具，视觉参考。
- [Three.js Particle Systems](https://threejs.org/examples/#webgl_points_billboards)：WebGL 粒子效果参考。
- [CSS Gradient Animator](https://www.gradient-animator.com/)：CSS 渐变动画生成器。
