"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { WardrobeHeader } from "@/components/wardrobe-header"
import { CategoryBar } from "@/components/category-bar"
import { ClothingCard } from "@/components/clothing-card"
import { WardrobeStats } from "@/components/wardrobe-stats"
import { ClothingDetail } from "@/components/clothing-detail"
import { AddClothingDialog } from "@/components/add-clothing-dialog"
import { EditClothingDialog } from "@/components/edit-clothing-dialog"
import { EmptyState } from "@/components/empty-state"
import { OutfitRecommendation } from "@/components/outfit-recommendation"
import { OutfitBuilder } from "@/components/outfit-builder"
import { OutfitCollection } from "@/components/outfit-collection"
import { WardrobeAnalytics } from "@/components/wardrobe-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { categories, type Category, type ClothingItem, type Outfit } from "@/lib/wardrobe-data"
import { fetchItems, uploadItem, deleteItem, updateItem } from "@/lib/api"
import { Shirt, Sparkles, Layers, PieChart, Palette } from "lucide-react"

export default function WardrobePage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [activeTab, setActiveTab] = useState("wardrobe")
  const [outfits, setOutfits] = useState<Outfit[]>([])

  // 从 localStorage 加载搭配数据
  useEffect(() => {
    const savedOutfits = localStorage.getItem("wardrobe-outfits")
    if (savedOutfits) {
      try {
        setOutfits(JSON.parse(savedOutfits))
      } catch (e) {
        console.error("Failed to load outfits", e)
      }
    }
  }, [])

  // 保存搭配数据到 localStorage
  useEffect(() => {
    localStorage.setItem("wardrobe-outfits", JSON.stringify(outfits))
  }, [outfits])

  const loadItems = useCallback(async () => {
    try {
      setLoadError(false)
      const data = await fetchItems()
      setItems(data)
    } catch (e) {
      console.error("Failed to fetch items", e)
      setLoadError(true)
    }
  }, [])

  // 首次加载时从后端获取衣橱数据
  useEffect(() => {
    loadItems()
  }, [loadItems])

  const filteredItems = useMemo(() => {
    let filtered = items

    if (activeCategory !== "all") {
      filtered = filtered.filter((item) => item.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.color.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [items, activeCategory, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: items.length,
      tops: 0,
      bottoms: 0,
      outerwear: 0,
      dresses: 0,
      shoes: 0,
      bags: 0,
      accessories: 0,
    }

    items.forEach((item) => {
      if (item.category in counts) {
        counts[item.category]++
      }
    })

    return counts
  }, [items])

  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    )
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null))
    }
  }

  const handleViewDetail = (item: ClothingItem) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  const handleItemAdded = useCallback((item: ClothingItem) => {
    setItems((prev) => [item, ...prev])
  }, [])

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!confirm("确定要删除这件衣物吗？删除后无法恢复。")) {
      return
    }
    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      if (selectedItem?.id === id) {
        setDetailOpen(false)
        setSelectedItem(null)
      }
    } catch (e) {
      console.error("Failed to delete item", e)
      alert("删除失败，请重试")
    }
  }, [selectedItem])

  const handleEditItem = useCallback((item: ClothingItem) => {
    setSelectedItem(item)
    setEditOpen(true)
  }, [])

  // 搭配相关处理函数
  const handleSaveOutfit = useCallback((outfit: Outfit) => {
    setOutfits(prev => [outfit, ...prev])
  }, [])

  const handleToggleOutfitFavorite = useCallback((outfitId: string) => {
    setOutfits(prev =>
      prev.map(outfit =>
        outfit.id === outfitId ? { ...outfit, favorite: !outfit.favorite } : outfit
      )
    )
  }, [])

  const handleDeleteOutfit = useCallback((outfitId: string) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId))
  }, [])

  const handleItemUpdated = useCallback(async (updated: ClothingItem) => {
    try {
      const result = await updateItem(updated.id, {
        name: updated.name,
        category: updated.category,
        colorLabel: updated.color,
        brand: updated.brand,
        season: updated.season[0],
      })
      setItems((prev) => prev.map((item) => (item.id === result.id ? result : item)))
      if (selectedItem?.id === result.id) {
        setSelectedItem(result)
      }
    } catch (e) {
      console.error("Failed to update item", e)
      alert("更新失败，请重试")
    }
  }, [selectedItem])

  return (
    <div className="min-h-screen bg-background">
      <WardrobeHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddItem={() => setAddOpen(true)}
        totalItems={items.length}
      />

      {/* 功能导航标签 */}
      <div className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start gap-1 h-12 bg-transparent p-0">
              <TabsTrigger
                value="wardrobe"
                className="gap-2 data-[state=active]:bg-secondary px-4"
              >
                <Shirt className="h-4 w-4" />
                <span className="hidden sm:inline">我的衣橱</span>
              </TabsTrigger>
              <TabsTrigger
                value="recommend"
                className="gap-2 data-[state=active]:bg-secondary px-4"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">穿搭推荐</span>
              </TabsTrigger>
              <TabsTrigger
                value="builder"
                className="gap-2 data-[state=active]:bg-secondary px-4"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">自由搭配</span>
              </TabsTrigger>
              <TabsTrigger
                value="collection"
                className="gap-2 data-[state=active]:bg-secondary px-4"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">搭配收藏</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="gap-2 data-[state=active]:bg-secondary px-4"
              >
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">衣柜分析</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 根据选中的标签显示不同内容 */}
      {activeTab === "wardrobe" && (
        <>
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />

          <WardrobeStats items={items} />

          <main className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
            {loadError ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <p className="text-muted-foreground">无法连接到后端服务，请确认后端已启动</p>
                <code className="rounded bg-secondary px-3 py-1.5 text-sm text-foreground">
                  uvicorn api:app --reload
                </code>
                <button
                  onClick={loadItems}
                  className="mt-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  重试
                </button>
              </div>
            ) : filteredItems.length === 0 ? (
              <EmptyState
                message={
                  searchQuery
                    ? `没有找到 "${searchQuery}" 相关的衣物`
                    : "这个分类暂时还没有衣物"
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4 items-start">
                {filteredItems.map((item) => (
                  <ClothingCard
                    key={item.id}
                    item={item}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetail={handleViewDetail}
                    onDelete={handleDeleteItem}
                    onEdit={handleEditItem}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {activeTab === "recommend" && (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-12 md:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground font-serif">智能穿搭推荐</h2>
            <p className="text-sm text-muted-foreground mt-1">
              根据场合和天气为您推荐合适的穿搭组合
            </p>
          </div>
          <OutfitRecommendation items={items} onSaveOutfit={handleSaveOutfit} />
        </main>
      )}

      {activeTab === "builder" && (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-12 md:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground font-serif">自由搭配</h2>
            <p className="text-sm text-muted-foreground mt-1">
              自由选择衣物创建属于您的穿搭组合
            </p>
          </div>
          <OutfitBuilder items={items} onSaveOutfit={handleSaveOutfit} />
        </main>
      )}

      {activeTab === "collection" && (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-12 md:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground font-serif">搭配收藏</h2>
            <p className="text-sm text-muted-foreground mt-1">
              查看和管理您保存的所有穿搭组合
            </p>
          </div>
          <OutfitCollection
            outfits={outfits}
            items={items}
            onToggleFavorite={handleToggleOutfitFavorite}
            onDeleteOutfit={handleDeleteOutfit}
          />
        </main>
      )}

      {activeTab === "analytics" && (
        <main className="mx-auto max-w-7xl px-4 py-6 pb-12 md:px-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground font-serif">衣柜分析</h2>
            <p className="text-sm text-muted-foreground mt-1">
              深入了解您的衣柜构成和穿着习惯
            </p>
          </div>
          <WardrobeAnalytics items={items} />
        </main>
      )}

      <ClothingDetail
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDeleteItem}
        onEdit={handleEditItem}
      />

      <EditClothingDialog
        item={selectedItem}
        open={editOpen}
        onOpenChange={setEditOpen}
        onItemUpdated={handleItemUpdated}
      />

      <AddClothingDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onItemAdded={handleItemAdded}
      />
    </div>
  )
}
