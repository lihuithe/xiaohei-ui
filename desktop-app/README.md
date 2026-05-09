# 小黑助手

基于 Electron + Vue3 的桌面应用，提供丰富的 UI 组件和开发工具。

## 功能特性

- 🎨 现代化的 UI 组件库（基于 shadcn-vue）
- 📦 完整的组件演示和文档
- 🚀 高性能的桌面应用体验
- 🌐 多语言支持（中文/英文）
- 📊 数据可视化组件
- 🔌 插件化架构
- 🎭 主题定制

## 技术栈

- **框架**: Vue 3 + TypeScript
- **桌面**: Electron
- **构建**: Vite
- **样式**: Tailwind CSS
- **UI 组件**: shadcn-vue
- **状态管理**: Pinia
- **路由**: Vue Router
- **测试**: Vitest + Playwright
- **文档**: VitePress
- **故事书**: Storybook

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建应用

```bash
# 构建所有平台
pnpm build:electron

# 构建 Windows
pnpm build:win

# 构建 macOS
pnpm build:mac

# 构建 Linux
pnpm build:linux
```

### 其他命令

```bash
# 类型检查
pnpm type-check

# 代码 lint
pnpm lint

# 代码格式化
pnpm format

# 运行测试
pnpm test:run

# 运行 E2E 测试
pnpm test:e2e

# 启动 Storybook
pnpm storybook

# 启动文档
pnpm docs:dev
```

## 项目结构

```
desktop-app/
├── src/              # 源代码
│   ├── components/   # Vue 组件
│   ├── composables/  # 组合式函数
│   ├── pages/        # 页面组件
│   ├── stores/       # Pinia 状态管理
│   ├── plugins/      # 插件
│   └── utils/        # 工具函数
├── electron/         # Electron 主进程代码
├── docs/             # VitePress 文档
├── e2e/              # E2E 测试
└── resources/        # 资源文件
```

## 贡献指南

详见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT

© 2024 Xiaohei Team
