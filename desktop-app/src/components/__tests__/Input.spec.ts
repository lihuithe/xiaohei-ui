import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '../ui/input/Input.vue'

describe('Input Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Input, {
      props: {
        placeholder: 'Enter text',
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays placeholder', () => {
    const placeholder = 'Test placeholder'
    const wrapper = mount(Input, {
      props: {
        placeholder,
      },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe(placeholder)
  })

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(Input, {
      props: {
        disabled: true,
      },
    })
    expect(wrapper.find('input').element.disabled).toBe(true)
  })
})
