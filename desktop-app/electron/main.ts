import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Store from 'electron-store'

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  isMaximized: boolean
}

interface StoreSchema {
  windowState: WindowState
}

const store = new Store<StoreSchema>({
  defaults: {
    windowState: {
      width: 1200,
      height: 800,
      isMaximized: false,
    },
  },
})

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

function getWindowState(): WindowState {
  const defaultState: WindowState = {
    width: 1200,
    height: 800,
    isMaximized: false,
  }

  const savedState = store.get('windowState', defaultState)

  const displays = screen.getAllDisplays()

  if (savedState.x !== undefined && savedState.y !== undefined) {
    const isOnScreen = displays.some((display) => {
      const { x, y, width, height } = display.bounds
      return (
        savedState.x! >= x &&
        savedState.x! < x + width &&
        savedState.y! >= y &&
        savedState.y! < y + height
      )
    })

    if (!isOnScreen) {
      return defaultState
    }
  } else {
    return defaultState
  }

  return savedState
}

function saveWindowState(): void {
  if (!win) return

  const isMaximized = win.isMaximized()

  if (!isMaximized) {
    const bounds = win.getBounds()
    store.set('windowState', {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: false,
    })
  } else {
    const currentState = store.get('windowState')
    store.set('windowState', {
      ...currentState,
      isMaximized: true,
    })
  }
}

function createTrayIcon() {
  if (process.platform === 'darwin') {
    return nativeImage.createFromPath(getIconPath('tray-icon-mac.png')).resize({ width: 22, height: 22 })
  }
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
  const windowState = getWindowState()

  win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
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
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (windowState.x === undefined || windowState.y === undefined) {
    win.center()
  }

  if (windowState.isMaximized) {
    win.maximize()
  }

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

  win.on('close', (e) => {
    saveWindowState()
    if (tray) {
      e.preventDefault()
      win?.hide()
    }
  })

  win.on('closed', () => {
    win = null
  })
}

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

function setupAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    win?.webContents.send('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    win?.webContents.send('update-status', { status: 'available', info })
  })

  autoUpdater.on('update-not-available', (info) => {
    win?.webContents.send('update-status', { status: 'not-available', info })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    win?.webContents.send('update-status', { status: 'downloading', progress: progressObj })
  })

  autoUpdater.on('update-downloaded', (info) => {
    win?.webContents.send('update-status', { status: 'downloaded', info })
  })

  autoUpdater.on('error', (err) => {
    win?.webContents.send('update-status', { status: 'error', error: err.message })
  })
}

ipcMain.handle('check-for-update', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return result
  } catch (err) {
    return null
  }
})

ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(getIconPath('icon.png'))
  }
  createWindow()
  createTray()
  setupAutoUpdater()
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
  saveWindowState()
  tray?.destroy()
  tray = null
})
