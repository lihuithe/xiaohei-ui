# 空状态/插图系统

## 功能背景/动机

当前脚手架已通过 105（加载/空/错误状态统一设计系统）规划了 `EmptyState`、`SearchEmpty`、`NoDataEmpty`、`NoPermissionEmpty` 等功能性空状态组件，但空状态的"视觉设计"层面仍然缺乏系统化规范。在实际产品中，空状态是用户首次使用功能或数据缺失时的关键触点，视觉设计直接影响用户对产品品质的第一印象：

1. **插图风格不统一**：不同页面的空状态可能使用不同来源的插图（有的用 emoji、有的用 SVG、有的用 Lottie），风格、线条粗细、色彩体系各不相同。
2. **深色模式适配差**：浅色模式下好看的彩色插图，在深色模式下可能过亮刺眼或颜色失真。
3. **缺乏插图动画**：静态插图显得呆板，轻微的呼吸动画或入场动画能让空状态更生动。
4. **无插图降级方案**：网络不佳或追求极简风格时，需要纯图标+文字的优雅降级方案。
5. **场景覆盖不全**：105 覆盖了通用空状态、搜索无结果、数据为空、权限不足，但缺少如 "网络断开"、"功能建设中"、"筛选结果为空"、"回收站为空" 等细分场景的差异化视觉。

提供一套**空状态/插图系统**，能让所有空状态在视觉风格、动画表现、主题适配上保持高度一致，同时提供可扩展的插图资产管理和场景化模板。

## 功能描述

构建一套**空状态/插图系统**，包含：

1. **插图风格规范**：
   - 定义统一的插图设计语言：线条风格（2px 描边、圆角端点）、色彩使用（仅使用主题语义色 + 中性灰）、人物/物体比例、留白规范。
   - 提供浅色/深色双版本 SVG 插图，切换主题时自动切换（通过 CSS `currentColor` 或 CSS 变量控制插图颜色）。
   - 插图尺寸规范：小（120x120，用于内嵌区域）、中（200x200，用于页面级）、大（320x320，用于全屏欢迎）。
2. **空状态场景模板库**：
   - `EmptyGeneric`：通用空状态（盒子/文档图标 + "暂无内容"）。
   - `EmptySearch`：搜索无结果（放大镜 + "未找到匹配项"）。
   - `EmptyFilter`：筛选结果为空（漏斗 + "没有符合筛选条件的数据"）。
   - `EmptyNetwork`：网络断开（断开的信号/云 + "网络连接失败"）。
   - `EmptyPermission`：权限不足（锁图标 + "您没有权限访问此内容"）。
   - `EmptyTrash`：回收站为空（空垃圾桶 + "回收站是空的"）。
   - `EmptyInbox`：收件箱为空（打开的信封 + "没有新消息"）。
   - `EmptyConstruction`：功能建设中（工具/脚手架 + "此功能正在开发中"）。
   - `EmptyError`：通用错误（感叹号/裂开的文档 + "出错了，请稍后重试"）。
   - 每个模板包含：插图（SVG）、标题、描述、操作按钮（可选）。
3. **插图动画系统**：
   - `EmptyIllustration` 组件：包装 SVG 插图，支持动画模式：
     - `fade-in`：插图淡入上浮（默认）。
     - `breathe`：插图轻微缩放呼吸（用于强调等待状态）。
     - `float`：插图上下轻微浮动（用于表达"这里原本应该有东西"）。
     - `draw`：SVG 路径绘制动画（线条逐渐画出，约 1.5s）。
     - `none`：静态无动画。
   - 动画支持 `stagger`：插图、标题、描述、按钮依次错峰出现（间隔 100ms）。
4. **无插图降级模式（Minimal Mode）**：
   - 当网络不佳、用户偏好极简、或空间狭小时，自动降级为纯图标 + 文字模式。
   - 纯图标模式使用 `lucide-vue-next` 图标，颜色和大小与插图模式一致。
   - 支持 `compact` 布局：图标和文字水平排列（适合表格内嵌空状态）。
