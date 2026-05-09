<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import { z } from 'zod'
import type { ZodSchema } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date'
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
  disabled?: boolean
  defaultValue?: any
}

interface DynamicFormProps {
  fields: FormField[]
  schema?: ZodSchema
  submitLabel?: string
  resetLabel?: string
  showReset?: boolean
}

const props = withDefaults(defineProps<DynamicFormProps>(), {
  submitLabel: '提交',
  resetLabel: '重置',
  showReset: true,
})

const emit = defineEmits<{
  (e: 'submit', values: any): void
  (e: 'reset'): void
}>()

const initialValues: Record<string, any> = {}
for (const field of props.fields) {
  if (field.defaultValue !== undefined) {
    initialValues[field.name] = field.defaultValue
  } else {
    initialValues[field.name] = field.type === 'checkbox' ? false : ''
  }
}

const { handleSubmit, resetForm, errors } = useForm({
  validationSchema: props.schema,
  initialValues,
})

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})

const onReset = () => {
  resetForm()
  emit('reset')
}

const showPassword = ref<Record<string, boolean>>({})

function togglePassword(fieldName: string) {
  showPassword.value[fieldName] = !showPassword.value[fieldName]
}
</script>

<template>
  <form class="dynamic-form" @submit.prevent="onSubmit" @reset.prevent="onReset">
    <div class="form-fields">
      <div v-for="field in fields" :key="field.name" class="form-field">
        <label :for="field.name" class="field-label">
          {{ field.label }}
          <span v-if="field.required" class="required-mark">*</span>
        </label>

        <input
          v-if="field.type === 'text' || field.type === 'email' || field.type === 'number'"
          :id="field.name"
          v-model="useField(field.name).value"
          type="text"
          :name="field.name"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          class="field-input"
          :class="{ 'field-error': errors[field.name] }"
        />

        <div v-else-if="field.type === 'password'" class="password-input-wrapper">
          <input
            :id="field.name"
            v-model="useField(field.name).value"
            :type="showPassword[field.name] ? 'text' : 'password'"
            :name="field.name"
            :placeholder="field.placeholder"
            :disabled="field.disabled"
            class="field-input password-input"
            :class="{ 'field-error': errors[field.name] }"
          />
          <button type="button" class="toggle-password-btn" @click="togglePassword(field.name)">
            <Eye v-if="!showPassword[field.name]" :size="18" />
            <EyeOff v-else :size="18" />
          </button>
        </div>

        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.name"
          v-model="useField(field.name).value"
          :name="field.name"
          :placeholder="field.placeholder"
          :disabled="field.disabled"
          class="field-textarea"
          :class="{ 'field-error': errors[field.name] }"
        ></textarea>

        <select
          v-else-if="field.type === 'select'"
          :id="field.name"
          v-model="useField(field.name).value"
          :name="field.name"
          :disabled="field.disabled"
          class="field-select"
          :class="{ 'field-error': errors[field.name] }"
        >
          <option value="">请选择</option>
          <option v-for="option in field.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <div v-else-if="field.type === 'checkbox'" class="checkbox-wrapper">
          <input
            :id="field.name"
            v-model="useField(field.name).value"
            type="checkbox"
            :disabled="field.disabled"
            class="field-checkbox"
          />
          <label :for="field.name" class="checkbox-label">{{ field.label }}</label>
        </div>

        <input
          v-else-if="field.type === 'date'"
          :id="field.name"
          v-model="useField(field.name).value"
          type="date"
          :name="field.name"
          :disabled="field.disabled"
          class="field-input"
          :class="{ 'field-error': errors[field.name] }"
        />

        <div v-if="errors[field.name]" class="error-message">{{ errors[field.name] }}</div>
      </div>
    </div>

    <div class="form-actions">
      <button v-if="showReset" type="reset" class="btn btn-secondary">{{ resetLabel }}</button>
      <button type="submit" class="btn btn-primary">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--foreground);
}

.required-mark {
  color: #ef4444;
  margin-left: 2px;
}

.field-input,
.field-textarea,
.field-select {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
  color: var(--foreground);
  font-size: 14px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  outline: none;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary) 20%;
}

.field-error {
  border-color: #ef4444 !important;
}

.field-textarea {
  resize: vertical;
  min-height: 100px;
}

.password-input-wrapper {
  position: relative;
}

.password-input {
  width: 100%;
  padding-right: 44px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password-btn:hover {
  color: var(--foreground);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.field-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 14px;
  color: var(--foreground);
  cursor: pointer;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.btn-primary:hover {
  filter: brightness(0.95);
}

.btn-secondary {
  background: var(--muted);
  color: var(--muted-foreground);
}

.btn-secondary:hover {
  background: var(--border);
}
</style>
