# 插件开发指南

## 简介

本指南将帮助您了解如何为项目创建和开发插件。

## 快速开始

### 创建一个插件

```typescript
import type { Plugin, PluginContext } from '@your-package/plugins'

const MyPlugin: Plugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'A simple example plugin',
    author: 'Your Name',
  },

  async install(context: PluginContext) {
    // 注册组件
    // context.registerComponent('MyComponent', MyComponent)

    // 注册路由
    // context.registerRoute('/my-plugin-page', MyPluginPage)

    // 注册命令
    context.registerCommand('greet', (name: string) => {
      return `Hello, ${name}!`
    })
  },

  async uninstall() {
    // 清理代码
  },
}

export default MyPlugin
```

### 使用插件

```typescript
import { pluginManager } from '@your-package/plugins'
import MyPlugin from './my-plugin'

// 安装插件
await pluginManager.install(MyPlugin)

// 执行命令
const result = pluginManager.executeCommand('my-plugin-greet', 'World')
console.log(result) // Hello, World!
```

## API 参考

### PluginMetadata

| Property    | Type   | Required | Description |
| ----------- | ------ | -------- | ----------- |
| name        | string | true     | 插件名称    |
| version     | string | true     | 版本号      |
| description | string | true     | 插件描述    |
| author      | string | true     | 作者        |
| license     | string | false    | 许可证      |
| homepage    | string | false    | 主页地址    |

### PluginContext

| Method            | Description  |
| ----------------- | ------------ |
| registerComponent | 注册组件     |
| registerRoute     | 注册路由     |
| registerStore     | 注册状态管理 |
| registerCommand   | 注册命令     |
