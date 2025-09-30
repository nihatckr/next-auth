// Environment utilities
export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

// Logging helper
export const devLog = (message: string, ...args: unknown[]) => {
  if (isDevelopment) {
    console.log(`[DEV] ${message}`, ...args)
  }
}

export const devError = (message: string, ...args: unknown[]) => {
  if (isDevelopment) {
    console.error(`[DEV ERROR] ${message}`, ...args)
  }
}

export const devWarn = (message: string, ...args: unknown[]) => {
  if (isDevelopment) {
    console.warn(`[DEV WARN] ${message}`, ...args)
  }
}
