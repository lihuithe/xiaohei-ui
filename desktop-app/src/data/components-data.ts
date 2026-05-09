export interface ComponentExample {
  title: string
  description: string
  code: string
}

export interface ComponentInfo {
  name: string
  title: string
  description: string
  category: string
  examples: ComponentExample[]
}

export const COMPONENTS_DATA: ComponentInfo[] = [
  {
    name: 'accordion',
    title: 'Accordion 手风琴',
    description: '一个可以折叠/展开的内容区域组件',
    category: 'data-display',
    examples: [
      {
        title: '默认手风琴',
        description: '最基本的手风琴组件',
        code: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>
      Content for section 1.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>
      Content for section 2.
    </AccordionContent>
  </AccordionItem>
</Accordion>`,
      },
    ],
  },
  {
    name: 'alert',
    title: 'Alert 警告',
    description: '用于展示重要信息的警告组件',
    category: 'feedback',
    examples: [
      {
        title: '默认警告',
        description: '最基本的警告组件',
        code: `import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

<Alert>
  <AlertTitle>Alert</AlertTitle>
  <AlertDescription>This is an alert message.</AlertDescription>
</Alert>`,
      },
    ],
  },
  {
    name: 'button',
    title: 'Button 按钮',
    description: '用于触发操作的按钮组件',
    category: 'button',
    examples: [
      {
        title: '按钮变体',
        description: '支持多种样式的按钮',
        code: `import { Button } from '@/components/ui/button'

<div class="flex flex-wrap gap-3">
  <Button>Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Destructive</Button>
  <Button disabled>Disabled</Button>
</div>`,
      },
    ],
  },
  {
    name: 'badge',
    title: 'Badge 徽章',
    description: '用于展示状态、标签或数字的徽章组件',
    category: 'data-display',
    examples: [
      {
        title: '徽章变体',
        description: '多种样式的徽章',
        code: `import { Badge } from '@/components/ui/badge'

<div class="flex flex-wrap gap-2">
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="destructive">Destructive</Badge>
</div>`,
      },
    ],
  },
  {
    name: 'card',
    title: 'Card 卡片',
    description: '用于组织内容的卡片容器组件',
    category: 'data-display',
    examples: [
      {
        title: '基础卡片',
        description: '最基本的卡片结构',
        code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here.
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,
      },
    ],
  },
  {
    name: 'input',
    title: 'Input 输入框',
    description: '用于接收用户文本输入的组件',
    category: 'form',
    examples: [
      {
        title: '基础输入框',
        description: '最基本的文本输入框',
        code: `import { Input } from '@/components/ui/input'

<div class="space-y-4">
  <Input placeholder="请输入内容..." />
  <Input type="email" placeholder="Email" />
  <Input disabled placeholder="Disabled input" />
</div>`,
      },
    ],
  },
  {
    name: 'switch',
    title: 'Switch 开关',
    description: '用于切换状态的开关组件',
    category: 'form',
    examples: [
      {
        title: '基础开关',
        description: '最基本的开关组件',
        code: `import { Switch } from '@/components/ui/switch'
import { ref } from 'vue'

const checked = ref(false)

<div class="flex items-center space-x-3">
  <Switch id="switch-demo" v-model="checked" />
  <label for="switch-demo">{{ checked ? '已开启' : '已关闭' }}</label>
</div>`,
      },
    ],
  },
  {
    name: 'tabs',
    title: 'Tabs 标签页',
    description: '用于在不同内容之间切换的标签页组件',
    category: 'navigation',
    examples: [
      {
        title: '基础标签页',
        description: '最基本的标签页组件',
        code: `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content for Tab 1</TabsContent>
  <TabsContent value="tab2">Content for Tab 2</TabsContent>
</Tabs>`,
      },
    ],
  },
  {
    name: 'checkbox',
    title: 'Checkbox 复选框',
    description: '用于选择多个选项的复选框组件',
    category: 'form',
    examples: [
      {
        title: '基础复选框',
        description: '最基本的复选框组件',
        code: `import { Checkbox } from '@/components/ui/checkbox'
import { ref } from 'vue'

const checked = ref(false)

<div class="flex items-center space-x-3">
  <Checkbox id="checkbox-demo" v-model="checked" />
  <label for="checkbox-demo">Accept terms</label>
</div>`,
      },
    ],
  },
  {
    name: 'textarea',
    title: 'Textarea 文本域',
    description: '用于接收多行文本输入的组件',
    category: 'form',
    examples: [
      {
        title: '基础文本域',
        description: '最基本的文本域组件',
        code: `import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="请输入内容..." />`,
      },
    ],
  },
  {
    name: 'progress',
    title: 'Progress 进度条',
    description: '用于展示任务进度的进度条组件',
    category: 'data-display',
    examples: [
      {
        title: '基础进度条',
        description: '最基本的进度条组件',
        code: `import { Progress } from '@/components/ui/progress'
import { ref } from 'vue'

const value = ref(30)

<Progress :value="value" />`,
      },
    ],
  },
  {
    name: 'separator',
    title: 'Separator 分隔线',
    description: '用于分隔内容的分隔线组件',
    category: 'layout',
    examples: [
      {
        title: '基础分隔线',
        description: '最基本的分隔线组件',
        code: `import { Separator } from '@/components/ui/separator'

<div class="space-y-4">
  <div>Content above</div>
  <Separator />
  <div>Content below</div>
</div>`,
      },
    ],
  },
]

export const CATEGORIES = [
  { id: 'button', name: '按钮', icon: 'Pointer' },
  { id: 'form', name: '表单', icon: 'FileText' },
  { id: 'data-display', name: '数据展示', icon: 'Layout' },
  { id: 'navigation', name: '导航', icon: 'Compass' },
  { id: 'feedback', name: '反馈', icon: 'AlertCircle' },
  { id: 'layout', name: '布局', icon: 'Grid' },
]

export function getComponentsByCategory(category: string) {
  return COMPONENTS_DATA.filter((c) => c.category === category)
}

export function searchComponents(query: string) {
  const lowerQuery = query.toLowerCase()
  return COMPONENTS_DATA.filter(
    (c) =>
      c.title.toLowerCase().includes(lowerQuery) ||
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery)
  )
}
