type LogLevel = 'info' | 'warn' | 'error'

type LogMessage = {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private log(level: LogLevel, message: string, data?: unknown) {
    const logMessage: LogMessage = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    }

    switch (level) {
      case 'info':
        console.log(JSON.stringify(logMessage))
        break
      case 'warn':
        console.warn(JSON.stringify(logMessage))
        break
      case 'error':
        console.error(JSON.stringify(logMessage))
        break
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data)
  }
}

export const logger = new Logger() 