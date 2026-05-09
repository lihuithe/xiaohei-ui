export const isDev = import.meta.env.DEV || import.meta.env.DEBUG === 'true'

export const debug = (namespace: string, ...args: unknown[]) => {
  if (isDev) {
    console.log(`[${namespace}]`, ...args)
  }
}

export const warn = (namespace: string, ...args: unknown[]) => {
  if (isDev) {
    console.warn(`[${namespace}]`, ...args)
  }
}

export const error = (namespace: string, ...args: unknown[]) => {
  console.error(`[${namespace}]`, ...args)
}

export const measure = async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
  if (!isDev) {
    return fn()
  }

  const start = performance.now()
  try {
    const result = await fn()
    const end = performance.now()
    debug('perf', `${name} took ${(end - start).toFixed(2)}ms`)
    return result
  } catch (e) {
    const end = performance.now()
    debug('perf', `${name} failed after ${(end - start).toFixed(2)}ms`)
    throw e
  }
}
