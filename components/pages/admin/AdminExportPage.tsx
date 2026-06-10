'use client'

import { getExportUrl } from '@/lib/api'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'

export function AdminExportPage() {
  const exports = [
    {
      label: 'Verified entries (JSON)',
      desc: 'Full structured data for verified entries',
      href: getExportUrl('json', 'verified'),
      icon: FileJson,
    },
    {
      label: 'Verified entries (CSV)',
      desc: 'Spreadsheet-friendly format',
      href: getExportUrl('csv', 'verified'),
      icon: FileSpreadsheet,
    },
    {
      label: 'All entries (JSON)',
      desc: 'Includes pending and rejected',
      href: getExportUrl('json', 'all'),
      icon: FileJson,
    },
    {
      label: 'Pending review (JSON)',
      desc: 'Community submissions awaiting review',
      href: getExportUrl('json', 'pending_review'),
      icon: FileJson,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Export</h1>
        <p className="text-muted-foreground text-sm mt-1">Download dictionary data for backup or analysis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exports.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
          >
            <item.icon size={24} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <Download size={16} className="ml-auto text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </div>
  )
}
