"use client"

import { Search, Plus, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface WardrobeHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddItem: () => void
  totalItems: number
}

export function WardrobeHeader({
  searchQuery,
  onSearchChange,
  onAddItem,
  totalItems,
}: WardrobeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 9h18M3 9l3-6h12l3 6M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9" />
                <path d="M9 21V13h6v8" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground font-serif md:text-xl">
                {"我的衣橱"}
              </h1>
              <p className="hidden text-xs text-muted-foreground md:block">
                {`${totalItems} 件衣物`}
              </p>
            </div>
          </div>

          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索衣物名称、品牌..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 pl-10 bg-secondary border-transparent focus:border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="筛选"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button
              onClick={onAddItem}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">添加衣物</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索衣物名称、品牌..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 pl-10 bg-secondary border-transparent focus:border-border"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
