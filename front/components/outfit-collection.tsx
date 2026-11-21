"use client"

import { useState, useMemo } from "react"
import {
  Heart, Trash2, Calendar, MoreHorizontal, Layers,
  Sun, Cloud, Snowflake, Thermometer,
  Briefcase, Users, Sparkles, Dumbbell, PartyPopper,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { ClothingItem, Outfit, Weather, Occasion } from "@/lib/wardrobe-data"
import { occasions, weathers } from "@/lib/wardrobe-data"

interface OutfitCollectionProps {
  outfits: Outfit[]
  items: ClothingItem[]
  onToggleFavorite: (outfitId: string) => void
  onDeleteOutfit: (outfitId: string) => void
  onWearOutfit?: (outfitId: string) => void
}

const weatherIcons: Record<Weather, React.ComponentType<{ className?: string }>> = {
  hot: Sun, warm: Thermometer, cool: Cloud, cold: Snowflake,
}

const occasionIcons: Record<Occasion, React.ComponentType<{ className?: string }>> = {
  casual: Users, work: Briefcase, formal: Sparkles,
  sport: Dumbbell, date: Heart, party: PartyPopper,
}

type FilterType = "all" | "favorites" | Occasion

export function OutfitCollection({
  outfits, items, onToggleFavorite, onDeleteOutfit, onWearOutfit,
}: OutfitCollectionProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  const getOutfitItems = (outfit: Outfit): ClothingItem[] =>
    outfit.items.map(id => items.find(i => i.id === id)).filter((i): i is ClothingItem => !!i)

  const filteredOutfits = useMemo(() => {
    if (filter === "favorites") return outfits.filter(o => o.favorite)
    if (filter === "all") return outfits
    return outfits.filter(o => o.occasion === filter)
  }, [outfits, filter])

  const occasionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    outfits.forEach(o => {
      if (o.occasion) counts[o.occasion] = (counts[o.occasion] || 0) + 1
    })
    return counts
  }, [outfits])

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">暂无保存的搭配</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          在"穿搭推荐"或"自由搭配"页面创建并保存您喜欢的搭配组合
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          全部
          <Badge variant="secondary" className="ml-1.5">{outfits.length}</Badge>
        </Button>
        <Button
          variant={filter === "favorites" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("favorites")}
          className="gap-1.5"
        >
          <Heart className="h-3.5 w-3.5" />
          收藏
          <Badge variant="secondary" className="ml-0.5">{outfits.filter(o => o.favorite).length}</Badge>
        </Button>
        {occasions.filter(o => occasionCounts[o.id]).map(occ => {
          const Icon = occasionIcons[occ.id]
          return (
            <Button
              key={occ.id}
              variant={filter === occ.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(occ.id)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {occ.label}
              <Badge variant="secondary" className="ml-0.5">{occasionCounts[occ.id]}</Badge>
            </Button>
          )
        })}
      </div>

      {filteredOutfits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">没有找到相关搭配</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOutfits.map(outfit => {
            const outfitItems = getOutfitItems(outfit)
            const occasionInfo = outfit.occasion ? occasions.find(o => o.id === outfit.occasion) : null
            const weatherInfo  = outfit.weather  ? weathers.find(w => w.id === outfit.weather)   : null
            const WeatherIcon  = outfit.weather  ? weatherIcons[outfit.weather]  : null
            const OccasionIcon = outfit.occasion ? occasionIcons[outfit.occasion] : null

            return (
              <div
                key={outfit.id}
                className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
              >
                {/* 预览图片网格 */}
                <div className="relative aspect-[4/3] bg-secondary p-2.5">
                  <div className={cn(
                    "grid h-full gap-1.5",
                    outfitItems.length === 1 && "grid-cols-1",
                    outfitItems.length === 2 && "grid-cols-2",
                    outfitItems.length === 3 && "grid-cols-2 grid-rows-2",
                    outfitItems.length >= 4 && "grid-cols-2 grid-rows-2",
                  )}>
                    {outfitItems.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        className={cn(
                          "overflow-hidden rounded-lg bg-background",
                          outfitItems.length === 3 && idx === 0 && "row-span-2",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>

                  {outfitItems.length > 4 && (
                    <div className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/70 text-background text-xs font-medium">
                      +{outfitItems.length - 4}
                    </div>
                  )}

                  {/* 收藏按钮 */}
                  <button
                    onClick={() => onToggleFavorite(outfit.id)}
                    className={cn(
                      "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full transition-all",
                      outfit.favorite
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-background/80 text-muted-foreground backdrop-blur-sm hover:bg-background"
                    )}
                  >
                    <Heart className={cn("h-4 w-4", outfit.favorite && "fill-current")} />
                  </button>

                  {/* 更多操作 */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {onWearOutfit && (
                        <DropdownMenuItem onClick={() => onWearOutfit(outfit.id)}>
                          记录穿着
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteConfirmId(outfit.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除搭配
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 搭配信息 */}
                <div className="p-4">
                  <h3 className="font-medium text-foreground truncate">{outfit.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {occasionInfo && OccasionIcon && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <OccasionIcon className="h-3 w-3" />
                        {occasionInfo.label}
                      </Badge>
                    )}
                    {weatherInfo && WeatherIcon && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <WeatherIcon className="h-3 w-3" />
                        {weatherInfo.label}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {outfitItems.length} 件单品
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(outfit.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除这套搭配吗？</AlertDialogTitle>
            <AlertDialogDescription>删除后无法恢复，但不会影响衣橱中的衣物。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteConfirmId) { onDeleteOutfit(deleteConfirmId); setDeleteConfirmId(null) } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
