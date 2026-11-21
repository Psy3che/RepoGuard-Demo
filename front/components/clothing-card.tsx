"use client"

import { Heart, MoreHorizontal, Calendar, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClothingItem } from "@/lib/wardrobe-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ClothingCardProps {
  item: ClothingItem
  onToggleFavorite: (id: string) => void
  onViewDetail: (item: ClothingItem) => void
  onDelete: (id: string) => void
  onEdit: (item: ClothingItem) => void
}

export function ClothingCard({ item, onToggleFavorite, onViewDetail, onDelete, onEdit }: ClothingCardProps) {
  return (
    <article
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      onClick={() => onViewDetail(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(item.id)
          }}
          className={cn(
            "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
            item.favorite
              ? "bg-accent text-accent-foreground shadow-md"
              : "bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-background"
          )}
          aria-label={item.favorite ? "取消收藏" : "收藏"}
        >
          <Heart className={cn("h-4 w-4", item.favorite && "fill-current")} />
        </button>

        <div className="absolute left-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-background"
                aria-label="更多操作"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
              >
                编辑信息
              </DropdownMenuItem>
              <DropdownMenuItem>记录穿着</DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
              >
                删除衣物
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {item.season.length <= 2 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {item.season.map((s) => (
              <span
                key={s}
                className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-foreground">{item.name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{item.brand}</p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {item.color}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            {`穿了 ${item.wearCount} 次`}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(item.lastWorn)}
          </span>
        </div>
      </div>
    </article>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "今天"
  if (diffDays === 1) return "昨天"
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
