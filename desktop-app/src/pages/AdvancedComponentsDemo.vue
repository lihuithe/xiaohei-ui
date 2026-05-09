<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/advanced/DataTable.vue'
import Chart from '@/components/advanced/Chart.vue'
import Timeline from '@/components/advanced/Timeline.vue'
import Tree from '@/components/advanced/Tree.vue'
import KanbanBoard from '@/components/advanced/KanbanBoard.vue'
import ColorPicker from '@/components/advanced/ColorPicker.vue'
import RichTextEditor from '@/components/advanced/RichTextEditor.vue'
import DynamicForm from '@/components/forms/DynamicForm.vue'
import FormTemplateLibrary from '@/components/forms/FormTemplateLibrary.vue'
import FormDataImportExport from '@/components/forms/FormDataImportExport.vue'
import DraggableList from '@/components/interactive/DraggableList.vue'
import ContextMenu from '@/components/interactive/ContextMenu.vue'
import KeyboardShortcuts from '@/components/interactive/KeyboardShortcuts.vue'
import AnimatedList from '@/components/interactive/AnimatedList.vue'
import { z } from 'zod'
import { toast } from 'vue-sonner'

// 数据表格示例
const tableData = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '活跃' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: '活跃' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客', status: '禁用' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '编辑', status: '活跃' },
  { id: 5, name: '孙七', email: 'sunqi@example.com', role: '访客', status: '活跃' },
])

const tableColumns = ref([
  { accessorKey: 'id', header: 'ID', sortable: true },
  { accessorKey: 'name', header: '姓名', sortable: true },
  { accessorKey: 'email', header: '邮箱', sortable: true },
  { accessorKey: 'role', header: '角色', sortable: true },
  { accessorKey: 'status', header: '状态', sortable: true },
])

// 图表示例
const chartOption = ref({
  title: { text: '月度销售数据' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['销量'] },
  xAxis: {
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '销量',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
    },
  ],
})

// 时间线示例
const timelineItems = ref([
  {
    id: '1',
    title: '项目启动',
    description: '项目正式启动',
    date: '2024-01-01',
    status: 'completed',
  },
  {
    id: '2',
    title: '需求分析',
    description: '完成需求收集和分析',
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '3',
    title: '设计阶段',
    description: 'UI/UX 设计',
    date: '2024-02-01',
    status: 'in-progress',
  },
  {
    id: '4',
    title: '开发阶段',
    description: '核心功能开发',
    date: '2024-03-01',
    status: 'pending',
  },
  { id: '5', title: '测试上线', description: '测试并上线', date: '2024-04-01', status: 'pending' },
])

// 树形组件示例
const treeData = ref([
  {
    id: '1',
    label: '项目文档',
    children: [
      { id: '1-1', label: '需求文档' },
      { id: '1-2', label: '设计文档' },
      { id: '1-3', label: '技术方案' },
    ],
  },
  {
    id: '2',
    label: '代码库',
    children: [
      { id: '2-1', label: '前端代码' },
      { id: '2-2', label: '后端代码' },
    ],
  },
])

// 看板示例
const kanbanColumns = ref([
  {
    id: 'todo',
    title: '待办',
    cards: [
      {
        id: '1',
        title: '设计新功能原型',
        description: '完成用户界面设计',
        priority: 'high',
        tags: ['设计', 'UI'],
        dueDate: '2024-05-10',
      },
      {
        id: '2',
        title: '编写API文档',
        description: '更新接口文档',
        priority: 'medium',
        tags: ['文档'],
        dueDate: '2024-05-12',
      },
    ],
  },
  {
    id: 'inprogress',
    title: '进行中',
    cards: [
      {
        id: '3',
        title: '实现用户认证',
        description: 'JWT令牌系统',
        priority: 'high',
        tags: ['后端', '安全'],
        assignee: '张三',
        dueDate: '2024-05-15',
      },
    ],
  },
  {
    id: 'done',
    title: '完成',
    cards: [
      {
        id: '4',
        title: '数据库设计',
        description: '创建数据库结构',
        priority: 'low',
        tags: ['数据库'],
        dueDate: '2024-05-08',
      },
    ],
  },
])

