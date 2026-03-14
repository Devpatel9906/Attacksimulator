const Redis = require('ioredis')

const isProduction = process.env.NODE_ENV === 'production'
const redisUrl = process.env.REDIS_URL

let redis = null

// Only connect to Redis if we have a real URL, or if we are in development
if (redisUrl && (redisUrl.includes('localhost') === false || !isProduction)) {
  redis = new Redis(redisUrl, {
    retryStrategy: (times) => {
      // Limit retries to not crash the server on boot
      if (times > 3) return null
      return Math.min(times * 50, 2000)
    },
    maxRetriesPerRequest: 1
  })

  redis.on('connect', () => console.log('Redis connected successfully'))
  redis.on('error', (err) => console.log('Redis connection error (Optional service):', err.message))
} else {
  console.log('Redis skipped: No valid REDIS_URL provided for production or using localhost fallback.')
  // Provide a dummy mock so app doesn't crash when calling redis.get/set
  redis = {
    get: async () => null,
    set: async () => null,
    del: async () => null,
    on: () => {}
  }
}

module.exports = redis