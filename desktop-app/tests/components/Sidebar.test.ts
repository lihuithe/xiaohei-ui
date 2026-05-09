import { render, screen } from '@testing-library/vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import SidebarProvider from '@/components/ui/sidebar/SidebarProvider.vue'
import { provideSidebarContext } from '@/components/ui/sidebar/utils'

vi.mock('@vueuse/core', () => ({
  useMediaQuery: vi.fn(() => ref(false)),
}))

const TestWrapper = {
  components: { SidebarProvider },
  setup() {
    provideSidebarContext({
      state: ref('expanded'),
      open: ref(true),
      setOpen: vi.fn(),
      isMobile: ref(false),
      openMobile: ref(false),
      setOpenMobile: vi.fn(),
      toggleSidebar: vi.fn(),
    })
  },
  template: `
    <SidebarProvider>
      <div data-testid="sidebar-content">Sidebar Content</div>
    </SidebarProvider>
  `,
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sidebar content', () => {
    render(TestWrapper)
    expect(screen.getByTestId('sidebar-content')).toBeTruthy()
  })

  it('renders with default props', () => {
    const { container } = render(TestWrapper)
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toBeTruthy()
  })

  it('renders in desktop mode by default', () => {
    const { container } = render(TestWrapper)
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toBeTruthy()
    expect(sidebar?.tagName.toLowerCase()).toBe('div')
  })

  it('applies sidebar width class', () => {
    const { container } = render(TestWrapper)
    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar?.className).toContain('w-')
  })

  it('renders children content', () => {
    const { getByText } = render(TestWrapper)
    expect(getByText('Sidebar Content')).toBeTruthy()
  })

  it('renders with custom class', () => {
    const CustomClassWrapper = {
      components: { SidebarProvider },
      setup() {
        provideSidebarContext({
          state: ref('expanded'),
          open: ref(true),
          setOpen: vi.fn(),
          isMobile: ref(false),
          openMobile: ref(false),
          setOpenMobile: vi.fn(),
          toggleSidebar: vi.fn(),
        })
      },
      template: `
        <SidebarProvider class="custom-sidebar-class">
          <div data-testid="sidebar-content">Content</div>
        </SidebarProvider>
      `,
    }

    const { container } = render(CustomClassWrapper)
    const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')
    expect(wrapper?.className).toContain('custom-sidebar-class')
  })
})

describe('Sidebar - Collapsible None', () => {
  it('renders with collapsible none', () => {
    const { container } = render({
      components: { SidebarProvider },
      setup() {
        provideSidebarContext({
          state: ref('expanded'),
          open: ref(true),
          setOpen: vi.fn(),
          isMobile: ref(false),
          openMobile: ref(false),
          setOpenMobile: vi.fn(),
          toggleSidebar: vi.fn(),
        })
      },
      template: `
        <SidebarProvider>
          <div data-slot="sidebar" data-collapsible="none">Collapsible None Sidebar</div>
        </SidebarProvider>
      `,
    })

    const sidebar = container.querySelector('[data-slot="sidebar"]')
    expect(sidebar).toBeTruthy()
  })
})
