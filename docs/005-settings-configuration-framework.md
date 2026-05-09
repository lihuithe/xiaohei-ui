# 设置页配置管理框架（Settings Configuration Framework）

## 功能背景/动机

当前脚手架提供了 `SettingsLayout.vue` 作为设置页的视觉模板，但它完全是展示性的——没有配置数据的持久化、没有配置变更的响应式同步、没有导入导出能力、没有配置验证。几乎每个桌面应用都需要设置页，而配置管理涉及 Schema 定义、存储、UI 绑定、默认值回退、迁移等多个横切关注点。提供一套完整的配置管理框架，能让开发者只需「定义 Schema」即可自动生成设置表单和配置存储，大幅提升开发效率。

## 功能描述

构建一套声明式配置管理基础设施：

1. **配置 Schema 定义**：通过 TypeScript 类型 + 描述对象定义配置项，支持 string/number/boolean/select/path 等类型
2. **自动表单生成**：根据 Schema 自动生成设置表单（利用现有 shadcn-vue 组件）
3. **分层存储**：区分「用户级配置」（localStorage/IndexedDB）和「应用级配置」（electron-store）
4. **响应式绑定**：配置变更自动同步到所有订阅组件，无需手动监听
5. **导入导出**：支持配置导出为 JSON/YAML 文件、从文件导入、重置为默认
6. **配置验证**：基于 Zod 的 Schema 验证，确保配置值合法
7. **版本迁移**：配置结构升级时自动迁移旧版本数据

## 目标用户

- 需要设置页的通用桌面应用开发者
- 希望减少配置管理样板代码的开发者
- 需要配置导入导出/云同步能力的应用开发者

## 详细设计

### 交互流程

```
定义配置：
开发者创建 settings-schema.ts → 定义配置分组、字段、类型、默认值、验证规则
  → 框架自动生成 SettingsStore + 设置表单页面

使用配置：
组件中调用 useConfig('appearance.theme') → 获取响应式配置值
  → 用户修改设置 → 自动持久化 → 所有订阅该配置的组件自动更新

导入导出：
用户在设置页点击「导出配置」→ 生成 JSON 文件并调用 Electron 保存对话框
  → 或点击「导入配置」→ 选择 JSON 文件 → 验证 → 合并/覆盖
```

### 涉及的技术点

- **Schema 驱动**：Zod 运行时类型验证 + TypeScript 静态类型推导
- **响应式存储**：基于 Pinia + `electron-store`（主进程）或 IndexedDB（渲染进程）
- **路径式访问**：支持 `useConfig('notifications.desktop.enabled')` 的嵌套路径访问
- **表单自动生成**：根据 Schema 的 type 自动映射到 Input / Switch / Select / Slider 等组件
- **文件对话框**：Electron `dialog.showSaveDialog` / `showOpenDialog`

### 与现有架构的衔接方式

| 现有模块 | 衔接方式 |
|---------|---------|
| `src/stores/app.ts` | 合并配置状态，或保持独立 SettingsStore，通过 Pinia 插件同步 |
| `src/components/ui/form/` | 复用现有 Form 组件体系进行自动表单渲染 |
| `src/components/ui/switch/`、`input/`、`select/` | Schema type 自动映射到对应组件 |
| `src/components/layouts/SettingsLayout.vue` | 替换/扩展为基于 Schema 的自动渲染版本 |
| `src/utils/storage.ts` | 作为降级存储方案，优先使用 electron-store |
| `electron/main.ts` | 新增配置读写 IPC，主进程持有 electron-store 实例 |

### 需要新增/修改的文件

**新增文件：**
- `src/config/settings-schema.ts` — 配置 Schema 定义（开发者主要修改的文件）
- `src/stores/settings.ts` — 配置状态管理（自动从 Schema 生成）
- `src/composables/useConfig.ts` — 配置访问和订阅的 composable
- `src/composables/useConfigForm.ts` — 表单自动生成的 composable
- `src/components/settings/SettingsForm.vue` — 自动渲染的设置表单组件
- `src/components/settings/SettingsSection.vue` — 设置分组区块组件
- `src/components/settings/ConfigImportExport.vue` — 配置导入导出组件
- `src/utils/config.ts` — 配置路径解析、默认值合并、深度比较
- `electron/store/settings-store.ts` — 主进程 electron-store 封装

