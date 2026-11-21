"use client"

import { Search } from "lucide-react"

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