5. **空状态配置面板**：
   - 在设置中提供「空状态风格」选项：
     - 插图大小（小/中/大）。
     - 动画开关。
     - 极简模式偏好（始终使用纯图标）。
6. **插图资产管理**：
   - `src/assets/illustrations/` 目录规范：所有 SVG 插图按场景分类存放。
   - 提供 `useIllustration(name, theme)` 动态加载对应主题版本的插图。
   - 支持开发者替换：将自定义 SVG 放入目录即可覆盖默认插图。

## 目标用户

- **需要为列表、表格、搜索、权限等场景提供空状态展示的开发者**。
   - **追求一致插图风格和主题适配的设计团队**。
   - **需要为不同空状态场景提供差异化视觉叙事的开发者**。

## 详细设计

### 视觉/动画效果描述

**插图风格规范：**
```
- 描边：2px，round cap/join
- 圆角：所有拐角使用 4px 圆角
- 色彩：仅使用 var(--foreground) 描边 + var(--primary) 点缀 + var(--muted) 填充
- 人物：无面部细节，仅轮廓（避免文化差异）
- 留白：插图四周留出 20% 的呼吸空间
```

**SVG 双版本切换（使用 CSS 变量）：**
```svg
<svg viewBox="0 0 200 200">
  <!-- 描边颜色使用 currentColor，通过父元素 color 控制 -->
  <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" stroke-width="2"/>
  <!-- 点缀色使用 CSS 变量 -->
  <circle cx="100" cy="100" r="20" fill="var(--primary)" opacity="0.2"/>
</svg>
```

**空状态布局：**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
  gap: var(--space-4);
}
.empty-state-compact {
  flex-direction: row;
  gap: var(--space-3);
  padding: var(--space-4);
  text-align: left;
}
.empty-state-illustration {
  color: var(--muted-foreground);
}
.empty-state-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--foreground);
}
.empty-state-description {
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  max-width: 320px;
}
```

**动画效果：**
```css
/* 插图淡入上浮 */
@keyframes empty-illustration-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 标题淡入 */
@keyframes empty-title-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 呼吸 */
@keyframes empty-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
/* 浮动 */
@keyframes empty-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
/* SVG 路径绘制 */
@keyframes empty-draw {
  to { stroke-dashoffset: 0; }
}
```

**stagger 错峰出现：**
```css
.empty-state > *:nth-child(1) { animation: empty-illustration-in 0.5s var(--ease-out) 0ms both; }
.empty-state > *:nth-child(2) { animation: empty-title-in 0.4s var(--ease-out) 100ms both; }
.empty-state > *:nth-child(3) { animation: empty-title-in 0.4s var(--ease-out) 200ms both; }
.empty-state > *:nth-child(4) { animation: empty-title-in 0.4s var(--ease-out) 300ms both; }
```

### 涉及的技术点

- **SVG 设计规范**：所有插图使用统一的设计语言，通过 `currentColor` 和 CSS 变量实现主题适配。
- **CSS 动画关键帧**：空状态的各种入场和循环动画。
- **SVG 路径绘制动画**：利用 `stroke-dasharray` + `stroke-dashoffset` 实现线条逐渐画出的效果。
- **Vue `<Transition>` + `appear`**：空状态组件进入视口时自动触发动画。
- **动态 SVG 加载**：`useIllustration()` 根据场景名和主题动态 import SVG 组件。
- **降级策略**：根据用户偏好或空间约束，在插图和纯图标模式间切换。

### 与现有架构的衔接方式

- **新增 `src/assets/illustrations/` 目录**：
  - 存放所有 SVG 插图（`generic.svg`、`search.svg`、`filter.svg`、`network.svg` 等）。
  - 每个插图包含浅色版和深色版（或使用 `currentColor` 的单版本）。
- **新增 `src/components/ui/empty/` 目录**：
  - `EmptyIllustration.vue`：插图动画包装组件。
  - `EmptyGeneric.vue`、`EmptySearch.vue`、`EmptyFilter.vue`、`EmptyNetwork.vue`、`EmptyPermission.vue`、`EmptyTrash.vue`、`EmptyInbox.vue`、`EmptyConstruction.vue`、`EmptyError.vue`。
  - `EmptyState.vue`：统一入口组件，根据 `scene` prop 自动渲染对应模板。
  - `EmptyStateMinimal.vue`：纯图标降级版本。
- **新增 `src/composables/useIllustration.ts`**：
  - 动态加载插图 SVG。
  - 提供 `getIllustration(name, theme)` 方法。
- **修改 `src/style.css`**：
  - 注入空状态动画相关的 CSS 变量。
- **与 105 的衔接**：
  - 105 中规划的 `EmptyState`、`SearchEmpty`、`NoDataEmpty`、`NoPermissionEmpty`、`NetworkError` 等组件，其默认渲染内容使用本系统的模板。
- **修改 `src/components/layouts/SettingsLayout.vue`**：
  - 新增「空状态风格」设置项。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「空状态系统」演示区，展示所有场景模板、动画模式、极简降级。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/assets/illustrations/` | 新增目录 | SVG 插图资源 |
