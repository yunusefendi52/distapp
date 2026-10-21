type LogLevel = 'log' | 'warn' | 'error'

export function createTaggedLogger(tag: string) {
    const emit = (level: LogLevel, message: string, ...args: unknown[]) => {
        console[level](`[${new Date().toISOString()}] [${tag}] ${message}`, ...args)
    }
    return {
        log: (message: string, ...args: unknown[]) => emit('log', message, ...args),
        warn: (message: string, ...args: unknown[]) => emit('warn', message, ...args),
        error: (message: string, ...args: unknown[]) => emit('error', message, ...args),
    }
}
