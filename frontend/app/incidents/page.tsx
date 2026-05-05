import { IncidentsPage } from "@/components/dashboard/incidents-page"

export default function IncidentsRoutePage() {
  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-5">
      <div className="dashboard-shell mx-auto max-w-[1680px] rounded-[28px]">
        <IncidentsPage />
      </div>
    </div>
  )
}
