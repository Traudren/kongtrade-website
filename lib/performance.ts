
interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: any;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTimer(name: string): (metadata?: any) => PerformanceMetric {
    const startTime = Date.now();
    
    return (metadata?: any) => {
      const duration = Date.now() - startTime;
      const metric: PerformanceMetric = {
        name,
        duration,
        timestamp: new Date().toISOString(),
        metadata
      };

      // Логируем медленные операции (> 1 секунды)
      if (duration > 1000) {
        console.warn(`Slow operation detected: ${name} took ${duration}ms`, metadata);
      }

      return metric;
    };
  }

  recordMetric(name: string, value: number, metadata?: any) {
    this.metrics.set(name, value);
    
    // Отправляем в систему мониторинга в продакшне
    if (process.env.NODE_ENV === 'production') {
      // Например, в DataDog, New Relic и т.д.
    }
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

export const performance = new PerformanceMonitor();

// Middleware для мониторинга API
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T {
  return (async (...args: any[]) => {
    const endTimer = performance.startTimer(name);
    
    try {
      const result = await fn(...args);
      const metric = endTimer({ success: true });
      return result;
    } catch (error) {
      const metric = endTimer({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }) as T;
}
