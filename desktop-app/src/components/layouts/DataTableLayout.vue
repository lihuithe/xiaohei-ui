<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, MoreHorizontal, Filter, Download, Edit, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const users = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: 'active',
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '编辑',
    status: 'active',
    joinDate: '2024-02-20',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: '用户',
    status: 'pending',
    joinDate: '2024-03-10',
  },
  {
    id: 4,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '用户',
    status: 'inactive',
    joinDate: '2024-01-25',
  },
  {
    id: 5,
    name: '钱七',
    email: 'qianqi@example.com',
    role: '编辑',
    status: 'active',
    joinDate: '2024-04-05',
  },
  {
    id: 6,
    name: '孙八',
    email: 'sunba@example.com',
    role: '用户',
    status: 'active',
    joinDate: '2024-04-15',
  },
  {
    id: 7,
    name: '周九',
    email: 'zhoujiu@example.com',
    role: '管理员',
    status: 'active',
    joinDate: '2024-02-01',
  },
  {
    id: 8,
    name: '吴十',
    email: 'wushi@example.com',
    role: '用户',
    status: 'pending',
    joinDate: '2024-05-01',
  },
])

const selectedRows = ref<number[]>([])

function toggleSelectAll(checked: boolean) {
  selectedRows.value = checked ? users.value.map((u) => u.id) : []
}

function toggleSelect(id: number) {
  const index = selectedRows.value.indexOf(id)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(id)
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'inactive':
      return 'outline'
    default:
      return 'default'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return '活跃'
    case 'pending':
      return '待审核'
    case 'inactive':
      return '未激活'
    default:
      return status
  }
}
</script>

<template>
  <div class="min-h-screen bg-background p-6">
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">用户管理</h1>
          <p class="text-muted-foreground">管理您的用户和团队成员</p>
        </div>
        <Button>
          <Plus class="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      <!-- Toolbar -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input placeholder="搜索用户..." class="pl-9 w-64" />
          </div>
          <Button variant="outline">
            <Filter class="mr-2 h-4 w-4" />
            筛选
          </Button>
          <Button variant="outline">
            <Download class="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
        <div v-if="selectedRows.length > 0" class="text-sm text-muted-foreground">
          已选择 {{ selectedRows.length }} 项
        </div>
      </div>

      <!-- Table -->
      <div class="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox
                  :checked="selectedRows.length === users.length && users.length > 0"
                  :indeterminate="selectedRows.length > 0 && selectedRows.length < users.length"
                  @change="toggleSelectAll($event.target.checked)"
                />
              </TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>加入日期</TableHead>
              <TableHead class="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>
                <Checkbox
                  :checked="selectedRows.includes(user.id)"
                  @change="toggleSelect(user.id)"
                />
              </TableCell>
              <TableCell class="font-medium">{{ user.name }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>{{ user.role }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(user.status)">
                  {{ getStatusLabel(user.status) }}
                </Badge>
              </TableCell>
              <TableCell>{{ user.joinDate }}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit class="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem class="text-red-600">
                      <Trash2 class="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-muted-foreground">显示 1-8 共 {{ users.length }} 条</p>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <Button variant="outline" size="sm">下一页</Button>
        </div>
      </div>
    </div>
  </div>
</template>
