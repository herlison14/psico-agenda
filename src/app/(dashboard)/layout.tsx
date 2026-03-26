import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8 min-h-full bg-[#F7F5F0]">
          {children}
        </div>
      </main>
    </div>
  )
}
