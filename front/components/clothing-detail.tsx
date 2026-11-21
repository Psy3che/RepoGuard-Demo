"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Heart, Edit, Trash2, Calendar, RefreshCw, Tag, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClothingItem } from "@/lib/wardrobe-data"
import Image from "next/image"

interface ClothingDetailProps {
  item: ClothingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (item: ClothingItem) => void
}

export function ClothingDetail({
  item,
  open,
  onOpenChange,
  onToggleFavorite,
  onDelete,
  onEdit,
}: ClothingDetailProps) {
  if (!item) return null

  const addedDate = new Date(item.addedDate)
  const lastWornDate = new Date(item.lastWorn)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden p-0 bg-card">
        <div className="relative aspect-square w-full overflow-hidden bg-secondary">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
          />
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={cn(
              "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
              item.favorite
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-background"
            )}
            aria-label={item.favorite ? "取消收藏" : "收藏"}
          >
            <Heart className={cn("h-5 w-5", item.favorite && "fill-current")} />
          </button>
        </div>

        <div className="p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-semibold text-foreground font-serif">
              {item.name}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{item.brand}</p>
          </DialogHeader>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.season.map((s) => (
              <Badge key={s} variant="secondary" className="rounded-full">
                {s}
              </Badge>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">颜色</span>
              <span className="ml-auto font-medium text-foreground">{item.color}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">品牌</span>
              <span className="ml-auto font-medium text-foreground">{item.brand}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">穿着</span>
              <span className="ml-auto font-medium text-foreground">{`${item.wearCount} 次`}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">上次穿着</span>
              <span className="ml-auto font-medium text-foreground">
                {`${lastWornDate.getMonth() + 1}/${lastWornDate.getDate()}`}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {`添加于 ${addedDate.getFullYear()}年${addedDate.getMonth() + 1}月${addedDate.getDate()}日`}
          </p>

          <div className="mt-6 flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
