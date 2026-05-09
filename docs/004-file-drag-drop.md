# 文件拖拽处理模板（File Drag & Drop Template）

## 功能背景/动机

文件拖拽是桌面应用区别于 Web 应用的核心交互能力之一。用户期望能够：从文件管理器拖拽文件到应用窗口、在应用内部拖拽排序列表项、拖拽内容到外部应用。目前脚手架完全没有提供任何拖拽相关的模板能力，而几乎每个 Electron 应用都会涉及文件操作或拖拽交互。提供一套完整的拖拽处理模板，能让开发者避免从零处理 `dragover`/`drop` 事件、文件路径获取、拖拽视觉反馈等繁琐细节。

本功能覆盖三个典型场景：
1. **外部文件拖入应用**：如导入文件、上传附件、打开文档
2. **应用内拖拽排序**：如侧边栏项目重排、列表项排序
3. **内容拖出到外部**：如拖拽保存文件到桌面、拖拽文本到编辑器

## 功能描述

提供一套可组合的拖拽能力：

1. **`useFileDrop` composable**：处理外部文件拖入，支持文件类型过滤、多文件、拖拽区域高亮
2. **`useDragSort` composable**：列表项拖拽排序，支持垂直/水平方向、嵌套列表
3. **`useDragOut` composable**：将内容拖拽到外部应用（基于 Electron `webContents.startDrag`）
4. **视觉反馈组件**：拖拽进入时的区域高亮、放置提示、拖拽手柄图标
5. **文件预览模板**：拖入后展示文件信息（名称、大小、类型、预览图）的通用卡片

## 目标用户

- 需要文件导入/上传功能的工具类应用开发者
- 需要列表排序交互的数据管理类应用开发者
- 需要与外部应用进行内容交换的协作类应用开发者

## 详细设计

### 交互流程

```
外部文件拖入：
用户拖拽文件到窗口 → 经过有效区域时显示高亮边框 → 松开鼠标
  → useFileDrop 解析 files/getFilePath (Electron 提供真实路径)
  → 过滤非允许类型 → 展示文件预览卡片
  → 触发开发者注册的 onDrop 回调

应用内拖拽排序：
用户按住拖拽手柄 → 元素跟随鼠标移动（ghost image）→ 经过其他项时显示插入指示线
  → 松开鼠标 → useDragSort 计算新顺序 → 更新数据模型 → 触发 onReorder 回调

内容拖出到外部：
用户按住应用内文件/图片 → 开始拖拽 → 离开窗口时调用 startDrag
  → 外部应用（如文件管理器）显示放置光标 → 松开鼠标完成文件写出
```

### 涉及的技术点

- **渲染进程**：HTML5 Drag and Drop API、`dragover`/`dragleave`/`drop` 事件处理
- **主进程**：`ipcMain.handle('get-file-path', ...)` 将拖入的 File 对象映射为真实文件系统路径；`webContents.startDrag` 实现拖出
- **文件类型检测**：基于扩展名和 MIME type 的双重过滤
- **视觉反馈**：CSS transition 实现高亮动画、ghost image 自定义
- **可访问性**：键盘替代方案（a11y），确保无法使用鼠标的用户也能完成文件选择和排序

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/composables/useLazyLoad.ts` | 拖入的图片文件预览可复用懒加载逻辑 |
| `src/components/ui/card/` | 文件预览卡片基于 Card 组件构建 |
| `src/components/ui/scroll-area/` | 拖拽排序列表通常放在 ScrollArea 内 |
| `electron/preload.cjs` | 新增 `getFilePath(file)` 和 `startDrag(options)` |
| `src/utils/format.ts` | 复用 `formatNumber` 展示文件大小 |

### 需要新增/修改的文件

**新增文件：**
- `src/composables/useFileDrop.ts` — 外部文件拖入处理
- `src/composables/useDragSort.ts` — 应用内列表拖拽排序
- `src/composables/useDragOut.ts` — 内容拖出到外部
- `src/components/FileDropZone.vue` — 文件放置区域组件（含高亮动画）
- `src/components/FilePreviewCard.vue` — 文件预览信息卡片
- `src/components/DragSortList.vue` — 可拖拽排序的列表组件
- `src/components/DragHandle.vue` — 拖拽手柄图标组件
- `src/utils/file.ts` — 文件工具函数（格式化大小、检测类型、读取为 DataURL 等）
- `src/types/file.ts` — DroppedFile、FileFilter、DragSortItem 等类型

**修改文件：**
- `electron/main.ts` — 添加文件路径解析和 startDrag IPC handler
- `electron/preload.cjs` — 暴露拖拽相关 API
- `src/App.vue` — 可在适当位置添加全局文件拖入的示例区域

### 核心数据结构

```typescript
// src/types/file.ts
export interface FileFilter {
  name: string                    // 展示名称，如 "图片"
  extensions: string[]            // 如 ['png', 'jpg', 'jpeg', 'gif']
  mimeTypes?: string[]            // 如 ['image/*']
}

