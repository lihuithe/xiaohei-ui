# 贡献指南 / Contributing Guide

感谢你对本项目的关注！我们欢迎任何形式的贡献。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [提交规范](#提交规范)
- [拉取请求](#拉取请求)

## 行为准则

- 尊重所有参与本项目的贡献者请保持友善、尊重和包容。

## 如何贡献

### 报告问题

如果你发现了 bug 或有新功能建议，请通过 Issue 系统报告。

### 贡献代码

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 开发流程

### 环境设置

```bash
# 克隆仓库
git clone https://github.com/your-username/desktop-app.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 确保代码格式检查和格式化：`pnpm lint && pnpm format`

### 测试

```bash
# 运行测试
pnpm test
```

## 提交规范

我们使用语义化的提交信息：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

## 拉取请求

在提交 Pull Request 之前，请确保：

- 代码通过所有测试
- 代码符合项目的代码规范
- 更新相关文档已更新
- 提交信息符合规范

---

# Contributing Guide

Thank you for your interest in this project! We welcome any form of contribution.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Requests](#pull-requests)

## Code of Conduct

Please be friendly, respectful, and inclusive to all contributors of this project.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature suggestion, please report it through the Issue system.

### Contributing Code

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Workflow

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/desktop-app.git

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Code Style

- Write TypeScript code
- Follow ESLint and Prettier configuration
- Ensure lint and format code: `pnpm lint && pnpm format`

### Testing

```bash
# Run tests
pnpm test
```

## Commit Guidelines

We use semantic commit messages:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting
- `refactor`: Refactoring
- `test`: Testing related
- `chore`: Build/tooling related

## Pull Requests

Before submitting a Pull Request, please ensure:

- All tests pass
- Code follows project style guide
- Relevant documentation is updated
- Commit messages follow the guidelines
