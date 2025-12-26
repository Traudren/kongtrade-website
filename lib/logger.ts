
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  action?: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(level: LogLevel, message: string, data?: any, userId?: string, action?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId,
      action
    };
  }

  info(message: string, data?: any, userId?: string, action?: string) {
    const log = this.formatLog('info', message, data, userId, action);
    console.log(JSON.stringify(log));
  }

  warn(message: string, data?: any, userId?: string, action?: string) {
    const log = this.formatLog('warn', message, data, userId, action);
    console.warn(JSON.stringify(log));
  }

  error(message: string, error?: any, userId?: string, action?: string) {
    const log = this.formatLog('error', message, error, userId, action);
    console.error(JSON.stringify(log));
    
    // В продакшне можно отправлять в внешний сервис логирования
    if (this.isProduction) {
      // Например, отправка в Sentry, LogRocket и т.д.
    }
  }

  debug(message: string, data?: any, userId?: string, action?: string) {
    if (!this.isProduction) {
      const log = this.formatLog('debug', message, data, userId, action);
      console.debug(JSON.stringify(log));
    }
  }

  // Специальные методы для аудита
  auditLog(action: string, userId: string, details: any) {
    this.info(`AUDIT: ${action}`, details, userId, action);
  }

  securityLog(event: string, userId?: string, details?: any) {
    this.warn(`SECURITY: ${event}`, details, userId, 'security');
  }
}

export const logger = new Logger();
