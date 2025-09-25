"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "./ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw } from "lucide-react"

// Session süresi dolmadan önce kullanıcıyı uyaran component
export const SessionTimeoutWarning = () => {
  const { data: session, update } = useSession()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!session?.expires) return

    const checkTimeout = () => {
      const expiresAt = new Date(session.expires).getTime()
      const now = new Date().getTime()
      const remaining = expiresAt - now

      // Son 5 dakika kaldıysa uyar
      if (remaining < 5 * 60 * 1000 && remaining > 0) {
        setShowWarning(true)
        setTimeLeft(Math.floor(remaining / 1000 / 60)) // Dakika cinsinden
      } else if (remaining <= 0) {
        // Session süresi doldu
        setShowWarning(false)
        // Sayfayı yenile veya login'e yönlendir
        window.location.href = '/auth/login'
      }
    }

    // İlk kontrol
    checkTimeout()

    // Her dakika kontrol et
    const interval = setInterval(checkTimeout, 60000)
    return () => clearInterval(interval)
  }, [session])

  const extendSession = async () => {
    try {
      await update() // Session'u yenile
      setShowWarning(false)
    } catch (error) {
      console.error('Session yenilenemedi:', error)
    }
  }

  const dismissWarning = () => {
    setShowWarning(false)
  }

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-amber-200 bg-amber-50 shadow-lg">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-amber-800">
                Oturumunuz yakında sona erecek
              </p>
              <p className="text-sm text-amber-700">
                {timeLeft > 0 ? `${timeLeft} dakika` : 'Az süre'} kaldı
              </p>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={extendSession}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Uzat</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={dismissWarning}
              >
                Kapat
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
