export interface PluginMetadata {
  name: string
  version: string
  description: string
  author: string
  license?: string
  homepage?: string
}

export interface PluginContext {
  registerComponent(name: string, component: any): void
  registerRoute(path: string, component: any, meta?: Record<string, any>): void
  registerStore(name: string, store: any): void
  registerCommand(name: string, handler: (...args: any[]) => any): void
}

export interface Plugin {
  metadata: PluginMetadata
  install(context: PluginContext): void | Promise<void>
  uninstall?(): void | Promise<void>
}
