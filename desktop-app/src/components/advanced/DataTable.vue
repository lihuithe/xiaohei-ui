<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useVueTable,
  type ColumnDef,
} from '@tanstack/vue-table'
import { ChevronDown, ChevronUp, Search } from 'lucide-vue-next'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  pageSize?: number
}

const props = withDefaults(defineProps<DataTableProps<any>>(), {
  searchable: true,
  searchPlaceholder: '搜索...',
  pageSize: 10,
})

const emit = defineEmits<{
  (e: 'row-click', row: any): void
}>()

const globalFilter = ref('')
const sorting = ref([])

const table = useVueTable({
  data: () => props.data,
  columns: () => props.columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get globalFilter() {
      return globalFilter.value
    },
    get sorting() {
      return sorting.value
    },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  initialState: {
    pagination: {
      pageSize: props.pageSize,
    },
  },
})
</script>

<template>
  <div class="data-table-container">
    <div v-if="searchable" class="data-table-search">
      <Search class="search-icon" :size="16" />
      <input
        v-model="globalFilter"
        type="text"
        :placeholder="searchPlaceholder"
        class="search-input"
      />
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="{ sortable: header.column.getCanSort() }"
            >
              <button
                v-if="header.column.getCanSort()"
                class="sort-button"
                @click="header.column.toggleSorting()"
              >
                {{ flexRender(header.column.columnDef.header, header.getContext()) }}
                <ChevronUp
                  v-if="header.column.getIsSorted() === 'asc'"
                  class="sort-icon"
                  :size="16"
                />
                <ChevronDown
                  v-else-if="header.column.getIsSorted() === 'desc'"
                  class="sort-icon"
                  :size="16"
                />
              </button>
              <span v-else>
                {{ flexRender(header.column.columnDef.header, header.getContext()) }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            @click="emit('row-click', row.original)"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id">
              {{ flexRender(cell.column.columnDef.cell, cell.getContext()) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="data-table-pagination">
      <div class="pagination-info">
        显示
        {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}-{{
          Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )
        }}
        条，共 {{ table.getFilteredRowModel().rows.length }} 条
      </div>
      <div class="pagination-controls">
        <button :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)">首页</button>
        <button :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
          上一页
        </button>
        <span class="page-info"
          >{{ table.getState().pagination.pageIndex + 1 }} / {{ table.getPageCount() }}</span
        >
        <button :disabled="!table.getCanNextPage()" @click="table.nextPage()">下一页</button>
        <button
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-table-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
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

.data-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background: var(--muted);
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  font-weight: 600;
  color: var(--foreground);
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}

.sort-icon {
  opacity: 0.6;
}

.data-table tbody tr {
  transition: background-color 0.15s;
}

.data-table tbody tr:hover {
  background: var(--accent);
  cursor: pointer;
}

.data-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.pagination-info {
  color: var(--muted-foreground);
  font-size: 13px;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-controls button {
  padding: 6px 12px;
  border: 1px solid var(--border);
  background: var(--background);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.pagination-controls button:hover:not(:disabled) {
  background: var(--accent);
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--muted-foreground);
  padding: 0 8px;
}
</style>
