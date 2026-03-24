import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Providers } from "@/components/providers"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardLayout>{children}</DashboardLayout>
    </Providers>
  )
}
