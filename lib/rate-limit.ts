interface RateLimitOptions {
  interval: number
  uniqueTokenPerInterval: number
}

interface RateLimitStore {
  tokens: Map<string, number[]>
}

const store: RateLimitStore = {
  tokens: new Map()
}

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options

  return {
    check: async (token: string, limit: number) => {
      const now = Date.now()
      const timestamps = store.tokens.get(token) || []
      const windowStart = now - interval

      // Remove timestamps older than the current interval
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart)

      if (validTimestamps.length >= limit) {
        throw new Error('Rate limit exceeded')
      }

      validTimestamps.push(now)
      store.tokens.set(token, validTimestamps)

      // Cleanup old tokens
      if (store.tokens.size > uniqueTokenPerInterval) {
        const oldestToken = [...store.tokens.entries()]
          .sort(([, aTimestamps], [, bTimestamps]) => {
            const aOldest = Math.min(...aTimestamps)
            const bOldest = Math.min(...bTimestamps)
            return aOldest - bOldest
          })[0][0]
        store.tokens.delete(oldestToken)
      }

      return true
    }
  }
} 