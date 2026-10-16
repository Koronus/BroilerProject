import { Info } from "lucide-react"

import type { BatchPassportResponse } from "@/lib/batch-passport"
import { issueLabels, noData } from "@/lib/batch-passport-display"

export function BatchPassportDataQuality({ dataQuality }: { dataQuality: BatchPassportResponse["dataQuality"] }) {
  if (dataQuality.complete) return null

  const groupedIssues = Array.from(
    dataQuality.issues.reduce((groups, issue) => {
      const label = issueLabels[issue.code] ?? issue.message ?? noData
      groups.set(label, (groups.get(label) ?? 0) + 1)
      return groups
    }, new Map<string, number>()),
  )

  return (
    <section className="border-b border-amber-200 bg-amber-50/80 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/30 md:px-6">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
        <div>
          <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Данные паспорта неполные</h2>
          {groupedIssues.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
              {groupedIssues.map(([label, count]) => (
                <li key={label}>• {label}{count > 1 ? ` (${count})` : ""}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{noData}</p>
          )}
        </div>
      </div>
    </section>
  )
}
