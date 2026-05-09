export interface PerformanceMetrics {
  timestamp: number
  type: 'pageLoad'
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  domContentLoaded?: number
  domInteractive?: number
  timeToInteractive?: number
  cumulativeLayoutShift?: number
  firstInputDelay?: number
  firstInputTime?: number
}

export interface ErrorEvent {
  timestamp: number
  message: string
  stack?: string
  source?: string
  type: 'error' | 'unhandledrejection'
}

export interface UserEvent {
  timestamp: number
  type: string
  action: string
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  metrics: PerformanceMetrics[]
  errors: ErrorEvent[]
  events: UserEvent[]
  generatedAt: number
}
