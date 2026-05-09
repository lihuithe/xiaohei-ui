import type { PerformanceMetrics, ErrorEvent, UserEvent, PerformanceReport } from './types'

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private errors: ErrorEvent[] = []
  private events: UserEvent[] = []
  private maxHistoryLength = 1000

  start() {
    this.listenForPerformanceMetrics()
    this.listenForErrors()
    this.listenForUserEvents()
  }

  private listenForPerformanceMetrics() {
    window.addEventListener('load', () => {
      this.collectPageLoadMetrics()
    })

    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          this.recordMetric('largestContentfulPaint', lastEntry.startTime)
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const entry = entries[0] as PerformanceEntry & { startTime: number }
          this.recordMetric('firstContentfulPaint', entry.startTime)
        })
        fcpObserver.observe({ entryTypes: ['first-contentful-paint'] })

        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const entry = entries[0] as PerformanceEntry & {
            processingStart: number
            startTime: number
          }
          this.recordMetric('firstInputDelay', entry.processingStart - entry.startTime)
          this.recordMetric('firstInputTime', entry.startTime)
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.recordMetric('cumulativeLayoutShift', clsValue)
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('PerformanceObserver not supported')
      }
    }
  }

  private collectPageLoadMetrics() {
    const timing = performance.timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      type: 'pageLoad',
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      timeToInteractive: timing.domInteractive - timing.navigationStart,
    }

    this.metrics.push(metrics)
    this.trimMetrics()
  }

  private recordMetric(name: keyof Omit<PerformanceMetrics, 'timestamp' | 'type'>, value: number) {
    let lastMetric = this.metrics[this.metrics.length - 1]
    if (!lastMetric || lastMetric.type !== 'pageLoad') {
      lastMetric = {
        timestamp: Date.now(),
        type: 'pageLoad',
      }
      this.metrics.push(lastMetric)
    }
    lastMetric[name] = value
    this.trimMetrics()
  }

  private trimMetrics() {
    if (this.metrics.length > this.maxHistoryLength) {
      this.metrics = this.metrics.slice(-this.maxHistoryLength)
    }
  }

  private listenForErrors() {
    window.addEventListener('error', (event) => {
      this.errors.push({
        timestamp: Date.now(),
        message: event.message,
        stack: event.error?.stack,
        source: event.filename,
        type: 'error',
      })
      this.trimErrors()
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        timestamp: Date.now(),
        message: String(event.reason),
        type: 'unhandledrejection',
      })
      this.trimErrors()
    })
  }

  private trimErrors() {
    if (this.errors.length > this.maxHistoryLength) {
      this.errors = this.errors.slice(-this.maxHistoryLength)
    }
  }

  private listenForUserEvents() {
    const trackEvent = (type: string, action: string, metadata?: Record<string, any>) => {
      this.events.push({
        timestamp: Date.now(),
        type,
        action,
        metadata,
      })
      this.trimEvents()
    }

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      trackEvent('click', 'element_click', {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
      })
    })

    window.addEventListener('scroll', () => {
      trackEvent('scroll', 'page_scroll', {
        scrollY: window.scrollY,
      })
    })
  }

  private trimEvents() {
    if (this.events.length > this.maxHistoryLength) {
      this.events = this.events.slice(-this.maxHistoryLength)
    }
  }

  trackEvent(type: string, action: string, metadata?: Record<string, any>) {
    this.events.push({
      timestamp: Date.now(),
      type,
      action,
      metadata,
    })
    this.trimEvents()
  }

  getReport(): PerformanceReport {
    return {
      metrics: [...this.metrics],
      errors: [...this.errors],
      events: [...this.events],
      generatedAt: Date.now(),
    }
  }

  clearData() {
    this.metrics = []
    this.errors = []
    this.events = []
  }
}

export const performanceMonitor = new PerformanceMonitor()
