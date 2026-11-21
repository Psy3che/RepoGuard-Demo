"use client"

import { Shirt, Heart, RefreshCw, TrendingUp } from "lucide-react"
import type { ClothingItem } from "@/lib/wardrobe-data"

interface WardrobeStatsProps {
  items: ClothingItem[]
}

export function WardrobeStats({ items }: WardrobeStatsProps) {
  const totalItems = items.length
  const favorites = items.filter((i) => i.favorite).length
  const totalWears = items.reduce((sum, i) => sum + i.wearCount, 0)
  const avgWears = totalItems > 0 ? Math.round(totalWears / totalItems) : 0

  const stats = [
    {
      label: "衣物总数",
      value: totalItems,
      unit: "件",
      icon: Shirt,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "收藏衣物",
      value: favorites,
      unit: "件",
      icon: Heart,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "总穿着次数",
      value: totalWears,
      unit: "次",
      icon: RefreshCw,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      label: "平均穿着",
      value: avgWears,
      unit: "次/件",
      icon: TrendingUp,
      color: "bg-muted text-muted-foreground",
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl bg-card border border-border p-4 transition-shadow hover:shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-semibold tabular-nums text-foreground">
                {stat.value}
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                  {stat.unit}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
