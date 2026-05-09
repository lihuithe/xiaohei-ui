export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch {
      return defaultValue ?? null
    }
  },
  set: (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },
  remove: (key: string) => {
    localStorage.removeItem(key)
  },
  clear: () => {
    localStorage.clear()
  },
}

export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch {
      return defaultValue ?? null
    }
  },
  set: (key: string, value: unknown) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('Session storage set error:', e)
    }
  },
  remove: (key: string) => {
    sessionStorage.removeItem(key)
  },
  clear: () => {
    sessionStorage.clear()
  },
}
