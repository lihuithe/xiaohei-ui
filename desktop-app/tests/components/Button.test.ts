import { render, screen, fireEvent } from '@testing-library/vue'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default props', () => {
    render(Button, {
      slots: {
        default: 'Click me',
      },
    })

    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeTruthy()
    expect(button).toHaveAttribute('data-slot', 'button')
    expect(button).toHaveAttribute('data-variant', 'default')
    expect(button).toHaveAttribute('data-size', 'default')
  })

  it('renders with different variants', async () => {
    const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const

    for (const variant of variants) {
      const { unmount } = render(Button, {
        props: { variant },
        slots: { default: `Button ${variant}` },
      })

      const button = screen.getByRole('button', { name: `Button ${variant}` })
      expect(button).toHaveAttribute('data-variant', variant)
      unmount()
    }
  })

  it('renders with different sizes', async () => {
    const sizes = ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const

    for (const size of sizes) {
      const { unmount } = render(Button, {
        props: { size },
        slots: { default: `Button ${size}` },
      })

      const button = screen.getByRole('button', { name: `Button ${size}` })
      expect(button).toHaveAttribute('data-size', size)
      unmount()
    }
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(Button, {
      props: { onClick: handleClick },
      slots: { default: 'Click me' },
    })

    const button = screen.getByRole('button', { name: 'Click me' })
    await fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders in disabled state', () => {
    render(Button, {
      props: { disabled: true },
      slots: { default: 'Disabled button' },
    })

    const button = screen.getByRole('button', { name: 'Disabled button' })
    expect(button).toBeDisabled()
  })

  it('renders as different HTML element when using "as" prop', () => {
    render(Button, {
      props: { as: 'a' },
      slots: { default: 'Link button' },
    })

    const link = screen.getByRole('link', { name: 'Link button' })
    expect(link).toBeTruthy()
    expect(link).toHaveAttribute('data-slot', 'button')
  })

  it('applies custom class', () => {
    render(Button, {
      props: { class: 'custom-class' },
      slots: { default: 'Custom button' },
    })

    const button = screen.getByRole('button', { name: 'Custom button' })
    expect(button.className).toContain('custom-class')
  })
})
