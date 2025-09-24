 import NextAuth from "next-auth"
 import authConfig from "./auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes}
  from './routes'

 const {auth} = NextAuth(authConfig)

export default auth((req) => {
const {nextUrl} = req

const isLoggedIn = !!req.auth

const isApiAuthRoute = req.nextUrl.pathname.startsWith(apiAuthPrefix)

const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

if (isApiAuthRoute) {
  // Continue to API auth routes
  return null
}

if(isAuthRoute)
  {
    if(isLoggedIn)
    {
      // Redirect logged in users away from auth routes
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null
  }
  if(!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl)


    // Redirect guests away from protected routes
    return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }
  return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
996966
