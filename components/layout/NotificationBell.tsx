'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api'

interface Notification {
  id: string
  type: string
  message: string
  link: string | null
  read: boolean
  createdAt: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // ignore when logged out
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleOpen = () => {
    setOpen((prev) => !prev)
    if (!open) load()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(n.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="ml-auto min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full bottom-0 ml-2 w-80 max-h-96 overflow-hidden rounded-xl border border-border bg-card shadow-lg z-50 md:block hidden">
          <NotificationPanel
            notifications={notifications}
            loading={loading}
            onMarkAllRead={handleMarkAllRead}
            onClickNotification={handleClickNotification}
          />
        </div>
      )}

      {open && (
        <div className="md:hidden fixed inset-x-4 bottom-20 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <NotificationPanel
            notifications={notifications}
            loading={loading}
            onMarkAllRead={handleMarkAllRead}
            onClickNotification={handleClickNotification}
          />
        </div>
      )}
    </div>
  )
}

function NotificationPanel({
  notifications,
  loading,
  onMarkAllRead,
  onClickNotification,
}: {
  notifications: Notification[]
  loading: boolean
  onMarkAllRead: () => void
  onClickNotification: (n: Notification) => void
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">Notifications</span>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">No notifications yet</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id}>
              {n.link ? (
                <Link
                  href={n.link}
                  onClick={() => onClickNotification(n)}
                  className={`block px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <NotificationItem notification={n} />
                </Link>
              ) : (
                <button
                  onClick={() => onClickNotification(n)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <NotificationItem notification={n} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}

function NotificationItem({ notification: n }: { notification: Notification }) {
  return (
    <>
      <p className={!n.read ? 'font-medium' : ''}>{n.message}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {new Date(n.createdAt).toLocaleString()}
      </p>
    </>
  )
}
