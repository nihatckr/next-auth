// Basit rate limiting sistemi (production'da Redis kullanılmalı)

interface LoginAttempt {
  count: number;
  lastAttempt: Date;
  lockedUntil?: Date;
}

// In-memory storage (production'da Redis veya database kullanın)
const loginAttempts = new Map<string, LoginAttempt>();

export class RateLimiter {
  private maxAttempts: number;
  private windowMs: number;
  private lockoutMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, lockoutMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.lockoutMs = lockoutMs;
  }

  // Giriş denemesi kontrol et
  checkAttempt(identifier: string): { allowed: boolean; remainingAttempts?: number; lockoutTime?: Date } {
    const now = new Date();
    const attempt = loginAttempts.get(identifier);

    if (!attempt) {
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
    }

    // Eğer hesap kilitlenmişse
    if (attempt.lockedUntil && now < attempt.lockedUntil) {
      return {
        allowed: false,
        lockoutTime: attempt.lockedUntil
      };
    }

    // Kilit süresi dolmuşsa attempt'i sıfırla
    if (attempt.lockedUntil && now >= attempt.lockedUntil) {
      loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
    }

    // Window süresi dolmuşsa attempt'i sıfırla
    if (now.getTime() - attempt.lastAttempt.getTime() > this.windowMs) {
      loginAttempts.delete(identifier);
      return { allowed: true, remainingAttempts: this.maxAttempts - 1 };
    }

    // Maksimum deneme sayısına ulaşılmışsa hesabı kilitle
    if (attempt.count >= this.maxAttempts) {
      const lockedUntil = new Date(now.getTime() + this.lockoutMs);
      loginAttempts.set(identifier, {
        ...attempt,
        lockedUntil
      });
      return {
        allowed: false,
        lockoutTime: lockedUntil
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - attempt.count - 1
    };
  }

  // Başarısız deneme kaydet
  recordFailedAttempt(identifier: string): void {
    const now = new Date();
    const attempt = loginAttempts.get(identifier);

    if (!attempt) {
      loginAttempts.set(identifier, {
        count: 1,
        lastAttempt: now
      });
    } else {
      // Window içindeyse count'u artır
      if (now.getTime() - attempt.lastAttempt.getTime() <= this.windowMs) {
        loginAttempts.set(identifier, {
          count: attempt.count + 1,
          lastAttempt: now
        });
      } else {
        // Window dışındaysa yeni başlat
        loginAttempts.set(identifier, {
          count: 1,
          lastAttempt: now
        });
      }
    }
  }

  // Başarılı giriş sonrası attempt'i temizle
  clearAttempts(identifier: string): void {
    loginAttempts.delete(identifier);
  }

  // Kalan süreyi hesapla
  getRemainingLockoutTime(identifier: string): number {
    const attempt = loginAttempts.get(identifier);
    if (!attempt?.lockedUntil) return 0;

    const now = new Date();
    const remaining = attempt.lockedUntil.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remaining / 1000)); // saniye cinsinden
  }
}

// Global rate limiter instance
export const loginRateLimiter = new RateLimiter();
