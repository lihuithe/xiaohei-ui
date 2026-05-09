<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, FileText, Search } from 'lucide-vue-next'

interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  icon?: any
  fields: any[]
}

interface FormTemplateLibraryProps {
  templates: FormTemplate[]
}

const props = defineProps<FormTemplateLibraryProps>()

const emit = defineEmits<{
  (e: 'select-template', template: FormTemplate): void
  (e: 'create-custom'): void
}>()

const searchQuery = ref('')
const selectedCategory = ref('all')

const categories = [
  { id: 'all', name: '全部' },
  { id: 'hr', name: '人事' },
  { id: 'finance', name: '财务' },
  { id: 'it', name: 'IT' },
  { id: 'general', name: '通用' },
]

const filteredTemplates = computed(() => {
  return props.templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory =
      selectedCategory.value === 'all' || template.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <div class="form-template-library">
    <div class="library-header">
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="搜索模板..." class="search-input" />
      </div>
      <div class="category-tabs">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-tab"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="templates-grid">
      <div class="template-card create-card" @click="emit('create-custom')">
        <div class="create-icon">
          <Plus :size="32" />
        </div>
        <div class="template-info">
          <h3 class="template-name">创建自定义表单</h3>
          <p class="template-description">从头开始构建您自己的表单</p>
        </div>
      </div>

      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="emit('select-template', template)"
      >
        <div class="template-icon">
          <component :is="template.icon || FileText" :size="28" />
        </div>
        <div class="template-info">
          <h3 class="template-name">{{ template.name }}</h3>
          <p class="template-description">{{ template.description }}</p>
          <span class="template-category">{{
            categories.find((c) => c.id === template.category)?.name
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-template-library {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.library-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
}

.search-icon {
  color: var(--muted-foreground);
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: var(--foreground);
  font-size: 14px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--background);
  border-radius: var(--radius-md);
  font-size: 13px;
  color: var(--muted-foreground);
  cursor: pointer;
  transition: all 0.15s;
}

.category-tab:hover {
  background: var(--accent);
}

.category-tab.active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.template-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.create-card {
  border: 2px dashed var(--border);
  background: var(--muted);
}

.create-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--background);
  color: var(--muted-foreground);
}

.template-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--accent);
  color: var(--primary);
}

.template-info {
  text-align: center;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
  margin: 0 0 6px 0;
}

.template-description {
  font-size: 13px;
  color: var(--muted-foreground);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.template-category {
  display: inline-block;
  padding: 4px 10px;
  background: var(--muted);
  color: var(--muted-foreground);
  font-size: 12px;
  border-radius: var(--radius-sm);
}
</style>