// 颜色选择器示例
const selectedColor = ref('#3b82f6')
const selectedBgColor = ref('#10b981')

// 富文本示例
const richTextContent = ref(
  '<h2>欢迎使用富文本编辑器</h2><p>这是一个功能丰富的编辑器，支持：</p><ul><li><strong>粗体</strong>、<em>斜体</em>、<u>下划线</u></li><li>标题和列表</li><li>引用和代码块</li><li>链接和图片</li></ul><blockquote>好的工具能让工作更高效！</blockquote>'
)

// 动态表单示例
const formFields = ref([
  { name: 'name', label: '姓名', type: 'text', placeholder: '请输入姓名', required: true },
  { name: 'email', label: '邮箱', type: 'text', placeholder: '请输入邮箱', required: true },
  { name: 'password', label: '密码', type: 'password', placeholder: '请输入密码', required: true },
  {
    name: 'role',
    label: '角色',
    type: 'select',
    options: [
      { label: '管理员', value: 'admin' },
      { label: '编辑', value: 'editor' },
      { label: '访客', value: 'guest' },
    ],
  },
  { name: 'bio', label: '个人简介', type: 'textarea' },
  { name: 'newsletter', label: '订阅新闻', type: 'checkbox' },
])

const formSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符'),
})

// 表单模板库示例
const formTemplates = ref([
  {
    id: '1',
    name: '用户注册',
    description: '标准的用户注册表单',
    category: 'hr',
    fields: [],
  },
  {
    id: '2',
    name: '请假申请',
    description: '员工请假申请表单',
    category: 'hr',
    fields: [],
  },
  {
    id: '3',
    name: '报销申请',
    description: '费用报销申请',
    category: 'finance',
    fields: [],
  },
])

// 拖拽列表示例
const draggableItems = ref([
  { id: '1', label: '任务一' },
  { id: '2', label: '任务二' },
  { id: '3', label: '任务三' },
  { id: '4', label: '任务四' },
  { id: '5', label: '任务五' },
])

// 右键菜单示例
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuItems = ref([
  { id: '1', label: '复制', action: () => toast('复制') },
  { id: '2', label: '粘贴', action: () => toast('粘贴') },
  { id: '3', divider: true },
  { id: '4', label: '删除', action: () => toast('删除') },
])

// 键盘快捷键示例
const shortcuts = ref([
  { key: 's', ctrl: true, action: () => toast('保存'), description: '保存' },
  { key: 'n', ctrl: true, action: () => toast('新建'), description: '新建' },
  { key: 'f', ctrl: true, action: () => toast('搜索'), description: '搜索' },
])

// 动画列表示例
const animatedItems = ref([
  { id: '1', label: '项目一' },
  { id: '2', label: '项目二' },
  { id: '3', label: '项目三' },
])

function handleFormSubmit(values: unknown) {
  toast.success('表单提交成功!')
}

