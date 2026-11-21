"use client"

import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  Shirt,
  Ruler,
  CloudSun,
  Sparkles,
  Footprints,
  ShoppingBag,
  Gem,
} from "lucide-react"
import type { Category } from "@/lib/wardrobe-data"

const iconMap: Record<string, React.ElementType> = {
  grid: LayoutGrid,
  shirt: Shirt,
  ruler: Ruler,
  cloud: CloudSun,
  sparkles: Sparkles,
  footprints: Footprints,
  "shopping-bag": ShoppingBag,
  gem: Gem,
}

interface CategoryBarProps {
  categories: { id: Category; label: string; icon: string }[]
  activeCategory: Category
  onCategoryChange: (category: Category) => void
  counts: Record<Category, number>
}

export function CategoryBar({
  categories,
  activeCategory,
  onCategoryChange,
  counts,
}: CategoryBarProps) {
  return (
    <nav className="border-b border-border bg-background" aria-label="衣物分类">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {categories.map((category) => {
            const Icon = iconMap[category.icon]
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{category.label}</span>
                <span
                  className={cn(
                    "ml-0.5 text-xs tabular-nums",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"
                  )}
                >
                  {counts[category.id]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