| `src/components/ui/empty/EmptyIllustration.vue` | 新增 | 插图动画包装 |
| `src/components/ui/empty/EmptyState.vue` | 新增 | 统一入口组件 |
| `src/components/ui/empty/EmptyStateMinimal.vue` | 新增 | 纯图标降级 |
| `src/components/ui/empty/EmptyGeneric.vue` | 新增 | 通用空状态 |
| `src/components/ui/empty/EmptySearch.vue` | 新增 | 搜索无结果 |
| `src/components/ui/empty/EmptyFilter.vue` | 新增 | 筛选为空 |
| `src/components/ui/empty/EmptyNetwork.vue` | 新增 | 网络断开 |
| `src/components/ui/empty/EmptyPermission.vue` | 新增 | 权限不足 |
| `src/components/ui/empty/EmptyTrash.vue` | 新增 | 回收站为空 |
| `src/components/ui/empty/EmptyInbox.vue` | 新增 | 收件箱为空 |
| `src/components/ui/empty/EmptyConstruction.vue` | 新增 | 功能建设中 |
| `src/components/ui/empty/EmptyError.vue` | 新增 | 通用错误 |
| `src/composables/useIllustration.ts` | 新增 | 插图动态加载 |
| `src/style.css` | 修改 | 空状态动画变量 |
| `src/components/layouts/SettingsLayout.vue` | 修改 | 新增空状态风格设置 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增空状态系统演示区 |

## 验收标准

- [ ] 定义统一的插图设计语言（线条、圆角、色彩、留白规范）。
- [ ] 提供至少 10 种空状态场景模板（通用/搜索/筛选/网络/权限/回收站/收件箱/建设中/错误/无数据）。
- [ ] 每个模板包含插图（SVG）、标题、描述、操作按钮的完整组合。
- [ ] 插图支持 `fade-in`、`breathe`、`float`、`draw`、`none` 五种动画模式。
- [ ] 空状态元素（插图、标题、描述、按钮）支持 stagger 错峰出现动画。
- [ ] 提供 `minimal` 降级模式，使用 Lucide 纯图标替代插图。
- [ ] 提供 `compact` 布局，图标和文字水平排列，适合内嵌场景。
- [ ] 插图颜色通过 CSS 变量适配深浅模式，无需维护两套 SVG。
- [ ] 开发者可通过替换 `src/assets/illustrations/` 中的 SVG 自定义插图。
- [ ] ComponentPlayground 中可交互式切换场景、动画模式、极简/紧凑布局。

## 优先级

P2

## 参考实现

- [Ant Design Empty](https://ant.design/components/empty-cn)：空状态的场景细分和插图设计。
- [Chakra UI Empty State](https://v2.chakra-ui.com/docs/components/empty-state)：空状态的布局与动画。
- [GitHub Primer - Blankslate](https://primer.style/components/blankslate)：GitHub 的空状态设计规范。
- [Material Design 3 - Empty States](https://m3.material.io/components/empty-states/overview)：Material Design 空状态指南。
- [unDraw](https://undraw.co/)：开源插图库，风格参考。