**修改文件：**
- `src/components/layouts/SettingsLayout.vue` — 接入自动表单生成
- `electron/main.ts` — 注册配置读写 IPC
- `electron/preload.cjs` — 暴露配置相关 API
- `src/App.vue` — 应用启动时初始化配置系统

### 核心数据结构

```typescript
// src/config/settings-schema.ts
import { z } from 'zod'

export const settingsSchema = {
  appearance: {
    label: '外观',
    icon: 'Palette',
    items: {
      theme: {
        type: 'select' as const,
        label: '主题',
        options: [
          { value: 'light', label: '浅色' },
          { value: 'dark', label: '深色' },
          { value: 'system', label: '跟随系统' },
        ],
        default: 'system',
        validation: z.enum(['light', 'dark', 'system']),
      },
      sidebarCollapsed: {
        type: 'switch' as const,
        label: '默认收起侧边栏',
        default: false,
      },
      fontSize: {
        type: 'slider' as const,
        label: '字体大小',
        min: 12,
        max: 20,
        step: 1,
        default: 14,
      },
    },
  },
  notifications: {
    label: '通知',
    icon: 'Bell',
    items: {
      desktop: {
        type: 'switch' as const,
        label: '桌面通知',
        default: true,
      },
      sound: {
        type: 'switch' as const,
        label: '通知声音',
        default: false,
      },
    },
  },
} satisfies SettingsSchema

// 自动推导出的 TypeScript 类型
type ConfigShape = {
  appearance: { theme: 'light' | 'dark' | 'system'; sidebarCollapsed: boolean; fontSize: number }
  notifications: { desktop: boolean; sound: boolean }
}
```

### 关键实现策略

1. **Schema 即真相来源**：所有配置相关的类型、默认值、验证规则、表单 UI 都从 Schema 推导，避免多处定义不一致
2. **分层存储策略**：小型配置（如主题、语言）存 `localStorage`；大型/敏感配置（如用户凭证、窗口状态）存 `electron-store`
3. **响应式代理**：ConfigStore 内部使用 Vue `reactive` 包装配置对象，组件通过 `useConfig(path)` 获取计算属性
4. **配置变更追踪**：记录配置修改历史，支持「撤销上次修改」和「重置为默认」
5. **版本迁移**：Schema 定义中包含 `version` 字段，启动时检测存储版本，执行注册的迁移函数

### 使用示例（开发者视角）

```typescript
// 定义 Schema（框架使用者只需做这一步）
export const settingsSchema = {
  editor: {
    label: '编辑器',
    items: {
      fontFamily: { type: 'text', label: '字体', default: 'monospace' },
      tabSize: { type: 'number', label: '缩进大小', default: 2, min: 1, max: 8 },
      wordWrap: { type: 'switch', label: '自动换行', default: true },
    },
  },
}

// 在组件中使用
const theme = useConfig('appearance.theme')
const fontSize = useConfig('appearance.fontSize')

// theme.value 是响应式的，修改后自动持久化
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}
```

## 验收标准

- [ ] 开发者只需在 `settings-schema.ts` 中声明配置项，即可自动生成完整的设置页
- [ ] 支持 text / number / switch / select / slider / path / password 等字段类型
- [ ] `useConfig(path)` 提供响应式配置值，修改后自动持久化并同步到所有订阅者
- [ ] 设置页自动按 Schema 分组渲染，支持搜索过滤配置项
- [ ] 提供「恢复默认」按钮，支持单字段重置和整组重置
- [ ] 支持配置导出为 JSON 文件和从 JSON 文件导入
- [ ] 配置变更时自动验证，非法值阻止保存并显示错误提示
- [ ] 配置 Schema 版本升级时，自动执行注册的迁移函数
- [ ] 主进程和渲染进程的配置存储自动同步
- [ ] 包含完整 TypeScript 类型推导，IDE 对 `useConfig('xxx.yyy')` 提供路径补全

## 优先级

**P0** — 设置页是桌面应用的标配，且与现有 SettingsLayout、shadcn-vue 表单组件深度契合；Schema 驱动的方式能极大减少样板代码，是模板价值的核心体现。

## 参考实现

- [VS Code Settings](https://code.visualstudio.com/docs/getstarted/settings) — JSON/UI 双模式设置页的标杆
- [Zod](https://zod.dev) — Schema 验证和类型推导
- [electron-store](https://github.com/sindresorhus/electron-store) — 主进程配置持久化
- [FormKit Schema](https://formkit.com/essentials/schema) — Schema 驱动表单生成的思路参考
