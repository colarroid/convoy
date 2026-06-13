'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppNav from '@/components/AppNav'
import { getNotifications, markAllRead, formatNotifTime, type AppNotification } from '@/lib/notifications'

function iconFor(title: string) {
  const t = title.toLowerCase()
  if (t.includes('approved')) return { cls: 'bg-green-50 text-green-600', path: 'M4.5 12.75l6 6 9-13.5' }
  if (t.includes('declined') || t.includes('cancelled') || t.includes('left')) return { cls: 'bg-gray-100 text-gray-500', path: 'M6 18L18 6M6 6l12 12' }
  if (t.includes('request')) return { cls: 'bg-blue-50 text-blue-600', path: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z' }
  return { cls: 'bg-gray-100 text-gray-500', path: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then(data => {
        setItems(data)
        if (data.some(n => !n.read)) markAllRead().catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppNav />

      <main className="flex-1 w-full max-w-xl mx-auto px-5 md:px-8 pt-8 pb-12">
        <h1 className="text-3xl font-bold text-black mb-7 animate-fade-up">Notifications</h1>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-16 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-black mb-2">No notifications yet</h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Ride requests, approvals and updates will show up here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
            {items.map((n, i) => {
              const ic = iconFor(n.title)
              const clickable = !!n.url
              const inner = (
                <div className="flex items-start gap-3 px-4 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ic.cls}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={ic.path} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-black truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                    </div>
                    {n.body && <p className="text-sm text-gray-500 leading-snug mt-0.5">{n.body}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatNotifTime(n.created_at)}</p>
                  </div>
                </div>
              )
              return clickable ? (
                <button
                  key={n.id}
                  onClick={() => router.push(n.url!)}
                  className="w-full text-left hover:bg-gray-50 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {inner}
                </button>
              ) : (
                <div key={n.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>{inner}</div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
