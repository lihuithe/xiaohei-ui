<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounce } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from '@/components/ui/command'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from '@/composables/useTheme'
import {
  CATEGORIES,
  getComponentsByCategory,
  searchComponents,
  type ComponentInfo,
} from '@/data/components-data'
import { copyToClipboard } from '@/utils/clipboard'

const router = useRouter()
const { setTheme, theme } = useTheme()

const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 200)
const openCommand = ref(false)
const activeCategory = ref(CATEGORIES[0].id)
const copiedComponent = ref<string | null>(null)

const filteredComponents = computed(() => {
  if (debouncedQuery.value.trim()) {
    return searchComponents(debouncedQuery.value.trim())
  }
  return getComponentsByCategory(activeCategory.value)
})

const commandFilteredComponents = computed(() => {
  if (!debouncedQuery.value.trim()) return []
  return searchComponents(debouncedQuery.value.trim())
})

function handleCopy(code: string, componentName: string) {
  copyToClipboard(code)
  copiedComponent.value = componentName
  setTimeout(() => {
    copiedComponent.value = null
  }, 2000)
}

function scrollToComponent(component: ComponentInfo) {
  const element = document.getElementById(`component-${component.name}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
  openCommand.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    openCommand.value = !openCommand.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const switchChecked = ref(false)
const checkboxChecked = ref(false)
const progressValue = ref(30)
</script>

<template>
  <div class="min-h-screen bg-background">
    <div
      class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container flex h-16 items-center px-4">
        <div class="flex items-center space-x-4 flex-1">
          <h1 class="text-xl font-semibold">组件库</h1>
          <div class="relative flex-1 max-w-md">
            <Input v-model="searchQuery" placeholder="搜索组件..." class="w-full" />
            <CommandShortcut class="absolute right-2 top-1/2 -translate-y-1/2">
              ⌘K
            </CommandShortcut>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-accent': theme === 'light' }"
            @click="setTheme('light')"
          >
            浅色
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-accent': theme === 'dark' }"
            @click="setTheme('dark')"
          >
            深色
          </Button>
          <Button
            variant="ghost"
            size="sm"
            :class="{ 'bg-accent': theme === 'system' }"
            @click="setTheme('system')"
          >
            跟随系统
          </Button>
          <Button variant="outline" @click="router.push('/')"> 返回首页 </Button>
        </div>
      </div>
    </div>

    <div class="container py-8 px-4">
      <div class="flex gap-8">
        <aside class="hidden lg:block w-56 shrink-0">
          <nav class="space-y-1 sticky top-20">
            <div class="text-sm font-medium text-muted-foreground mb-2">分类</div>
            <button
              v-for="category in CATEGORIES"
              :key="category.id"
              :class="[
                'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                activeCategory === category.id
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
              ]"
              @click="activeCategory = category.id"
            >
              {{ category.name }}
            </button>
          </nav>
        </aside>

        <main class="flex-1 min-w-0">
          <div class="lg:hidden mb-6">
            <Tabs v-model="activeCategory" class="w-full">
              <TabsList class="w-full">
                <TabsTrigger
                  v-for="category in CATEGORIES"
                  :key="category.id"
                  :value="category.id"
                  class="flex-1"
                >
                  {{ category.name }}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div class="space-y-12">
            <div
              v-for="component in filteredComponents"
              :id="`component-${component.name}`"
              :key="component.name"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{{ component.title }}</CardTitle>
                  <CardDescription>{{ component.description }}</CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                  <div
                    v-for="(example, index) in component.examples"
                    :key="index"
                    class="space-y-4"
                  >
                    <div>
                      <h4 class="text-sm font-medium mb-2">{{ example.title }}</h4>
                      <p class="text-sm text-muted-foreground mb-4">
                        {{ example.description }}
                      </p>
                    </div>

                    <div class="rounded-lg border p-8 bg-muted/20">
                      <template v-if="component.name === 'accordion'">
                        <Accordion type="single" collapsible>
                          <AccordionItem value="item-1">
                            <AccordionTrigger>Section 1</AccordionTrigger>
                            <AccordionContent> Content for section 1. </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                            <AccordionTrigger>Section 2</AccordionTrigger>
                            <AccordionContent> Content for section 2. </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </template>

                      <template v-else-if="component.name === 'alert'">
                        <Alert>
                          <AlertTitle>Alert</AlertTitle>
                          <AlertDescription> This is an alert message. </AlertDescription>
                        </Alert>
                      </template>

                      <template v-else-if="component.name === 'button'">
                        <div class="flex flex-wrap gap-3">
                          <Button>Primary</Button>
                          <Button variant="secondary">Secondary</Button>
                          <Button variant="outline">Outline</Button>
                          <Button variant="ghost">Ghost</Button>
                          <Button variant="destructive">Destructive</Button>
                          <Button disabled>Disabled</Button>
                        </div>
                      </template>

                      <template v-else-if="component.name === 'badge'">
                        <div class="flex flex-wrap gap-2">
                          <Badge>Default</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="outline">Outline</Badge>
                          <Badge variant="destructive">Destructive</Badge>
                        </div>
                      </template>

                      <template v-else-if="component.name === 'card'">
                        <Card class="max-w-sm">
                          <CardHeader>
                            <CardTitle class="text-base">Card Title</CardTitle>
                            <CardDescription>Card description</CardDescription>
                          </CardHeader>
                          <CardContent class="text-sm text-muted-foreground">
                            Content goes here.
                          </CardContent>
                        </Card>
                      </template>

                      <template v-else-if="component.name === 'input'">
                        <div class="space-y-4">
                          <Input placeholder="请输入内容..." />
                          <Input type="email" placeholder="Email" />
                          <Input disabled placeholder="Disabled input" />
                        </div>
                      </template>

                      <template v-else-if="component.name === 'switch'">
                        <div class="flex items-center space-x-3">
                          <Switch id="airplane-mode" v-model="switchChecked" />
                          <label for="airplane-mode">
                            {{ switchChecked ? '已开启' : '已关闭' }}
                          </label>
                        </div>
                      </template>

                      <template v-else-if="component.name === 'tabs'">
                        <Tabs default-value="tab1">
                          <TabsList>
                            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                          </TabsList>
                          <TabsContent value="tab1" class="pt-4"> Content for Tab 1 </TabsContent>
                          <TabsContent value="tab2" class="pt-4"> Content for Tab 2 </TabsContent>
                        </Tabs>
                      </template>

                      <template v-else-if="component.name === 'checkbox'">
                        <div class="flex items-center space-x-3">
                          <Checkbox id="terms" v-model="checkboxChecked" />
                          <label for="terms">Accept terms</label>
                        </div>
                      </template>

                      <template v-else-if="component.name === 'textarea'">
                        <Textarea placeholder="请输入内容..." />
                      </template>

                      <template v-else-if="component.name === 'progress'">
                        <Progress :value="progressValue" />
                      </template>

                      <template v-else-if="component.name === 'separator'">
                        <div class="space-y-4">
                          <div>Content above</div>
                          <Separator />
                          <div>Content below</div>
                        </div>
                      </template>
                    </div>

                    <div class="relative">
                      <div
                        class="flex items-center justify-between px-4 py-2 bg-muted/50 border border-t-0 text-sm rounded-b-lg"
                      >
                        <span class="text-muted-foreground">vue</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="handleCopy(example.code, component.name + index)"
                        >
                          <span v-if="copiedComponent !== component.name + index"> 复制 </span>
                          <span v-else class="text-green-500">已复制</span>
                        </Button>
                      </div>
                      <pre
                        class="p-4 overflow-x-auto text-sm bg-zinc-950 text-zinc-50 rounded-t-lg border"
                      ><code>{{ example.code }}</code></pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div
              v-if="filteredComponents.length === 0"
              class="text-center py-12 text-muted-foreground"
            >
              没有找到匹配的组件
            </div>
          </div>
        </main>
      </div>
    </div>

    <CommandDialog v-model="openCommand">
      <CommandInput
        v-model="searchQuery"
        placeholder="搜索组件..."
        @keyup.enter="
          commandFilteredComponents[0] && scrollToComponent(commandFilteredComponents[0])
        "
      />
      <CommandList>
        <CommandEmpty>没有找到匹配的组件</CommandEmpty>
        <CommandGroup v-if="commandFilteredComponents.length > 0">
          <CommandItem
            v-for="component in commandFilteredComponents"
            :key="component.name"
            @select="() => scrollToComponent(component)"
          >
            <div class="flex flex-col">
              <span>{{ component.title }}</span>
              <span class="text-sm text-muted-foreground">
                {{ component.description }}
              </span>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </div>
</template>
