import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')

let win: BrowserWindow | null
let tray: Tray | null

function getIconPath(filename: string): string {
  return process.env.VITE_DEV_SERVER_URL
    ? path.join(__dirname, '../resources/icons', filename)
    : path.join(process.resourcesPath, 'icons', filename)
}

function createTrayIcon() {
  if (process.platform === 'darwin') {
    return nativeImage.createFromPath(getIconPath('tray-icon-mac.png')).resize({ width: 22, height: 22 })
  }
  // Windows: 使用 64x64 高分辨率托盘图标，适配高 DPI 屏幕
  return nativeImage.createFromPath(getIconPath('tray-icon.png'))
}

function showWindow() {
  if (!win) {
    createWindow()
  }
  win?.show()
  win?.focus()
}

function createTray() {
  if (tray) return

  tray = new Tray(createTrayIcon())
  tray.setToolTip('小黑助手')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开程序',
      click: showWindow,
    },
    {
      label: '退出程序',
      click: () => {
        tray?.destroy()
        tray = null
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', showWindow)
}

function createWindow() {
  const isMac = process.platform === 'darwin'
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    ...(process.platform === 'darwin' 
    ? {
        vibrancy: 'light',
        visualEffectState: 'active',
      } 
    : {}),
    icon: getIconPath(process.platform === 'win32' ? 'icon-win.png' : 'icon.png'),
    // Windows 下隐藏到托盘时跳过任务栏
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.center()

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.on('maximize', () => {
    win?.webContents.send('window-state-changed', 'maximized')
  })

  win.on('unmaximize', () => {
    win?.webContents.send('window-state-changed', 'normal')
  })

  // 关闭时隐藏到托盘而不是退出
  win.on('close', (e) => {
    if (tray) {
      e.preventDefault()
      win?.hide()
    }
  })

  win.on('closed', () => {
    win = null
  })
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => win?.minimize())
ipcMain.on('window-maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize()
  } else {
    win?.maximize()
  }
})
ipcMain.on('window-close', () => {
  if (process.platform === 'win32') {
    win?.close()
  } else {
    win?.close()
  }
})

app.whenReady().then(() => {
  // macOS: 开发模式下手动设置 Dock 图标
  if (process.platform === 'darwin') {
    app.dock.setIcon(getIconPath('icon.png'))
  }
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win) {
    win.show()
    win.focus()
  } else {
    createWindow()
  }
})

app.on('before-quit', () => {
  tray?.destroy()
  tray = null
})
