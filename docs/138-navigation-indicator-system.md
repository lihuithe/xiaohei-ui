# 导航指示器系统

## 功能背景/动机

当前脚手架提供了 `Breadcrumb`、`Stepper`、`Pagination`、`Tabs` 等导航组件，但这些组件的视觉表现较为基础，缺乏一套系统化的**导航状态指示**规范。在桌面应用中，导航指示器是帮助用户理解"当前在哪"、"已经走了多远"、"还能去哪"的核心视觉线索，但现有实现存在以下不足：

1. **面包屑缺乏路径深度感**：`Breadcrumb` 只是简单的文字链接加斜杠分隔，无法表达层级深度或当前页面的重要性。
2. **步骤条状态表达单一**：`Stepper` 仅有完成/进行中/待办三种状态，缺少错误、警告、跳过等复杂状态的视觉区分。
3. **分页器过于简陋**：`Pagination` 只有页码按钮，缺少"当前页/总页数"的信息密度、快速跳转、每页数量选择等增强功能。
4. **标签页指示器无动画**：`Tabs` 的底部指示条是瞬间切换，缺少滑动动画，用户难以感知切换的方向。
5. **缺少进度型导航**：如向导式的步骤进度（Wizard）、垂直时间线导航、侧边栏折叠/展开的层级指示等。
6. **当前位置缺乏高亮策略**：用户在不同页面间切换时，没有统一的"当前位置高亮"规范（如侧边栏菜单、顶部导航）。

提供一套**导航指示器系统**，能让所有导航组件在视觉和动画上形成统一的语言，帮助用户建立清晰的空间认知。

## 功能描述

构建一套**导航指示器系统**，包含：

1. **Breadcrumb 增强**：
   - 路径深度可视化：当前页面文字加粗并带有微妙背景高亮，父级页面为普通链接色。
   - 分隔符变体：支持 `slash`（默认）、`arrow`（→）、`chevron`（›）、`dot`（•）四种分隔符样式。
   - 路径折叠：当路径过长时，中间部分折叠为 "..."，点击后下拉展开完整路径。
   - 首页图标：根节点可配置为 Home 图标而非文字 "首页"。
   - 当前页不可点击视觉：当前页面文字无 Hover 效果，光标为默认箭头（非手型）。
2. **Stepper/Wizard 增强**：
   - 状态扩展：在原有 `completed` / `current` / `pending` 基础上，增加 `error`（步骤出错，红色图标）、`warning`（步骤有警告，橙色图标）、`skipped`（步骤被跳过，虚线连接）。
   - 连接线动画：步骤间的连接线从已完成步骤向当前步骤以流动动画延伸。
   - 步骤内容展开：当前步骤的内容区域以高度动画展开，非当前步骤收起。
   - 垂直 Stepper：支持垂直排列（常用于设置向导、表单分步）。
   - 步骤验证指示：步骤标题旁显示验证状态图标（对勾/警告/错误）。
3. **Pagination 增强**：
   - 信息密度：显示 "第 X 页，共 Y 页，Z 条记录"。
   - 快速跳转：输入框直接输入页码跳转。
   - 每页数量选择器：下拉选择每页显示 10/20/50/100 条。
   - 边界指示：当前在第一页时"上一页"禁用并视觉弱化，最后一页时"下一页"同理。
   - 页码出现动画：切换页码时，新页码内容以淡入动画出现。
4. **Tabs 指示器滑动动画**：
   - `Tabs` 底部（或侧边）指示条在选项切换时以滑动动画跟随移动，而非瞬间跳转。
   - 支持 `indicatorStyle`：`line`（下划线）、`pill`（胶囊背景块）、`dot`（圆点）。
   - 支持 `indicatorAnimation`：`slide`（滑动）、`fade`（淡入淡出）、`scale`（缩放）。
   - 支持 `orientation`：`horizontal`（底部指示）和 `vertical`（侧边指示）。
