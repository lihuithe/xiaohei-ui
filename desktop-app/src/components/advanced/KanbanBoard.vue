<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, GripVertical, Trash2, Calendar, Users } from 'lucide-vue-next'
import Sortable from 'sortablejs'

export interface KanbanCard {
  id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  tags?: string[]
}

export interface KanbanColumn {
  id: string
  title: string
  color?: string
  cards: KanbanCard[]
}

interface KanbanProps {
  columns: KanbanColumn[]
  draggable?: boolean
  allowAddCard?: boolean
  allowAddColumn?: boolean
}

const props = withDefaults(defineProps<KanbanProps>(), {
  draggable: true,
  allowAddCard: true,
  allowAddColumn: true,
})

const emit = defineEmits<{
  (e: 'card-add', columnId: string, card: KanbanCard): void
  (e: 'card-move', fromColumnId: string, toColumnId: string, cardId: string, toIndex: number): void
  (e: 'card-delete', columnId: string, cardId: string): void
  (e: 'card-click', card: KanbanCard): void
  (e: 'column-add', column: KanbanColumn): void
}>()

const localColumns = ref<KanbanColumn[]>([...props.columns])
const newColumnTitle = ref('')
const showAddColumnInput = ref(false)
const addingCardColumnId = ref<string | null>(null)
const newCardTitle = ref('')
const newCardDescription = ref('')

function initSortable() {
  if (!props.draggable) return

  setTimeout(() => {
    document.querySelectorAll('.kanban-column-list').forEach((list) => {
      Sortable.create(list as HTMLElement, {
        group: 'kanban',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: (evt) => {
          const fromColumnId = evt.from.getAttribute('data-column-id') || ''
          const toColumnId = evt.to.getAttribute('data-column-id') || ''
          const cardId = evt.item.getAttribute('data-card-id') || ''
          const toIndex = evt.newIndex || 0
          if (fromColumnId && toColumnId && cardId) {
            emit('card-move', fromColumnId, toColumnId, cardId, toIndex)
          }
        },
      })
    })
  }, 100)
}

function addColumn() {
  if (!newColumnTitle.value.trim()) return
  const newColumn: KanbanColumn = {
    id: Date.now().toString(),
    title: newColumnTitle.value,
    cards: [],
  }
  emit('column-add', newColumn)
  localColumns.value.push(newColumn)
  newColumnTitle.value = ''
  showAddColumnInput.value = false
}

function startAddCard(columnId: string) {
  addingCardColumnId.value = columnId
  newCardTitle.value = ''
  newCardDescription.value = ''
}

function cancelAddCard() {
  addingCardColumnId.value = null
}

function addCard(columnId: string) {
  if (!newCardTitle.value.trim()) return
  const newCard: KanbanCard = {
    id: Date.now().toString(),
    title: newCardTitle.value,
    description: newCardDescription.value,
    priority: 'medium',
  }
  const column = localColumns.value.find((c) => c.id === columnId)
  if (column) {
    column.cards.push(newCard)
  }
  emit('card-add', columnId, newCard)
  addingCardColumnId.value = null
}

function deleteCard(columnId: string, cardId: string) {
  const column = localColumns.value.find((c) => c.id === columnId)
  if (column) {
    column.cards = column.cards.filter((card) => card.id !== cardId)
  }
  emit('card-delete', columnId, cardId)
}

function getPriorityColor(priority?: string) {
  switch (priority) {
    case 'high':
      return '#ef4444'
    case 'medium':
      return '#f59e0b'
    case 'low':
      return '#22c55e'
    default:
      return '#6b7280'
  }
}

defineExpose({
  initSortable,
})
</script>

