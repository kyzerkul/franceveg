import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Shield } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  const adminIds = (process.env.ADMIN_CLERK_IDS ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean)

  if (!userId || !adminIds.includes(userId)) {
    redirect('/unauthorized')
  }

  const user = await currentUser()
  const displayName = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? '—'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="h-full flex overflow-hidden" style={{ background: '#F4F6F5' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="shrink-0 px-6 py-3 flex items-center justify-between"
          style={{ background: 'white', borderBottom: '1px solid #E8EEEB' }}
        >
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: '#40916C' }} />
            <span className="text-xs font-medium" style={{ color: '#40916C' }}>Panneau admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{displayName}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #40916C, #1B4332)' }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
