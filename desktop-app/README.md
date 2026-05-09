# 小黑助手 / Xiaohei Assistant

一个基于 Electron + Vue 3 + TypeScript 的现代化桌面应用程序。

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [文档](#文档)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目简介

小黑助手是一个使用现代前端技术栈构建的桌面应用程序，结合了 Electron、Vue 3、TypeScript、Tailwind CSS 等技术，提供优雅的用户界面和强大的功能。

## 功能特性

- 🚀 **现代化技术栈**：Electron 41 + Vue 3 + TypeScript + Vite
- 🎨 **精美 UI**：使用 shadcn-vue 组件库 + Tailwind CSS
- 💾 **数据持久化**：electron-store 本地存储
- 🔄 **自动更新**：electron-updater 自动更新支持
- 🖥️ **托盘图标**：系统托盘支持
- 📱 **窗口管理**：自定义标题栏、窗口状态记忆
- 🧪 **测试支持**：Vitest 单元测试
- 📦 **跨平台**：支持 Windows、macOS、Linux

## 快速开始

### 环境要求

- Node.js >= 18.x
- pnpm >= 8.x

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
pnpm build
```

### 代码检查与格式化

```bash
# Lint
pnpm lint

# Format
pnpm format
```

### 运行测试

```bash
pnpm test
```

## 开发指南

### 项目结构

```
desktop-app/
├── electron/              # Electron 主进程代码
│   ├── main.ts           # 主进程入口
│   └── preload.cjs       # 预加载脚本
├── src/                  # 渲染进程代码
│   ├── components/       # Vue 组件
│   │   └── ui/          # UI 组件库
│   ├── stores/          # Pinia 状态管理
│   ├── lib/             # 工具函数
│   ├── App.vue          # 根组件
│   └── main.ts          # 渲染进程入口
├── resources/           # 资源文件
├── public/              # 静态资源
├── tests/               # 测试文件
└── scripts/             # 构建脚本
```

### 技术栈

- **Electron**：跨平台桌面应用框架
- **Vue 3**：渐进式 JavaScript 框架
- **TypeScript**：类型安全的 JavaScript 超集
- **Vite**：下一代前端构建工具
- **Tailwind CSS**：实用优先的 CSS 框架
- **shadcn-vue**：基于 Radix UI 的 Vue 组件库
- **Vitest**：Vue 单元测试框架
- **electron-store**：简单的数据持久化
- **electron-updater**：自动更新功能

## 文档

- [安装指南](./docs/installation.md) - 详细的安装说明
- [API 文档](./docs/api.md) - Electron API 使用说明
- [组件文档](./docs/components.md) - 组件使用指南
- [贡献指南](./CONTRIBUTING.md) - 如何贡献代码
- [更新日志](./CHANGELOG.md) - 版本更新历史

## 贡献指南

我们欢迎任何形式的贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解更多详细信息。

## 许可证

MIT License

---

# Xiaohei Assistant

A modern desktop application built with Electron + Vue 3 + TypeScript.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Quick Start](#quick-start)
- [Development Guide](#development-guide)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Xiaohei Assistant is a desktop application built with modern frontend tech stack, combining Electron, Vue 3, TypeScript, Tailwind CSS, and more to provide an elegant user interface and powerful features.

## Features

- 🚀 **Modern Tech Stack**：Electron 41 + Vue 3 + TypeScript + Vite
- 🎨 **Beautiful UI**：shadcn-vue component library + Tailwind CSS
- 💾 **Data Persistence**：electron-store local storage
- 🔄 **Auto Updates**：electron-updater support
- 🖥️ **Tray Icon**：System tray support
- 📱 **Window Management**：Custom title bar, window state memory
- 🧪 **Testing**：Vitest unit tests
- 📦 **Cross-Platform**：Windows, macOS, Linux support

## Quick Start

### Requirements

- Node.js >= 18.x
- pnpm >= 8.x

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm dev
```

### Build Application

```bash
pnpm build
```

### Lint & Format

```bash
# Lint
pnpm lint

# Format
pnpm format
```

### Run Tests

```bash
pnpm test
```

## Development Guide

### Project Structure

```
desktop-app/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry
│   └── preload.cjs       # Preload script
├── src/                  # Renderer process
│   ├── components/       # Vue components
│   │   └── ui/          # UI component library
│   ├── stores/          # Pinia state management
│   ├── lib/             # Utility functions
│   ├── App.vue          # Root component
│   └── main.ts          # Renderer entry
├── resources/           # Resource files
├── public/              # Static assets
├── tests/               # Test files
└── scripts/             # Build scripts
```

### Tech Stack

- **Electron**：Cross-platform desktop application framework
- **Vue 3**：Progressive JavaScript framework
- **TypeScript**：Type-safe JavaScript superset
- **Vite**：Next-generation frontend tooling
- **Tailwind CSS**：Utility-first CSS framework
- **shadcn-vue**：Vue component library based on Radix UI
- **Vitest**：Vue unit testing framework
- **electron-store**：Simple data persistence
- **electron-updater**：Auto-update functionality

## Documentation

- [Installation Guide](./docs/installation.md) - Detailed installation instructions
- [API Documentation](./docs/api.md) - Electron API usage guide
- [Component Documentation](./docs/components.md) - Component usage guide
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute
- [Changelog](./CHANGELOG.md) - Version history

## Contributing

We welcome any form of contribution! Please check our [Contributing Guide](./CONTRIBUTING.md) for more details.

## License

MIT License
