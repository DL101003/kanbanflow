interface ErrorContext {
  [key: string]: any
}

class ErrorTracker {
  private static instance: ErrorTracker

  static getInstance(): ErrorTracker {
    if (!this.instance) {
      this.instance = new ErrorTracker()
    }
    return this.instance
  }

  logError(error: Error, context?: ErrorContext): void {
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('🔴 Error:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      })
    }

    // In production, you would send to error tracking service
    if (import.meta.env.PROD) {
      this.sendToService(error, context)
    }
  }

  private sendToService(error: Error, context?: ErrorContext): void {
    // TODO: Integrate with Sentry, LogRocket, etc.
    // For now, just log to console
    console.error('Production error:', error.message)
  }
}

export const errorTracker = ErrorTracker.getInstance()