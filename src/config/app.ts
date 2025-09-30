/**
 * Application Configuration Management
 * Centralized configuration for the entire application
 */

// Environment validation
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL'
] as const

// Validate environment variables
function validateEnv() {
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Run validation in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnv()
}

// Application Configuration
export const appConfig = {
  // Environment
  env: process.env.NODE_ENV as 'development' | 'production' | 'test',

  // URLs
  baseUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    pages: {
      signIn: '/auth/login',
      signUp: '/auth/register',
      signOut: '/',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request',
      newUser: '/profile'
    }
  },

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Email (optional)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    server: process.env.EMAIL_SERVER,
    apiKey: process.env.EMAIL_API_KEY,
  },

  // Feature Flags
  features: {
    twoFactorAuth: process.env.ENABLE_TWO_FACTOR === 'true',
    emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    socialLogins: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID,
    }
  },

  // UI Configuration
  ui: {
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'Next Auth App',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Professional authentication boilerplate',
    logo: process.env.NEXT_PUBLIC_LOGO_URL || '/logo.svg',
    favicon: process.env.NEXT_PUBLIC_FAVICON_URL || '/favicon.ico',
    theme: {
      primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#000000',
      secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#666666',
    }
  },

  // Navigation Configuration
  navigation: {
    main: [
      { title: 'Dashboard', href: '/', icon: 'Home' },
      { title: 'Profile', href: '/profile', icon: 'User' },
      { title: 'Settings', href: '/settings', icon: 'Settings' },
      { title: 'Billing', href: '/billing', icon: 'CreditCard' },
    ],
    admin: [
      { title: 'Admin', href: '/admin', icon: 'Shield', roles: ['ADMIN'] },
    ]
  },

  // Security Configuration
  security: {
    bcryptSaltRounds: 12,
    tokenExpirationTime: {
      verification: 15 * 60 * 1000, // 15 minutes
      passwordReset: 15 * 60 * 1000, // 15 minutes
      twoFactor: 5 * 60 * 1000, // 5 minutes
    },
    rateLimiting: {
      loginAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    }
  },

  // Monitoring & Analytics
  monitoring: {
    enableLogging: process.env.ENABLE_LOGGING === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    analyticsId: process.env.ANALYTICS_ID,
  }
} as const

// Configuration type for TypeScript
export type AppConfig = typeof appConfig

// Helper functions
export const isDevelopment = appConfig.env === 'development'
export const isProduction = appConfig.env === 'production'
export const isTest = appConfig.env === 'test'

// Export specific configurations
export const authConfig = appConfig.auth
export const databaseConfig = appConfig.database
export const uiConfig = appConfig.ui
export const securityConfig = appConfig.security
export const navigationConfig = appConfig.navigation
