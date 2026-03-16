const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    if (times > 3) return null
    return times * 200
  }
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err.message))

module.exports = redis