5. **当前位置高亮规范**：
   - `ActiveIndicator` 组件：可复用的"当前位置高亮"指示器，用于：
     - 侧边栏菜单当前项的左侧竖条高亮。
     - 顶部导航当前项的下划线/背景高亮。
     - 树形导航当前项的整行背景高亮。
   - 高亮动画：切换当前项时，高亮指示器以滑动动画从旧项移动到新项（300ms，ease-out-expo）。
6. **Timeline 时间线导航**：
   - 垂直时间线组件，用于展示历史记录、版本日志、操作审计等场景。
   - 支持 `type`：`default`（节点+线）、`alternate`（左右交替排列）。
   - 节点状态：`completed`（实心）、`current`（脉冲动画）、`pending`（空心）。
   - 支持自定义节点图标和内容插槽。

## 目标用户

- **需要为复杂应用构建多级导航、向导流程的开发者**。
- **需要为设置页、表单页提供步骤引导的开发者**。
- **追求"用户始终知道自己在哪"清晰导航体验的产品**。

## 详细设计

### 视觉/动画效果描述

**Breadcrumb 增强：**
```css
.breadcrumb-current {
  font-weight: 600;
  color: var(--foreground);
  background: var(--muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}
.breadcrumb-separator-arrow::after {
  content: '→';
  color: var(--muted-foreground);
  margin: 0 6px;
}
```

**Stepper 连接线流动动画：**
```css
.stepper-connector {
  background: linear-gradient(90deg, var(--primary) var(--progress, 0%), var(--border) var(--progress, 0%));
  transition: --progress 0.5s ease-out;
}
.stepper-connector.is-completed {
  --progress: 100%;
}
```

**Tabs 滑动指示器：**
```css
.tabs-indicator {
  position: absolute;
  bottom: 0;
  height: 2px;
  background: var(--primary);
  border-radius: 1px;
  transition: left 0.3s var(--ease-out-expo), width 0.3s var(--ease-out-expo);
}
.tabs-indicator.pill {
  height: calc(100% - 4px);
  bottom: 2px;
  border-radius: var(--radius-md);
  background: var(--primary / 0.1);
}
```

**ActiveIndicator 滑动：**
```css
.active-indicator {
  position: absolute;
  left: 0;
  width: 3px;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
  transition: top 0.3s var(--ease-out-expo), height 0.3s var(--ease-out-expo);
}
```

**Timeline：**
```css
.timeline-node {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--background);
}
.timeline-node.is-completed {
  background: var(--primary);
  border-color: var(--primary);
}
.timeline-node.is-current {
  border-color: var(--primary);
  background: var(--background);
  box-shadow: 0 0 0 4px var(--primary / 0.2);
  animation: timeline-pulse 2s ease-in-out infinite;
}
@keyframes timeline-pulse {
  0%, 100% { box-shadow: 0 0 0 4px var(--primary / 0.2); }
  50% { box-shadow: 0 0 0 8px var(--primary / 0.1); }
}
```

### 涉及的技术点

- **CSS 自定义属性动画**：Stepper 连接线使用 `--progress` CSS 变量过渡。
- **动态位置计算**：Tabs 指示器和 ActiveIndicator 需要通过 JS 计算目标元素的 `offsetLeft`/`offsetTop` 和 `offsetWidth`/`offsetHeight`，然后应用到指示器上。
- **Vue `watch` + `nextTick`**：监听当前项变化，在 DOM 更新后重新计算指示器位置。
- **ResizeObserver**：窗口大小变化或内容变化时，重新校准指示器位置。
- **`@property`（CSS Houdini）**：注册 `--progress` 为可动画的 CSS 属性（Chrome 支持），或使用 `transition` 配合 JS 更新。

### 与现有架构的衔接方式

- **修改 `src/components/ui/breadcrumb/`**：
  - 扩展 `Breadcrumb` 组件的 `separator` prop，支持多种样式。
  - 增加路径折叠逻辑。
