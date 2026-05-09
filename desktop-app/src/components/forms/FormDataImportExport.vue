<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { Upload, Download, FileSpreadsheet, FileText } from 'lucide-vue-next'

interface FormDataImportExportProps {
  data?: any[]
  filename?: string
}

const props = withDefaults(defineProps<FormDataImportExportProps>(), {
  filename: 'form-data',
})

const emit = defineEmits<{
  (e: 'import', data: any[]): void
}>()

const isImporting = ref(false)
const importFile = ref<File | null>(null)
const importPreview = ref<any[]>([])

function exportToCSV() {
  if (!props.data || props.data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(props.data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, `${props.filename}.csv`)
}

function exportToExcel() {
  if (!props.data || props.data.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(props.data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
  XLSX.writeFile(workbook, `${props.filename}.xlsx`)
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    importFile.value = target.files[0]
    processFile(importFile.value)
  }
}

function processFile(file: File) {
  isImporting.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      importPreview.value = jsonData
    } catch (error) {
      console.error('Import error:', error)
    } finally {
      isImporting.value = false
    }
  }

  reader.readAsBinaryString(file)
}

function confirmImport() {
  if (importPreview.value.length > 0) {
    emit('import', importPreview.value)
    resetImport()
  }
}

function resetImport() {
  importFile.value = null
  importPreview.value = []
  isImporting.value = false
}
</script>

<template>
  <div class="form-data-import-export">
    <div class="section">
      <h3 class="section-title">
        <Download :size="18" />
        导出数据
      </h3>
      <div class="export-buttons">
        <button class="btn btn-csv" @click="exportToCSV">
          <FileText :size="16" />
          导出 CSV
        </button>
        <button class="btn btn-excel" @click="exportToExcel">
          <FileSpreadsheet :size="16" />
          导出 Excel
        </button>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">
        <Upload :size="18" />
        导入数据
      </h3>
      <div class="import-area">
        <label class="file-upload-label">
          <Upload :size="24" class="upload-icon" />
          <span class="upload-text">{{
            importFile ? importFile.name : '点击选择文件或拖拽到此处'
          }}</span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            class="file-input"
            @change="handleFileSelect"
          />
        </label>

        <div v-if="importPreview.length > 0" class="import-preview">
          <div class="preview-header">
            <span class="preview-title">预览 ({{ importPreview.length }} 条记录)</span>
            <button class="reset-btn" @click="resetImport">重置</button>
          </div>
          <div class="preview-table-wrapper">
            <table class="preview-table">
              <thead>
                <tr>
                  <th v-for="(value, key) in importPreview[0]" :key="key">{{ key }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in importPreview.slice(0, 5)" :key="index">
                  <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="importPreview.length > 5" class="more-rows">
            ... 还有 {{ importPreview.length - 5 }} 条记录
          </div>
          <button class="confirm-btn" @click="confirmImport">确认导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-data-import-export {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
}

.export-buttons {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-csv {
  background: #dbeafe;
  color: #1e40af;
}

.btn-csv:hover {
  background: #bfdbfe;
}

.btn-excel {
  background: #dcfce7;
  color: #166534;
}

.btn-excel:hover {
  background: #bbf7d0;
}

.import-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}

.file-upload-label:hover {
  border-color: var(--primary);
  background: var(--accent);
}

.upload-icon {
  color: var(--muted-foreground);
}

.upload-text {
  font-size: 14px;
  color: var(--muted-foreground);
}

.file-input {
  display: none;
}

.import-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
}

.reset-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  font-size: 13px;
  cursor: pointer;
}

.reset-btn:hover {
  color: var(--foreground);
}

.preview-table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table th,
.preview-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.preview-table th {
  background: var(--muted);
  font-weight: 500;
  color: var(--foreground);
}

.preview-table td {
  color: var(--muted-foreground);
}

.more-rows {
  font-size: 13px;
  color: var(--muted-foreground);
  text-align: center;
  padding: 8px;
}

.confirm-btn {
  align-self: flex-start;
  padding: 10px 20px;
  border: none;
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.confirm-btn:hover {
  filter: brightness(0.95);
}
</style>
