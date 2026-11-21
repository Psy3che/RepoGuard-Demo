"use client"

import { useState, useMemo } from "react"
import { X, Plus, Save, Trash2, ChevronDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ClothingItem, Outfit, Occasion, Weather, Category } from "@/lib/wardrobe-data"
import { categories, occasions, weathers } from "@/lib/wardrobe-data"

interface OutfitBuilderProps {
  items: ClothingItem[]
  onSaveOutfit: (outfit: Outfit) => void
}

const categoryOrder: Category[] = ["outerwear", "tops", "bottoms", "dresses", "shoes", "bags", "accessories"]

export function OutfitBuilder({ items, onSaveOutfit }: OutfitBuilderProps) {
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([])
  const [outfitName, setOutfitName] = useState("")
  const [occasion, setOccasion] = useState<Occasion | "">("")
  const [weather, setWeather] = useState<Weather | "">("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(
    new Set(["tops", "bottoms"])
  )

  const itemsByCategory = useMemo(() => {
    const grouped: Record<Category, ClothingItem[]> = {
      all: [], tops: [], bottoms: [], outerwear: [],
      dresses: [], shoes: [], bags: [], accessories: [],
    }
    items.forEach(item => {
      if (item.category in grouped) grouped[item.category].push(item)
    })
    return grouped
  }, [items])

  const toggleCategory = (cat: Category) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const toggleItem = (item: ClothingItem) => {
    setSelectedItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(i => i.id !== id))
  const clearAll = () => setSelectedItems([])

  const handleSave = () => {
    if (selectedItems.length === 0) return
    onSaveOutfit({
      id: `outfit-${Date.now()}`,
      name: outfitName.trim() || `搭配 ${new Date().toLocaleDateString("zh-CN")}`,
      items: sortedSelected.map(i => i.id),
      occasion: occasion || undefined,
      weather: weather || undefined,
      favorite: false,
      createdAt: new Date().toISOString(),
      wearCount: 0,
    })
    setSelectedItems([])
    setOutfitName("")
    setOccasion("")
    setWeather("")
    setSaveDialogOpen(false)
  }

  const sortedSelected = useMemo(() =>
    [...selectedItems].sort((a, b) =>
      categoryOrder.indexOf(a.category as Category) - categoryOrder.indexOf(b.category as Category)
    ), [selectedItems])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">先去衣橱添加一些衣物吧</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左侧：衣物选择区 */}
      <div className="flex-1 min-w-0 space-y-3">
        <h3 className="text-sm font-medium text-foreground">选择衣物</h3>
        <ScrollArea className="h-[560px] pr-2">
          <div className="space-y-2 pr-2">
            {categoryOrder.map(catId => {
              const catItems = itemsByCategory[catId]
              if (catItems.length === 0) return null
              const catInfo = categories.find(c => c.id === catId)
              const isOpen = expandedCategories.has(catId)
              const selectedCount = catItems.filter(i => selectedItems.some(s => s.id === i.id)).length

              return (
                <Collapsible key={catId} open={isOpen} onOpenChange={() => toggleCategory(catId)}>
                  <CollapsibleTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-4 py-2.5 text-left hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{catInfo?.label}</span>
                        <Badge variant="secondary" className="text-xs">{catItems.length}</Badge>
                        {selectedCount > 0 && (
                          <Badge className="text-xs bg-primary text-primary-foreground">{selectedCount} 已选</Badge>
                        )}
                      </div>
                      <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-4 md:grid-cols-5">
                      {catItems.map(item => {
                        const isSelected = selectedItems.some(i => i.id === item.id)
                        const selIndex = selectedItems.findIndex(i => i.id === item.id)
                        return (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item)}
                            className={cn(
                              "relative overflow-hidden rounded-lg border-2 transition-all text-left",
                              isSelected
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-border"
                            )}
                          >
                            <div className="aspect-[4/3] overflow-hidden bg-secondary">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                {selIndex + 1}
                              </div>
                            )}
                            <div className="px-1.5 py-1">
                              <p className="text-xs text-foreground truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.color}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧：搭配预览区 */}
      <div className="lg:w-72 xl:w-80 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            搭配预览
            {selectedItems.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({selectedItems.length} 件)</span>
            )}
          </h3>
          {selectedItems.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              清空
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 min-h-[420px] flex flex-col">
          {selectedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-12">
              <Plus className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">点击左侧衣物添加到搭配</p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 gap-3">
              {/* 预览图片网格 */}
              <div className={cn(
                "grid gap-2 rounded-lg overflow-hidden bg-secondary/40 p-2",
                sortedSelected.length === 1 && "grid-cols-1",
                sortedSelected.length === 2 && "grid-cols-2",
                sortedSelected.length >= 3 && "grid-cols-2",
              )}>
                {sortedSelected.slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    className={cn(
                      "relative overflow-hidden rounded-md bg-background",
                      sortedSelected.length === 3 && idx === 0 && "row-span-2",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain aspect-[4/3]" />
                  </div>
                ))}
                {sortedSelected.length > 4 && (
                  <div className="flex items-center justify-center rounded-md bg-secondary text-sm font-medium text-muted-foreground aspect-[4/3]">
                    +{sortedSelected.length - 4}
                  </div>
                )}
              </div>

              {/* 已选列表 */}
              <div className="space-y-1.5 flex-1">
                {sortedSelected.map(item => (
                  <div key={item.id} className="group flex items-center gap-2 rounded-lg bg-secondary/40 px-2 py-1.5">
                    <div className="w-8 h-8 rounded overflow-hidden bg-secondary shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.color}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-opacity shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 保存按钮 */}
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-auto">
                    <Save className="h-4 w-4 mr-2" />
                    保存搭配
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle>保存搭配</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="outfit-name">搭配名称</Label>
                      <Input
                        id="outfit-name"
                        placeholder={`搭配 ${new Date().toLocaleDateString("zh-CN")}`}
                        value={outfitName}
                        onChange={e => setOutfitName(e.target.value)}
                        className="bg-secondary border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>适合场合</Label>
                        <Select value={occasion} onValueChange={v => setOccasion(v as Occasion)}>
                          <SelectTrigger className="bg-secondary border-transparent">
                            <SelectValue placeholder="选择场合" />
                          </SelectTrigger>
                          <SelectContent>
                            {occasions.map(o => (
                              <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>适合天气</Label>
                        <Select value={weather} onValueChange={v => setWeather(v as Weather)}>
                          <SelectTrigger className="bg-secondary border-transparent">
                            <SelectValue placeholder="选择天气" />
                          </SelectTrigger>
                          <SelectContent>
                            {weathers.map(w => (
                              <SelectItem key={w.id} value={w.id}>{w.label} ({w.tempRange})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* 预览缩略图 */}
                    <div className="flex gap-1.5 flex-wrap">
                      {sortedSelected.slice(0, 6).map(item => (
                        <div key={item.id} className="w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      {sortedSelected.length > 6 && (
                        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                          +{sortedSelected.length - 6}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSave} className="w-full">确认保存</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