- **修改 `src/components/ui/stepper/`**：
  - 扩展 `StepperIndicator.vue` 支持 `error`、`warning`、`skipped` 状态。
  - 增加连接线流动动画。
  - 新增垂直排列支持。
- **修改 `src/components/ui/pagination/`**：
  - 增加信息展示、快速跳转输入框、每页数量选择器。
- **修改 `src/components/ui/tabs/`**：
  - 增加滑动指示器（`TabsIndicator.vue`）。
  - 扩展 `indicatorStyle`、`indicatorAnimation`、`orientation` props。
- **新增 `src/components/ui/navigation/`**：
  - `ActiveIndicator.vue`：可复用的高亮指示器。
- **新增 `src/components/ui/timeline/`**：
  - `Timeline.vue`、`TimelineItem.vue`、`TimelineNode.vue`。
- **修改 `src/components/Sidebar.vue`**：
  - 接入 `ActiveIndicator` 作为当前项高亮。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「导航指示器」演示区。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/breadcrumb/Breadcrumb.vue` | 修改 | 扩展分隔符、路径折叠 |
| `src/components/ui/stepper/StepperIndicator.vue` | 修改 | 扩展错误/警告/跳过状态 |
| `src/components/ui/stepper/StepperSeparator.vue` | 修改 | 连接线流动动画 |
| `src/components/ui/pagination/Pagination.vue` | 修改 | 信息展示、快速跳转 |
| `src/components/ui/tabs/TabsIndicator.vue` | 新增 | 滑动指示器 |
| `src/components/ui/tabs/TabsList.vue` | 修改 | 接入滑动指示器 |
| `src/components/ui/navigation/ActiveIndicator.vue` | 新增 | 当前位置高亮指示器 |
| `src/components/ui/timeline/Timeline.vue` | 新增 | 时间线容器 |
| `src/components/ui/timeline/TimelineItem.vue` | 新增 | 时间线项 |
| `src/components/Sidebar.vue` | 修改 | 接入 ActiveIndicator |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增导航指示器演示区 |

## 验收标准

- [ ] Breadcrumb 支持 `slash`、`arrow`、`chevron`、`dot` 四种分隔符，路径过长时中间折叠。
- [ ] Stepper 支持 `completed`/`current`/`pending`/`error`/`warning`/`skipped` 六种状态，连接线有流动动画。
- [ ] Stepper 支持垂直排列，步骤内容区以高度动画展开/收起。
- [ ] Pagination 显示当前页/总页数/总记录数，支持快速跳转和每页数量选择。
- [ ] Tabs 指示器支持 `line`/`pill`/`dot` 三种样式，切换时以滑动动画跟随。
- [ ] Tabs 支持 `horizontal` 和 `vertical` 两种方向。
- [ ] `ActiveIndicator` 可在侧边栏、顶部导航中复用，切换时以滑动动画移动。
- [ ] Timeline 支持 `default` 和 `alternate` 两种排列，节点支持 `completed`/`current`/`pending` 三种状态。
- [ ] 所有导航指示器颜色使用主题 Token，深浅模式自动适配。
- [ ] ComponentPlayground 中可交互式预览所有导航指示器效果。

## 优先级

P1

## 参考实现

- [Material Design 3 - Navigation](https://m3.material.io/components/navigation-rail/overview)：Material Design 导航组件规范。
- [Ant Design Steps](https://ant.design/components/steps-cn)：步骤条的丰富状态和垂直排列。
- [Chakra UI Breadcrumb](https://v2.chakra-ui.com/docs/components/breadcrumb)：面包屑的分隔符变体。
- [Apple Design - Navigation](https://developer.apple.com/design/human-interface-guidelines/navigation)：macOS/iOS 导航设计指南。
- [shadcn-ui Tabs](https://ui.shadcn.com/docs/components/tabs)：标签页的基础实现参考。
