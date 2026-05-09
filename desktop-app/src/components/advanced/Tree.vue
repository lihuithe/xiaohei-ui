<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronRight, Folder, File, Plus, MoreHorizontal } from 'lucide-vue-next'

interface TreeNode {
  id: string | number
  label: string
  icon?: any
  children?: TreeNode[]
  data?: any
}

interface TreeProps {
  data: TreeNode[]
  defaultExpandAll?: boolean
  expandOnClick?: boolean
  selectable?: boolean
}

const props = withDefaults(defineProps<TreeProps>(), {
  defaultExpandAll: false,
  expandOnClick: true,
  selectable: true,
})

const emit = defineEmits<{
  (e: 'node-click', node: TreeNode): void
  (e: 'node-expand', node: TreeNode): void
  (e: 'node-collapse', node: TreeNode): void
}>()

const expandedNodes = ref<Set<string | number>>(new Set())
const selectedNodeId = ref<string | number | null>(null)

if (props.defaultExpandAll) {
  const allIds = new Set<string | number>()
  function collectIds(nodes: TreeNode[]) {
    for (const node of nodes) {
      allIds.add(node.id)
      if (node.children) {
        collectIds(node.children)
      }
    }
  }
  collectIds(props.data)
  expandedNodes.value = allIds
}

function isExpanded(node: TreeNode): boolean {
  return expandedNodes.value.has(node.id)
}

function toggleExpand(node: TreeNode) {
  if (isExpanded(node)) {
    expandedNodes.value.delete(node.id)
    emit('node-collapse', node)
  } else {
    expandedNodes.value.add(node.id)
    emit('node-expand', node)
  }
}

function handleNodeClick(node: TreeNode) {
  if (props.selectable) {
    selectedNodeId.value = node.id
  }
  if (props.expandOnClick && node.children) {
    toggleExpand(node)
  }
  emit('node-click', node)
}

function getIcon(node: TreeNode) {
  if (node.icon) return node.icon
  if (node.children) return Folder
  return File
}
</script>

<template>
  <div class="tree">
    <template v-for="node in data" :key="node.id">
      <div
        class="tree-node"
        :class="{ 'node-selected': selectedNodeId === node.id }"
        @click="handleNodeClick(node)"
      >
        <div class="node-content">
          <button v-if="node.children" class="expand-btn" @click.stop="toggleExpand(node)">
            <ChevronRight :size="14" :class="{ rotated: isExpanded(node) }" />
          </button>
          <span v-else class="expand-placeholder"></span>
          <component :is="getIcon(node)" :size="16" class="node-icon" />
          <span class="node-label">{{ node.label }}</span>
        </div>
      </div>
      <div v-if="node.children && isExpanded(node)" class="tree-children">
        <Tree
          :data="node.children"
          :default-expand-all="defaultExpandAll"
          :expand-on-click="expandOnClick"
          :selectable="selectable"
          @node-click="(n) => emit('node-click', n)"
          @node-expand="(n) => emit('node-expand', n)"
          @node-collapse="(n) => emit('node-collapse', n)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tree {
  display: flex;
  flex-direction: column;
}

.tree-node {
  display: flex;
  flex-direction: column;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s;
}

.node-content:hover {
  background: var(--accent);
}

.node-selected .node-content {
  background: var(--primary);
  color: var(--primary-foreground);
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  color: inherit;
  transition: transform 0.2s;
}

.expand-btn svg {
  transition: transform 0.2s;
}

.expand-btn .rotated {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 18px;
}

.node-icon {
  opacity: 0.8;
}

.node-label {
  font-size: 14px;
}

.tree-children {
  margin-left: 18px;
}
</style>