function handleRightClick(event: MouseEvent) {
  event.preventDefault()
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

// 看板组件引用
const kanbanRef = ref<InstanceType<typeof KanbanBoard> | null>(null)

onMounted(() => {
  if (kanbanRef.value && 'initSortable' in kanbanRef.value) {
    ;(kanbanRef.value as { initSortable: () => void }).initSortable()
  }
})

// 看板事件处理
function handleCardAdd(columnId: string, _card: unknown) {
  toast.success(`卡片已添加到 ${columnId}`)
}

function handleCardMove(_from: string, _to: string, _cardId: string, _index: number) {
  toast.info(`卡片已移动`)
}
</script>

<template>
  <div class="advanced-demo-page">
    <KeyboardShortcuts :shortcuts="shortcuts" />
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @close="contextMenuVisible = false"
    />

    <div class="demo-header">
      <h1>高级组件演示</h1>
      <p>展示 Phase 4 的高级数据展示、表单系统和交互体验组件</p>
    </div>

    <div class="demo-sections">
      <!-- 数据表格 -->
      <section class="demo-section">
        <h2>数据表格</h2>
        <DataTable :data="tableData" :columns="tableColumns" />
      </section>

      <!-- 图表 -->
      <section class="demo-section">
        <h2>图表组件</h2>
        <Chart :option="chartOption" height="300px" />
      </section>

      <!-- 时间线 -->
      <section class="demo-section">
        <h2>时间线</h2>
        <Timeline :items="timelineItems" />
      </section>

      <!-- 树形组件 -->
      <section class="demo-section">
        <h2>树形组件</h2>
        <Tree :data="treeData" :default-expand-all="true" />
      </section>

      <!-- 看板 -->
      <section class="demo-section">
        <h2>看板组件</h2>
        <KanbanBoard
          ref="kanbanRef"
          :columns="kanbanColumns"
          @card-add="handleCardAdd"
          @card-move="handleCardMove"
        />
      </section>

      <!-- 颜色选择器 -->
      <section class="demo-section">
        <h2>颜色选择器</h2>
        <div class="color-picker-demo">
          <div class="picker-row">
            <span>主题色：</span>
            <ColorPicker v-model="selectedColor" />
            <span class="color-preview-box" :style="{ backgroundColor: selectedColor }"></span>
          </div>
          <div class="picker-row">
            <span>背景色：</span>
            <ColorPicker v-model="selectedBgColor" />
            <span class="color-preview-box" :style="{ backgroundColor: selectedBgColor }"></span>
          </div>
        </div>
      </section>

      <!-- 富文本编辑器 -->
      <section class="demo-section">
        <h2>富文本编辑器</h2>
        <RichTextEditor v-model="richTextContent" placeholder="开始编辑..." />
      </section>

      <!-- 动态表单 -->
      <section class="demo-section">
        <h2>动态表单</h2>
        <DynamicForm :fields="formFields" :schema="formSchema" @submit="handleFormSubmit" />
      </section>

      <!-- 表单模板库 -->
      <section class="demo-section">
        <h2>表单模板库</h2>
        <FormTemplateLibrary :templates="formTemplates" />
      </section>

      <!-- 表单数据导入导出 -->
      <section class="demo-section">
        <h2>表单数据导入导出</h2>
        <FormDataImportExport :data="tableData" filename="demo-data" />
      </section>

      <!-- 拖拽列表 -->
      <section class="demo-section">
        <h2>拖拽列表</h2>
        <DraggableList v-model:items="draggableItems">
          <div v-for="item in draggableItems" :key="item.id" class="draggable-item">
            {{ item.label }}
          </div>
        </DraggableList>
      </section>

      <!-- 右键菜单区域 -->
      <section class="demo-section">
        <h2>右键菜单</h2>
        <div class="context-menu-area" @contextmenu="handleRightClick">
          在此区域右键点击查看菜单
        </div>
      </section>

      <!-- 动画列表 -->
      <section class="demo-section">
        <h2>动画列表</h2>
        <button
          class="add-btn"
          @click="animatedItems.push({ id: Date.now().toString(), label: `新项 ${Date.now()}` })"
        >
          添加项目
        </button>
        <AnimatedList>
          <div v-for="item in animatedItems" :key="item.id" class="animated-item">
            {{ item.label }}
            <button
              class="remove-btn"
              @click="animatedItems = animatedItems.filter((i) => i.id !== item.id)"
            >
              ×
            </button>
          </div>
        </AnimatedList>
      </section>
    </div>
  </div>
</template>

<style scoped>
.advanced-demo-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  margin-bottom: 32px;
}

.demo-header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.demo-header p {
  color: var(--muted-foreground);
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.demo-section {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 24px;
  background: var(--background);
}

.demo-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.draggable-item {
  padding: 12px 16px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  cursor: grab;
  user-select: none;
}

.draggable-item:active {
  cursor: grabbing;
}

.context-menu-area {
  padding: 40px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  text-align: center;
  color: var(--muted-foreground);
}

.add-btn {
  margin-bottom: 12px;
  padding: 8px 16px;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.animated-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.remove-btn {
  border: none;
  background: #ef4444;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 新增样式 */
.color-picker-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-preview-box {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

/* 响应式 */
@media (max-width: 768px) {
  .advanced-demo-page {
    padding: 16px;
  }

  .demo-section {
    padding: 16px;
  }

  .demo-header h1 {
    font-size: 24px;
  }

  .demo-section h2 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .picker-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
