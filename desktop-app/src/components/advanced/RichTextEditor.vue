<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  MoreHorizontal,
} from 'lucide-vue-next'

interface RichTextEditorProps {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<RichTextEditorProps>(), {
  modelValue: '',
  placeholder: '请输入内容...',
})

const emit = defineEmits<{
  (e: 'update:modelValue', content: string): void
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const isEditorReady = ref(false)

function execCommand(command: string, value: string | null = null) {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
}

function toggleBold() {
  execCommand('bold')
  updateContent()
}

function toggleItalic() {
  execCommand('italic')
  updateContent()
}

function toggleUnderline() {
  execCommand('underline')
  updateContent()
}

function toggleStrikethrough() {
  execCommand('strikeThrough')
  updateContent()
}

function toggleQuote() {
  execCommand('formatBlock', 'blockquote')
  updateContent()
}

function toggleCode() {
  execCommand('formatBlock', 'pre')
  updateContent()
}

function toggleH1() {
  execCommand('formatBlock', 'h1')
  updateContent()
}

function toggleH2() {
  execCommand('formatBlock', 'h2')
  updateContent()
}

function toggleH3() {
  execCommand('formatBlock', 'h3')
  updateContent()
}

function toggleList() {
  execCommand('insertUnorderedList')
  updateContent()
}

function toggleOrderedList() {
  execCommand('insertOrderedList')
  updateContent()
}

function alignLeft() {
  execCommand('justifyLeft')
  updateContent()
}

function alignCenter() {
  execCommand('justifyCenter')
  updateContent()
}

function alignRight() {
  execCommand('justifyRight')
  updateContent()
}

function insertLink() {
  const url = prompt('请输入链接地址:')
  if (url) {
    execCommand('createLink', url)
    updateContent()
  }
}

function insertImage() {
  const url = prompt('请输入图片地址:')
  if (url) {
    execCommand('insertImage', url)
    updateContent()
  }
}

function undo() {
  execCommand('undo')
  updateContent()
}

function redo() {
  execCommand('redo')
  updateContent()
}

function updateContent() {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

function handleInput() {
  updateContent()
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (editorRef.value && isEditorReady.value) {
      if (editorRef.value.innerHTML !== newValue) {
        editorRef.value.innerHTML = newValue
      }
    }
  }
)

onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue
    isEditorReady.value = true
  }
})
</script>

<template>
  <div class="rich-text-editor" role="textbox" aria-multiline="true" aria-label="富文本编辑器">
    <div class="editor-toolbar" role="toolbar" aria-label="格式工具栏">
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="撤销" @click="undo">
          <Undo :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="重做" @click="redo">
          <Redo :size="16" />
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="粗体" @click="toggleBold">
          <Bold :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="斜体" @click="toggleItalic">
          <Italic :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="下划线" @click="toggleUnderline">
          <Underline :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="删除线" @click="toggleStrikethrough">
          <Strikethrough :size="16" />
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="标题1" @click="toggleH1">
          <Heading1 :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="标题2" @click="toggleH2">
          <Heading2 :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="标题3" @click="toggleH3">
          <Heading3 :size="16" />
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="无序列表" @click="toggleList">
          <List :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="有序列表" @click="toggleOrderedList">
          <ListOrdered :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="引用" @click="toggleQuote">
          <Quote :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="代码" @click="toggleCode">
          <Code :size="16" />
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="左对齐" @click="alignLeft">
          <AlignLeft :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="居中" @click="alignCenter">
          <AlignCenter :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="右对齐" @click="alignRight">
          <AlignRight :size="16" />
        </button>
      </div>
      <div class="toolbar-separator"></div>
      <div class="toolbar-group">
        <button class="toolbar-btn" aria-label="插入链接" @click="insertLink">
          <Link :size="16" />
        </button>
        <button class="toolbar-btn" aria-label="插入图片" @click="insertImage">
          <Image :size="16" />
        </button>
      </div>
    </div>
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
    ></div>
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--background);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--accent);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 8px;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--foreground);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.toolbar-btn:hover {
  background: var(--muted);
}

.toolbar-btn:active {
  background: var(--primary);
  color: var(--primary-foreground);
}

.editor-content {
  padding: 16px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.6;
  font-size: 14px;
}

.editor-content:focus {
  outline: none;
}

.editor-content:empty:before {
  content: attr(data-placeholder);
  color: var(--muted-foreground);
  pointer-events: none;
}

.editor-content h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 16px 0 8px;
}

.editor-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 14px 0 6px;
}

.editor-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 12px 0 6px;
}

.editor-content p {
  margin: 0 0 12px;
}

.editor-content blockquote {
  border-left: 3px solid var(--primary);
  padding-left: 12px;
  margin: 12px 0;
  color: var(--muted-foreground);
  font-style: italic;
}

.editor-content pre {
  background: var(--muted);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-family: monospace;
  overflow-x: auto;
  margin: 12px 0;
}

.editor-content ul,
.editor-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-content li {
  margin: 4px 0;
}

.editor-content a {
  color: var(--primary);
  text-decoration: underline;
}

.editor-content img {
  max-width: 100%;
  border-radius: var(--radius-sm);
  margin: 12px 0;
}

@media (max-width: 640px) {
  .editor-toolbar {
    padding: 6px 8px;
  }
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  .toolbar-separator {
    margin: 0 4px;
  }
}
</style>
