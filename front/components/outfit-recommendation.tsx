"use client"

import { useState, useMemo } from "react"
import {
  Sparkles, Sun, Cloud, Snowflake, Thermometer,
  RefreshCw, Heart, Briefcase, PartyPopper, Dumbbell, Users, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ClothingItem, Occasion, Weather, Outfit } from "@/lib/wardrobe-data"
import { occasions, weathers, colorMatchRules, categories } from "@/lib/wardrobe-data"

interface OutfitRecommendationProps {
  items: ClothingItem[]
  onSaveOutfit?: (outfit: Outfit) => void
}

const occasionIcons: Record<Occasion, React.ComponentType<{ className?: string }>> = {
  casual: Users,
  work: Briefcase,
  formal: Sparkles,
  sport: Dumbbell,
  date: Heart,
  party: PartyPopper,
}

const weatherIcons: Record<Weather, React.ComponentType<{ className?: string }>> = {
  hot: Sun,
  warm: Thermometer,
  cool: Cloud,
  cold: Snowflake,
}

// 天气 → 适合的季节标签（匹配后端实际数据）
const weatherSeasonMap: Record<Weather, string[]> = {
  hot:  ["夏", "全年"],
  warm: ["春", "秋", "夏", "全年"],
  cool: ["秋", "春", "全年"],
  cold: ["冬", "秋", "全年"],
}

// 场合 → 推荐分类优先级
const occasionCategoryPriority: Record<Occasion, string[]> = {
  casual: ["tops", "bottoms", "shoes", "outerwear", "accessories"],
  work:   ["tops", "bottoms", "outerwear", "shoes", "bags"],
  formal: ["dresses", "tops", "bottoms", "shoes", "bags", "accessories"],
  sport:  ["tops", "bottoms", "shoes"],
  date:   ["dresses", "tops", "bottoms", "shoes", "bags", "accessories"],
  party:  ["dresses", "tops", "bottoms", "shoes", "accessories"],
}

function randomPick<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickByColor<T extends ClothingItem>(arr: T[], baseColor: string): T | null {
  if (arr.length === 0) return null
  const matching = colorMatchRules[baseColor] || []
  const matched = arr.filter(i => matching.includes(i.color))
  return matched.length > 0 ? randomPick(matched) : randomPick(arr)
}

export function OutfitRecommendation({ items, onSaveOutfit }: OutfitRecommendationProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>("casual")
  const [selectedWeather, setSelectedWeather] = useState<Weather>("warm")
  const [refreshKey, setRefreshKey] = useState(0)
  const [saved, setSaved] = useState(false)

  const { outfit: recommendedOutfit, colorTips } = useMemo(() => {
    if (items.length === 0) return { outfit: null, colorTips: [] }

    const suitableSeasons = weatherSeasonMap[selectedWeather]

    // 筛选季节合适的衣物
    const seasonal = items.filter(item =>
      item.season.some(s => suitableSeasons.includes(s))
    )
    const pool = seasonal.length > 0 ? seasonal : items

    const byCategory = (cat: string) => pool.filter(i => i.category === cat)

    const tops        = byCategory("tops")
    const bottoms     = byCategory("bottoms")
    const outerwear   = byCategory("outerwear")
    const dresses     = byCategory("dresses")
    const shoes       = byCategory("shoes")
    const bags        = byCategory("bags")
    const accessories = byCategory("accessories")

    const outfit: ClothingItem[] = []
    const tips: string[] = []

    // 1. 主体单品
    const preferDress = selectedOccasion === "formal" || selectedOccasion === "date" || selectedOccasion === "party"
    let baseColor = "黑色"

    if (preferDress && dresses.length > 0) {
      const dress = randomPick(dresses)!
      outfit.push(dress)
      baseColor = dress.color
    } else {
      const top = randomPick(tops)
      if (top) {
        outfit.push(top)
        baseColor = top.color
        const bottom = pickByColor(bottoms, baseColor)
        if (bottom) {
          outfit.push(bottom)
          if ((colorMatchRules[baseColor] || []).includes(bottom.color)) {
            tips.push(`${top.color} × ${bottom.color} 是经典配色`)
          }
        }
      }
    }

    // 2. 外套（凉爽/寒冷天气，运动场合除外）
    if ((selectedWeather === "cool" || selectedWeather === "cold") && selectedOccasion !== "sport") {
      const outer = pickByColor(outerwear, baseColor)
      if (outer) outfit.push(outer)
    }

    // 3. 鞋子
    const shoe = pickByColor(shoes, baseColor)
    if (shoe) outfit.push(shoe)

    // 4. 包袋（正式/约会/派对场合）
    if (["formal", "date", "party", "work"].includes(selectedOccasion)) {
      const bag = pickByColor(bags, baseColor)
      if (bag) outfit.push(bag)
    }

    // 5. 配饰（运动场合不加）
    if (selectedOccasion !== "sport") {
      const acc = randomPick(accessories)
      if (acc) outfit.push(acc)
    }

    return { outfit, colorTips: tips }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedOccasion, selectedWeather, refreshKey])

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
    setSaved(false)
  }

  const handleSave = () => {
    if (!recommendedOutfit?.length || !onSaveOutfit) return
    const occasionLabel = occasions.find(o => o.id === selectedOccasion)?.label || ""
    const weatherLabel  = weathers.find(w => w.id === selectedWeather)?.label || ""
    onSaveOutfit({
      id: `outfit-${Date.now()}`,
      name: `${occasionLabel}·${weatherLabel}搭配`,
      items: recommendedOutfit.map(i => i.id),
      occasion: selectedOccasion,
      weather: selectedWeather,
      favorite: false,
      createdAt: new Date().toISOString(),
      wearCount: 0,
    })
    setSaved(true)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">添加一些衣物后，我们将为您推荐搭配</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 场合选择 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">选择场合</h3>
        <div className="flex flex-wrap gap-2">
          {occasions.map((occ) => {
            const Icon = occasionIcons[occ.id]
            return (
              <Button
                key={occ.id}
                variant={selectedOccasion === occ.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedOccasion(occ.id); setSaved(false) }}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {occ.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* 天气选择 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">选择天气</h3>
        <div className="flex flex-wrap gap-2">
          {weathers.map((w) => {
            const Icon = weatherIcons[w.id]
            return (
              <Button
                key={w.id}
                variant={selectedWeather === w.id ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedWeather(w.id); setSaved(false) }}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {w.label}
                <span className="text-xs opacity-60">({w.tempRange})</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* 推荐结果 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">推荐搭配</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              换一套
            </Button>
            {onSaveOutfit && recommendedOutfit && recommendedOutfit.length > 0 && (
              <Button size="sm" onClick={handleSave} disabled={saved} className="gap-1.5">
                <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                {saved ? "已保存" : "保存搭配"}
              </Button>
            )}
          </div>
        </div>

        {/* 颜色搭配提示 */}
        {colorTips.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {colorTips[0]}
          </div>
        )}

        {recommendedOutfit && recommendedOutfit.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommendedOutfit.map((item) => {
              const catLabel = categories.find(c => c.id === item.category)?.label || ""
              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl bg-card border border-border"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{catLabel}</Badge>
                      <span className="text-xs text-muted-foreground">{item.color}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-secondary/50 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              暂无合适的搭配，试试调整场合或天气条件
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
