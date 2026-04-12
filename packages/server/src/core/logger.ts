type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  readonly level: LogLevel
  readonly timestamp: string
  readonly context: string
  readonly message: string
  readonly data?: unknown
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.context}] ${entry.message}`
  if (entry.data !== undefined) {
    return `${base} ${JSON.stringify(entry.data)}`
  }
  return base
}

function writeLog(entry: LogEntry): void {
  const line = formatEntry(entry)
  if (entry.level === 'error') {
    process.stderr.write(`${line}\n`)
  } else {
    process.stdout.write(`${line}\n`)
  }
}

export interface Logger {
  readonly debug: (message: string, data?: unknown) => void
  readonly info: (message: string, data?: unknown) => void
  readonly warn: (message: string, data?: unknown) => void
  readonly error: (message: string, data?: unknown) => void
}

export function createLogger(context: string): Logger {
  const log = (level: LogLevel) => (message: string, data?: unknown): void => {
    const entry: LogEntry = Object.freeze({
      level,
      timestamp: new Date().toISOString(),
      context,
      message,
      data,
    })
    writeLog(entry)
  }

  return Object.freeze({
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
  })
}
