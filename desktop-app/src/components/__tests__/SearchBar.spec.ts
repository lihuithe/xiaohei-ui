import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SearchBar from '../SearchBar.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        search: '搜索...',
      },
    },
  },
})

describe('SearchBar.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders correctly', () => {
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('.search-bar').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('displays placeholder', () => {
    const wrapper = mount(SearchBar, {
      props: {
        placeholder: '测试占位符',
      },
      global: {
        plugins: [i18n],
      },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('测试占位符')
  })

  it('emits update:modelValue when input changes', async () => {
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [i18n],
      },
    })
    const input = wrapper.find('input')
    await input.setValue('test')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test'])
  })

  it('emits search after debounce', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        debounceMs: 300,
      },
      global: {
        plugins: [i18n],
      },
    })
    const input = wrapper.find('input')
    await input.setValue('test search')
    expect(wrapper.emitted('search')).toBeFalsy()
    vi.advanceTimersByTime(300)
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual(['test search'])
  })

  it('clears input and emits empty search', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test',
      },
      global: {
        plugins: [i18n],
      },
    })
    const clearButton = wrapper.find('button')
    await clearButton.trigger('click')
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')?.[0]).toEqual([''])
  })
})
