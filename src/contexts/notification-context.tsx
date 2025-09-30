"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: Date
  read: boolean
  expiresAt?: Date
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // LocalStorage helper functions
  const saveToStorage = useCallback((notifications: Notification[]) => {
    try {
      const serialized = notifications.map(n => ({
        ...n,
        timestamp: n.timestamp.toISOString(),
        expiresAt: n.expiresAt?.toISOString(),
        // Action fonksiyonlarını localStorage'a kaydedemeyiz, null yapıyoruz
        action: n.action ? { ...n.action, onClick: null } : undefined
      }))
      localStorage.setItem('notifications', JSON.stringify(serialized))
    } catch (error) {
      console.warn('Failed to save notifications to localStorage:', error)
    }
  }, [])

  const loadFromStorage = useCallback((): Notification[] => {
    try {
      const stored = localStorage.getItem('notifications')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((n: { timestamp: string; expiresAt?: string;[key: string]: unknown }) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          // Action'ları yeniden oluşturmamız gerekiyor
          action: n.action ? {
            ...n.action,
            onClick: () => console.log('Action restored from storage')
          } : undefined
        }))
      }
    } catch (error) {
      console.warn('Failed to load notifications from localStorage:', error)
    }
    return []
  }, [])

  // Component mount'da localStorage'dan yükle
  useEffect(() => {
    const stored = loadFromStorage()
    setNotifications(stored)
    setIsLoaded(true)
  }, [loadFromStorage])

  // Notifications değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(notifications)
    }
  }, [notifications, saveToStorage, isLoaded])

  // Expired notification'ları temizle
  useEffect(() => {
    const cleanupExpired = () => {
      const now = new Date()
      setNotifications(prev =>
        prev.filter(n => !n.expiresAt || n.expiresAt > now)
      )
    }

    // İlk cleanup
    cleanupExpired()

    // Her dakika kontrol et
    const interval = setInterval(cleanupExpired, 60000)

    return () => clearInterval(interval)
  }, [isLoaded])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const now = new Date()
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: now,
      read: false,
      // 5 dakika sonra expire olsun (error'lar 10 dakika)
      expiresAt: new Date(now.getTime() + (notification.type === 'error' ? 10 : 5) * 60 * 1000),
    }

    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    // localStorage'ı da temizle
    try {
      localStorage.removeItem('notifications')
    } catch (error) {
      console.warn('Failed to clear notifications from localStorage:', error)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
