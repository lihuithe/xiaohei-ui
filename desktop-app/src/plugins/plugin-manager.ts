import type { Plugin, PluginContext } from './types'

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map()
  private components: Map<string, any> = new Map()
  private routes: Array<{ path: string; component: any; meta?: Record<string, any> }> = []
  private stores: Map<string, any> = new Map()
  private commands: Map<string, (...args: any[]) => any> = new Map()

  private createPluginContext(pluginName: string): PluginContext {
    return {
      registerComponent: (name, component) => {
        const componentKey = `${pluginName}-${name}`
        this.components.set(componentKey, component)
      },
      registerRoute: (path, component, meta) => {
        this.routes.push({ path, component, meta })
      },
      registerStore: (name, store) => {
        const storeKey = `${pluginName}-${name}`
        this.stores.set(storeKey, store)
      },
      registerCommand: (name, handler) => {
        const commandKey = `${pluginName}-${name}`
        this.commands.set(commandKey, handler)
      },
    }
  }

  async install(plugin: Plugin): Promise<void> {
    const { name } = plugin.metadata
    if (this.plugins.has(name)) {
      console.warn(`Plugin ${name} is already installed.`)
      return
    }

    const context = this.createPluginContext(name)
    await plugin.install(context)
    this.plugins.set(name, plugin)
    console.log(`Plugin ${name} installed successfully.`)
  }

  async uninstall(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`Plugin ${pluginName} not found.`)
      return
    }

    if (plugin.uninstall) {
      await plugin.uninstall()
    }

    this.plugins.delete(pluginName)

    const componentKeys = [...this.components.keys()].filter((k) => k.startsWith(`${pluginName}-`))
    componentKeys.forEach((key) => this.components.delete(key))

    this.routes = this.routes.filter((r) => !r.path.startsWith(`/${pluginName}`))

    const storeKeys = [...this.stores.keys()].filter((k) => k.startsWith(`${pluginName}-`))
    storeKeys.forEach((key) => this.stores.delete(key))

    const commandKeys = [...this.commands.keys()].filter((k) => k.startsWith(`${pluginName}-`))
    commandKeys.forEach((key) => this.commands.delete(key))

    console.log(`Plugin ${pluginName} uninstalled successfully.`)
  }

  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  getComponents(): Map<string, any> {
    return this.components
  }

  getRoutes(): Array<{ path: string; component: any; meta?: Record<string, any> }> {
    return this.routes
  }

  getStores(): Map<string, any> {
    return this.stores
  }

  executeCommand(commandName: string, ...args: any[]): any {
    const command = this.commands.get(commandName)
    if (!command) {
      throw new Error(`Command ${commandName} not found.`)
    }
    return command(...args)
  }
}

export const pluginManager = new PluginManager()