<template>
  <div class="kanban-board" role="region" aria-label="看板任务管理">
    <div class="kanban-columns">
      <div
        v-for="column in localColumns"
        :key="column.id"
        class="kanban-column"
        role="group"
        :aria-label="`列: ${column.title}`"
      >
        <div class="column-header">
          <div class="column-title">
            <span class="column-title-text">{{ column.title }}</span>
            <span class="column-count">{{ column.cards.length }}</span>
          </div>
          <button
            v-if="allowAddCard"
            class="add-card-btn"
            aria-label="添加卡片"
            @click="startAddCard(column.id)"
          >
            <Plus :size="16" />
          </button>
        </div>
        <div class="kanban-column-list" :data-column-id="column.id" role="list">
          <template v-for="card in column.cards" :key="card.id">
            <div
              class="kanban-card"
              :data-card-id="card.id"
              role="listitem"
              @click="$emit('card-click', card)"
            >
              <div class="card-header">
                <GripVertical :size="16" class="drag-handle" />
                <button
                  class="delete-card-btn"
                  aria-label="删除卡片"
                  @click.stop="deleteCard(column.id, card.id)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
              <h4 class="card-title">{{ card.title }}</h4>
              <p v-if="card.description" class="card-description">{{ card.description }}</p>
              <div v-if="card.tags?.length || card.dueDate || card.assignee" class="card-footer">
                <div v-if="card.priority" class="card-priority">
                  <span
                    class="priority-dot"
                    :style="{ backgroundColor: getPriorityColor(card.priority) }"
                  ></span>
                </div>
                <div v-if="card.tags" class="card-tags">
                  <span v-for="tag in card.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <div v-if="card.dueDate" class="card-due-date">
                  <Calendar :size="14" />
                  <span>{{ card.dueDate }}</span>
                </div>
                <div v-if="card.assignee" class="card-assignee">
                  <Users :size="14" />
                  <span>{{ card.assignee }}</span>
                </div>
              </div>
            </div>
          </template>
          <div v-if="addingCardColumnId === column.id" class="add-card-form" role="form">
            <input
              v-model="newCardTitle"
              class="new-card-title"
              placeholder="卡片标题..."
              autofocus
              @keyup.enter="addCard(column.id)"
              @keyup.escape="cancelAddCard"
            />
            <textarea
              v-model="newCardDescription"
              class="new-card-desc"
              placeholder="描述（可选）"
              rows="2"
            />
            <div class="add-card-actions">
              <button class="add-card-submit" @click="addCard(column.id)">添加</button>
              <button class="add-card-cancel" @click="cancelAddCard">取消</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="allowAddColumn" class="add-column">
        <button
          v-if="!showAddColumnInput"
          class="add-column-btn"
          @click="showAddColumnInput = true"
        >
          <Plus :size="16" />
          <span>添加列</span>
        </button>
        <div v-else class="add-column-form">
          <input
            v-model="newColumnTitle"
            class="new-column-input"
            placeholder="列名..."
            autofocus
            @keyup.enter="addColumn"
            @keyup.escape="
              showAddColumnInput = false
              newColumnTitle = ''
            "
          />
          <div class="add-column-actions">
            <button class="add-column-submit" @click="addColumn">添加</button>
            <button
              class="add-column-cancel"
              @click="
                showAddColumnInput = false
                newColumnTitle = ''
              "
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kanban-board {
  width: 100%;
  overflow-x: auto;
  padding: 16px 0;
}

.kanban-columns {
  display: flex;
  gap: 16px;
  min-width: max-content;
}

.kanban-column {
  width: 300px;
  background: var(--accent);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.column-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.column-count {
  background: var(--muted);
  color: var(--muted-foreground);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.add-card-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.add-card-btn:hover {
  background: var(--muted);
  color: var(--foreground);
}

.kanban-column-list {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kanban-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: grab;
  transition:
    box-shadow 0.15s,
    transform 0.15s;
}

.kanban-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.kanban-card:active {
  cursor: grabbing;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.drag-handle {
  color: var(--muted-foreground);
  opacity: 0.5;
}

.delete-card-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
}

.kanban-card:hover .delete-card-btn {
  opacity: 1;
}

.delete-card-btn:hover {
  background: var(--destructive);
  color: white;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--foreground);
}

.card-description {
  font-size: 12px;
  color: var(--muted-foreground);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.card-priority {
  display: flex;
  align-items: center;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.card-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--muted);
  color: var(--muted-foreground);
  border-radius: 4px;
}

.card-due-date,
.card-assignee {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--muted-foreground);
}

.add-card-form {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-card-title,
.new-card-desc {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
}

.new-card-desc {
  resize: none;
}

.add-card-actions {
  display: flex;
  gap: 8px;
}

.add-card-submit,
.add-card-cancel {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.add-card-submit {
  background: var(--primary);
  color: var(--primary-foreground);
}

.add-card-cancel {
  background: transparent;
  color: var(--muted-foreground);
}

.add-column {
  width: 300px;
  min-width: 300px;
}

.add-column-btn {
  width: 100%;
  padding: 16px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
}

.add-column-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.add-column-form {
  background: var(--accent);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.new-column-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
}

.add-column-actions {
  display: flex;
  gap: 8px;
}

.add-column-submit,
.add-column-cancel {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.add-column-submit {
  background: var(--primary);
  color: var(--primary-foreground);
}

.add-column-cancel {
  background: transparent;
  color: var(--muted-foreground);
}

.sortable-ghost {
  opacity: 0.4;
}

@media (max-width: 768px) {
  .kanban-column {
    width: 260px;
  }
  .add-column {
    width: 260px;
    min-width: 260px;
  }
}
</style>
