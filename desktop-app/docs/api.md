# API 文档 / API Documentation

## 目录 / Table of Contents

- [IPC 通信 / IPC Communication](#ipc-通信--ipc-communication)
- [窗口管理 / Window Management](#窗口管理--window-management)
- [自动更新 / Auto Updates](#自动更新--auto-updates)
- [数据持久化 / Data Persistence](#数据持久化--data-persistence)

## IPC 通信 / IPC Communication

### 发送消息到主进程 / Send Message to Main Process

在渲染进程中使用 `ipcRenderer` 发送消息：

```typescript
import { ipcRenderer } from 'electron'

// 发送同步消息
const result = ipcRenderer.sendSync('sync-message', 'payload')

// 发送异步消息
ipcRenderer.send('async-message', 'payload')

// 异步消息接收响应
ipcRenderer.invoke('invoke-message', 'payload').then((response) => {
  console.log(response)
})
```

### 窗口状态事件 / Window State Events

监听窗口状态变化：

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.on('window-state-changed', (event, state) => {
  console.log('Window state:', state) // 'maximized' or 'normal'
})
```

## 窗口管理 / Window Management

### 最小化窗口 / Minimize Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-minimize')
```

### 最大化/还原窗口 / Maximize/Restore Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-maximize')
```

### 关闭窗口 / Close Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-close')
```

## 自动更新 / Auto Updates

### 检查更新 / Check for Updates

```typescript
import { ipcRenderer } from 'electron'

const result = await ipcRenderer.invoke('check-for-update')
```

### 下载更新 / Download Update

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('download-update')
```

### 安装更新 / Install Update

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('install-update')
```

### 监听更新状态 / Listen for Update Status

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.on('update-status', (event, { status, info, progress, error }) => {
  switch (status) {
    case 'checking':
      console.log('Checking for updates...')
      break
    case 'available':
      console.log('Update available:', info)
      break
    case 'not-available':
      console.log('No updates available')
      break
    case 'downloading':
      console.log('Downloading:', progress)
      break
    case 'downloaded':
      console.log('Update downloaded')
      break
    case 'error':
      console.error('Update error:', error)
      break
  }
})
```

## 数据持久化 / Data Persistence

### electron-store

项目使用 `electron-store` 进行数据持久化。

在主进程中使用：

```typescript
import Store from 'electron-store'

const store = new Store({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: false,
    },
  },
})

// 设置值
store.set('key', value)

// 获取值
const value = store.get('key')

// 删除值
store.delete('key')

// 检查是否存在
const has = store.has('key')
```

---

# API Documentation

## Table of Contents

- [IPC Communication](#ipc-communication)
- [Window Management](#window-management)
- [Auto Updates](#auto-updates)
- [Data Persistence](#data-persistence)

## IPC Communication

### Send Message to Main Process

Use `ipcRenderer` in renderer process to send messages:

```typescript
import { ipcRenderer } from 'electron'

// Send sync message
const result = ipcRenderer.sendSync('sync-message', 'payload')

// Send async message
ipcRenderer.send('async-message', 'payload')

// Receive response for async message
ipcRenderer.invoke('invoke-message', 'payload').then((response) => {
  console.log(response)
})
```

### Window State Events

Listen to window state changes:

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.on('window-state-changed', (event, state) => {
  console.log('Window state:', state) // 'maximized' or 'normal'
})
```

## Window Management

### Minimize Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-minimize')
```

### Maximize/Restore Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-maximize')
```

### Close Window

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('window-close')
```

## Auto Updates

### Check for Updates

```typescript
import { ipcRenderer } from 'electron'

const result = await ipcRenderer.invoke('check-for-update')
```

### Download Update

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('download-update')
```

### Install Update

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.send('install-update')
```

### Listen for Update Status

```typescript
import { ipcRenderer } from 'electron'

ipcRenderer.on('update-status', (event, { status, info, progress, error }) => {
  switch (status) {
    case 'checking':
      console.log('Checking for updates...')
      break
    case 'available':
      console.log('Update available:', info)
      break
    case 'not-available':
      console.log('No updates available')
      break
    case 'downloading':
      console.log('Downloading:', progress)
      break
    case 'downloaded':
      console.log('Update downloaded')
      break
    case 'error':
      console.error('Update error:', error)
      break
  }
})
```

## Data Persistence

### electron-store

Project uses `electron-store` for data persistence.

Usage in main process:

```typescript
import Store from 'electron-store'

const store = new Store({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: false,
    },
  },
})

// Set value
store.set('key', value)

// Get value
const value = store.get('key')

// Delete value
store.delete('key')

// Check existence
const has = store.has('key')
```
