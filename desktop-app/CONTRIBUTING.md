# 贡献指南

感谢你有兴趣为小黑助手做出贡献！

## 开发流程

### 1. Fork 仓库

首先在 GitHub 上 Fork 本仓库。

### 2. 克隆仓库

```bash
git clone https://github.com/your-username/xiaohei-helper.git
cd xiaohei-helper/desktop-app
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 4. 安装依赖

```bash
pnpm install
```

### 5. 开发

```bash
pnpm dev
```

## 代码规范

### 代码风格

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```bash
# 自动修复
pnpm lint

# 格式化
pnpm format
```

### 提交规范

提交信息遵循以下格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

## 测试

在提交代码前，请确保：
```bash
# 类型检查
pnpm type-check

# 运行测试
pnpm test:run

# E2E 测试
pnpm test:e2e
```

## Pull Request

完成开发后：
1. 确保所有测试通过
2. 提交你的代码
3. 创建 Pull Request
4. 描述你的变更