export interface DroppedFile {
  name: string
  size: number
  type: string
  path: string                    // Electron 提供的真实路径
  lastModified: number
  previewUrl?: string             // 图片/视频预览
}

export interface FileDropOptions {
  accept?: FileFilter[]           // 允许的文件类型，空则接受所有
  multiple?: boolean              // 是否允许多文件，默认 true
  maxSize?: number                // 单个文件最大字节数
  maxCount?: number               // 最大文件数量
  onDragEnter?: () => void
  onDragLeave?: () => void
  onDrop?: (files: DroppedFile[], rejected: RejectedFile[]) => void
}

export interface RejectedFile {
  file: DroppedFile
  reason: 'type' | 'size' | 'count'
}

export interface DragSortItem {
  id: string
  [key: string]: unknown
}

export interface DragSortOptions<T extends DragSortItem> {
  direction?: 'vertical' | 'horizontal'
  onReorder: (items: T[]) => void
  handleSelector?: string         // 拖拽手柄 CSS 选择器，为空则整项可拖拽
}
```

### 关键实现策略

1. **真实文件路径获取**：HTML5 DnD 的 `DataTransferItem.getAsFile()` 返回的是 Web File API 对象，没有真实路径。需通过主进程 IPC `webUtils.getPathForFile(file)`（Electron 32+）或 `ipcRenderer.invoke('get-file-path', file)` 获取
2. **多文件拖拽**：`dataTransfer.files` 读取所有文件，逐一验证过滤
3. **拖拽排序的 ghost image**：使用 `setDragImage` 自定义拖拽时的半透明预览，避免默认的整页截图
4. **嵌套列表排序**：通过 `dataTransfer.setData('application/json', ...)` 传递层级路径信息
5. **拖出文件到外部**：主进程使用 `webContents.startDrag({ file: path, icon: iconPath })`，需要预先生成文件图标

### 使用示例（开发者视角）

```vue
<!-- 文件拖入 -->
<FileDropZone
  :accept="[{ name: '图片', extensions: ['png', 'jpg'] }]"
  :max-size="10 * 1024 * 1024"
  @drop="handleFiles"
>
  <p>拖拽文件到此处，或点击选择</p>
</FileDropZone>

<!-- 列表排序 -->
<DragSortList v-model="items" direction="vertical" handle>
  <template #item="{ item }">
    <div class="flex items-center gap-2">
      <DragHandle />
      <span>{{ item.name }}</span>
    </div>
  </template>
</DragSortList>
```

## 验收标准

- [ ] 从文件管理器拖拽文件到应用窗口，有效区域出现高亮边框反馈
- [ ] 拖入后可通过 API 获取文件的真实文件系统路径（而非 blob URL）
- [ ] 支持按文件扩展名和 MIME 类型过滤，不符合条件的文件被拒绝并给出原因
- [ ] 提供 `FileDropZone` 组件，支持拖拽和点击两种文件选择方式
- [ ] 提供 `DragSortList` 组件，支持垂直/水平拖拽排序，带动画过渡
- [ ] 拖拽排序后数据模型正确更新，且触发 `onReorder` 回调
- [ ] 支持拖拽手柄模式（仅手柄可发起拖拽）和整项拖拽模式
- [ ] 提供文件预览卡片组件，展示文件名、大小、类型图标、图片缩略图
- [ ] 提供至少 2 个完整示例（文件导入页面、可排序侧边栏）
- [ ] 所有拖拽操作在视觉上具有明确反馈（高亮、插入指示线、ghost image）

## 优先级

**P1** — 文件拖拽是桌面应用的高频交互场景，模板价值高；但实现涉及渲染进程和主进程配合，复杂度中等，可作为第一批的最后一个功能。

## 参考实现

- [Electron Drag and Drop File](https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop) — 官方拖出文件示例
- [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd) — 拖拽排序的交互设计参考
- [Vue Draggable Next](https://github.com/SortableJS/vue.draggable.next) — Vue 生态拖拽排序实现思路
- [GitHub Desktop 文件拖拽](https://docs.github.com/en/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop) — 拖入文件夹导入仓库
