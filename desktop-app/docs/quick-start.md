# 快速开始

## 项目介绍

小黑助手是一个基于 Electron + Vue 3 + shadcn-vue 打造的桌面应用框架，提供了完整的 UI 组件库和开发环境。

## 环境要求

- Node.js 18+ 或更高版本
- pnpm 或 npm/yarn 包管理器

## 安装依赖

```bash
pnpm install
```

## 开发模式

```bash
pnpm dev
```

## 构建生产版本

```bash
pnpm build
```

## 项目结构

```
desktop-app/
├── electron/         # Electron 主进程代码
├── public/           # 静态资源
├── src/              # 源代码
│   ├── components/   # UI 组件
│   ├── lib/          # 工具函数
│   ├── App.vue       # 根组件
│   └── main.ts       # 入口文件
└── docs/             # 文档目录
```
