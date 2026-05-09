# 208 欢迎/引导页模板（Onboarding & Welcome Layout）

## 功能名称

欢迎/引导页模板 — 提供首次启动欢迎页、功能引导轮播、快速设置向导三种可复用骨架。

## 功能背景/动机

桌面应用在首次启动或新用户注册后，通常需要展示欢迎语、核心功能介绍、初始配置引导。现有脚手架已有 `010-splash-screen`（启动页/闪屏）和 `HomePage.vue`（简单的欢迎语 + 快捷入口卡片），但缺少**结构化的引导页布局模板**。开发者在实现引导流程时，需要自行设计步骤切换、进度指示、跳过/继续按钮组等重复结构。

本功能提供纯粹的 UI 布局骨架，不绑定任何具体引导内容，让开发者只需填充文案和配图即可快速搭建专业的新手引导体验。

## 功能描述

包含以下三种引导页布局变体：

| 变体 | 说明 | 适用场景 |
|------|------|----------|
| `WelcomeHeroLayout` | 单页大图/插画 + 欢迎语 + 快速入口按钮 | 首次启动、版本更新后的欢迎 |
| `OnboardingCarouselLayout` | 多页横向滑动轮播，底部有步骤指示点 | 功能介绍、教程引导 |
| `QuickSetupWizardLayout` | 3-5 步快速设置，底部进度条 + 上一步/下一步 | 初次配置、偏好设置引导 |

每种布局均内建：
- 跳过/关闭入口（右上角或底部）
- 步骤指示器（圆点或进度条）
- 进入/退出动画（与 `AnimatedTransition` 衔接）
- 最后一步的"开始使用"主按钮
- 暗色/亮色主题适配

## 目标用户

- 需要为新用户提供首次启动引导的开发者
- 需要在版本升级后展示新功能的开发者
- 需要快速设置向导来收集用户初始偏好的开发者

## 详细设计

### 布局结构描述

#### 1. 欢迎首页（WelcomeHeroLayout）

```
+--------------------------------------------------+
|                                         [跳过 x] |
|                                                  |
|              +------------------+                |
|              |    应用插画/Logo  |                |
|              |   （圆角大卡片）   |                |
|              +------------------+                |
|                                                  |
|              欢迎使用小黑助手                    |
|         简洁高效的桌面工作伙伴                   |
|                                                  |
|         [  开始使用  ]  [  导入数据  ]            |
|                                                  |
|         或从以下模板开始：                        |
|         [模板A] [模板B] [模板C]                   |
|                                                  |
+--------------------------------------------------+
```

#### 2. 引导轮播（OnboardingCarouselLayout）

```
+--------------------------------------------------+
|                                         [跳过 x] |
|                                                  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  |              功能插画/截图                  |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|              智能搜索                            |
|         使用自然语言快速查找你的数据             |
|                                                  |
|              ○  ●  ○  ○                          |
|                                                  |
|  [  上一步  ]              [  下一步  ]           |
|                                                  |
+--------------------------------------------------+
```

#### 3. 快速设置向导（QuickSetupWizardLayout）

```
+--------------------------------------------------+
|  快速设置                                    2/4  |
|  +-------------------------------+                |
|  |████████░░░░░░░░░░░░░░░░░░░░░░|                |
|  +-------------------------------+                |
|                                                  |
|  选择你的主题                                    |
|                                                  |
|  ┌────────┐  ┌────────┐  ┌────────┐             |
|  │ 浅色   │  │ 深色   │  │ 跟随系统│             |
|  │ [预览] │  │ [预览] │  │ [预览] │             |
|  └────────┘  └────────┘  └────────┘             |
|                                                  |
|  选择默认语言                                    |
|  [ 简体中文 ▼ ]                                  |
|                                                  |
|                               [跳过] [下一步]    |
+--------------------------------------------------+
```

### 涉及的技术点

- 使用现有 `Stepper` 组件作为向导步骤指示器
- 使用现有 `Button`、`Card`、`RadioGroup` 组件构建选项卡片
- 使用 `AnimatedTransition` 实现轮播页面的滑动切换动画
- 使用 `Carousel` 组件（已有）作为轮播底层
- 使用 `Pinia` 存储"是否已完成引导"状态，避免重复展示

### 与现有 layouts/ 的衔接

- 新增 `src/components/layouts/WelcomeHeroLayout.vue`
- 新增 `src/components/layouts/OnboardingCarouselLayout.vue`
- 新增 `src/components/layouts/QuickSetupWizardLayout.vue`
- 在 `src/components/layouts/index.ts` 中导出
- 可替换现有的 `HomePage.vue` 为 `WelcomeHeroLayout` 的演示实例

### 需要新增/修改的文件

```
desktop-app/src/components/layouts/
  ├── WelcomeHeroLayout.vue         # 欢迎首页骨架
  ├── OnboardingCarouselLayout.vue  # 引导轮播骨架
  ├── QuickSetupWizardLayout.vue    # 快速设置向导骨架
  └── index.ts                      # 追加导出
```

**Props 设计（以 OnboardingCarouselLayout 为例）：**

```ts
interface OnboardingSlide {
  id: string
  title: string
  description: string
  image?: string              // 插画 URL 或本地路径
  icon?: Component            // 替代插画的图标
}

interface OnboardingCarouselLayoutProps {
  slides: OnboardingSlide[]
  allowSkip?: boolean         // 是否允许跳过，默认 true
  loop?: boolean              // 是否循环轮播，默认 false
}

// Events
// @finish — 用户点击"开始使用"或完成最后一步
// @skip   — 用户点击跳过
```

## 验收标准

- [ ] 三种布局均能在 `ComponentPlayground` 中独立预览
- [ ] `OnboardingCarouselLayout` 支持键盘左右方向键切换幻灯片
- [ ] `OnboardingCarouselLayout` 最后一步的"下一步"按钮文案自动变为"开始使用"
- [ ] `QuickSetupWizardLayout` 的第一步隐藏"上一步"按钮，最后一步显示"完成"
- [ ] 所有布局支持通过 `background` prop 或 slot 自定义背景（纯色/渐变/插画）
- [ ] 跳过/完成状态持久化到 `localStorage`，下次启动不再展示
- [ ] 暗色模式下文字、按钮、步骤指示器的对比度符合 WCAG AA 标准

## 优先级

P1 — 引导页对新用户留存很重要，但已有 `HomePage.vue` 作为基础替代，属于体验增强。

## 参考实现

- macOS 系统首次启动的"欢迎使用"设置向导
- Figma 桌面端的首次引导轮播
- Linear 的新手引导流程
- Notion 的模板选择欢迎页
