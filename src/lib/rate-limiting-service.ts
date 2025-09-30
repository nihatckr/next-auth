import { loginRateLimiter } from './rate-limiter'

export class RateLimitingService {
  /**
   * Check rate limit for email-based operations
   */
  static checkEmailRateLimit(email: string, operation: 'login' | 'register' | 'reset' = 'login') {
    const rateLimitCheck = loginRateLimiter.checkAttempt(email)

    if (!rateLimitCheck.allowed) {
      const remainingTime = loginRateLimiter.getRemainingLockoutTime(email)
      const minutes = Math.ceil(remainingTime / 60)

      const messages = {
        login: `Çok fazla başarısız deneme. ${minutes} dakika sonra tekrar deneyin.`,
        register: `Çok fazla kayıt denemesi. ${minutes} dakika sonra tekrar deneyin.`,
        reset: `Çok fazla şifre sıfırlama denemesi. ${minutes} dakika sonra tekrar deneyin.`
      }

      return {
        allowed: false,
        error: messages[operation]
      }
    }

    return { allowed: true }
  }

  /**
   * Record failed attempt for rate limiting
   */
  static recordFailedAttempt(email: string) {
    loginRateLimiter.recordFailedAttempt(email)
  }

  /**
   * Clear rate limit attempts for successful operations
   */
  static clearAttempts(email: string) {
    loginRateLimiter.clearAttempts(email)
  }
}
