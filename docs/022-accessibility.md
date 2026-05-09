# 无障碍支持（Accessibility / a11y）

## 功能背景/动机

无障碍（Accessibility）是现代应用开发的重要考量，它不仅服务于视障、听障、运动障碍用户，也惠及所有用户（如键盘党、高对比度需求者、临时性损伤者）。目前脚手架虽然使用了 shadcn-vue/Reka UI（底层基于 Radix，已具备基础无障碍属性），但没有系统性的无障碍策略——没有焦点管理、没有屏幕阅读器测试、没有键盘导航规范、没有高对比度/减弱动效支持。作为模板，提供一套无障碍最佳实践，能让下游开发者从项目开始就建立正确的 a11y 意识，避免后期补无障碍的高昂成本。

## 功能描述

构建系统化的无障碍支持：

1. **键盘导航规范**：所有交互元素可通过 Tab/Shift+Tab 访问，Enter/Space 激活，Escape 关闭
2. **焦点管理**：模态框打开时焦点 trapped 在框内，关闭后焦点回到触发元素
3. **屏幕阅读器优化**：完整的 ARIA 属性、语义化 HTML、状态变化通知（live regions）
4. **高对比度支持**：检测 Windows 高对比度模式，适配颜色方案
5. **减弱动效支持**：检测 `prefers-reduced-motion`，禁用或简化过渡动画
6. **颜色对比度检查**：开发模式下自动检测文本与背景对比度是否达到 WCAG AA 标准
7. **无障碍声明页**：提供应用的无障碍合规信息页模板

## 目标用户

- 需要满足无障碍合规要求的企业应用开发者
- 希望提升产品包容性的独立开发者
- 需要支持键盘全流程操作的效率工具开发者

## 详细设计

### 交互流程

```
键盘导航：
用户按 Tab → 焦点在可交互元素间循环移动（按 DOM 顺序或自定义 tabindex）
  → Shift+Tab → 反向移动
  → Enter → 激活按钮/链接
  → Space → 切换 checkbox / 激活按钮
  → Escape → 关闭 modal / dropdown / popover
  → 方向键 → 在 radio group / menu / select 中移动选择

焦点管理：
用户点击「打开设置」→ 打开 Settings Modal
  → 焦点自动移动到 Modal 内第一个可交互元素
  → Tab 仅在 Modal 内循环（Focus Trap）
  → 点击 Escape 或关闭按钮 → Modal 关闭 → 焦点回到「打开设置」按钮

减弱动效：
用户系统开启「减少动态效果」→ 应用检测到 prefers-reduced-motion
  → 所有过渡动画时长设为 0 或替换为透明度过渡
  → 侧边栏展开/收起变为即时切换
  → Toast 出现/消失无滑入滑出
```

### 涉及的技术点

- **ARIA 属性**：`role`、`aria-label`、`aria-describedby`、`aria-expanded`、`aria-live`
- **焦点管理**：`focus-trap-vue` 或基于 Vue 的自定义焦点陷阱实现
- **屏幕阅读器**：VoiceOver (macOS)、NVDA/JAWS (Windows) 测试
- **媒体查询**：`prefers-reduced-motion`、`forced-colors`（Windows 高对比度）
- **对比度检测**：`axe-core` 或自研工具检测颜色对比度

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/components/ui/` | shadcn-vue 基于 Radix 已具备基础 ARIA，需在此基础上增强 |
| `src/composables/useTheme.ts` | 主题系统支持高对比度模式切换 |
| `src/App.vue` | 根组件监听 prefers-reduced-motion 和 forced-colors |
| `src/router/index.ts` | 路由切换时更新页面标题和焦点管理 |
| `src/utils/debug.ts` | 开发模式下集成 axe-core 自动检测 |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useFocusTrap.ts` — 焦点陷阱 composable
- `src/composables/useA11yAnnouncer.ts` — 屏幕阅读器通知 composable
- `src/composables/useReducedMotion.ts` — 减弱动效检测 composable
- `src/components/A11ySkipLink.vue` — 跳转到主内容链接
- `src/components/A11yAnnouncer.vue` — 无障碍状态通知区域（aria-live）
- `src/utils/a11y.ts` — 无障碍工具函数（焦点管理、对比度计算）
- `src/pages/AccessibilityPage.vue` — 无障碍声明页模板

**修改文件：**
- `src/App.vue` — 添加 SkipLink、Announcer，监听 reduced-motion
- `index.html` — 添加 lang 属性，确保正确的语言标识
- `src/components/Sidebar.vue` — 添加 aria-label、aria-expanded
- `src/components/TitleBar.vue` — 窗口按钮添加 aria-label
- 所有 Modal/Dialog 组件 — 添加焦点陷阱和焦点恢复

### 核心数据结构

```typescript
export interface A11yPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReaderOptimized: boolean
}

export interface A11yAnnouncement {
  message: string
  priority: 'polite' | 'assertive'
  id: string
}
```

### 关键实现策略

1. **Focus Trap 实现**：使用 Vue 的自定义指令或 composable，在 Modal 打开时：找到容器内所有 focusable 元素 → 监听 Tab/Shift+Tab → 在首尾元素间循环 → 关闭时恢复 focus
2. **Route Announcer**：路由切换后，自动读取新页面标题并通过 aria-live 通知屏幕阅读器（"已导航到 组件页"）
3. **Reduced Motion**：在 `html` 元素上添加 `data-reduced-motion` 属性，CSS 中所有 transition/animation 通过 `[data-reduced-motion="true"] *` 规则覆盖为 `transition: none !important`
4. **对比度检测**：开发模式下引入 `axe-core`（体积较大，仅 devDependency），在组件挂载后自动扫描并 Console 输出对比度不足的元素
5. **高对比度**：通过 `forced-colors: active` 媒体查询，确保边框、焦点环在高对比度下可见

## 验收标准

- [ ] 所有页面可通过键盘完整操作（Tab 导航、Enter/Space 激活、Escape 关闭）
- [ ] Modal/Dialog 打开时焦点被困在容器内，关闭后焦点回到触发元素
- [ ] 路由切换后屏幕阅读器自动播报新页面标题
- [ ] 系统开启「减少动态效果」后，应用所有过渡动画自动禁用
- [ ] Windows 高对比度模式下，所有 UI 元素可见且可辨识
- [ ] 开发模式下自动检测颜色对比度不足的元素并 Console 警告
- [ ] 提供 SkipLink 组件，允许键盘用户跳转到主内容区
- [ ] 所有图标按钮都有 `aria-label` 描述用途
- [ ] 提供无障碍声明页模板，展示应用的 a11y 支持情况
- [ ] 包含无障碍测试指南（如何用 VoiceOver / NVDA 测试）

## 优先级

**P2** — 无障碍是负责任的产品设计基础，但实现涉及全量组件改造，工作量较大；作为模板最佳实践提供高价值。

## 参考实现

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — W3C 无障碍实践指南
- [axe-core](https://github.com/dequelabs/axe-core) — 自动化无障碍检测
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) — shadcn-vue 底层库的无障碍支持
- [Gov.uk Accessibility](https://accessibility.blog.gov.uk/) — 政府级无障碍标准实践
- [Apple Accessibility](https://www.apple.com/accessibility/) — macOS 平台无障碍设计参考
