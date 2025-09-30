import NextAuth from "next-auth"
import authConfig from "./auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes
} from './routes'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Route kontrolü
  const isApiAuthRoute = req.nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

  // CORS başlıklarını sadece gerekli durumlarda ekle

  // OPTIONS request'leri için CORS response döndür
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      }
    })
  }

  // API auth route'ları için devam et
  if (isApiAuthRoute) {
    return null
  }

  // Giriş yapmış kullanıcıları auth sayfalarından yönlendir
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null
  }

  // Admin sayfaları için sadece login kontrolü
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', nextUrl))
    }
    // Role kontrolü sayfa seviyesinde yapılacak
  }

  // Korumalı sayfalara erişim kontrolü
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  return null
})

// Middleware'in çalışacağı path'leri belirle
export const config = {
  matcher: [
    // Next.js internal dosyalarını ve static dosyaları atla
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API route'ları için her zaman çalıştır
    '/(api|trpc)(.*)',
  ],
}
