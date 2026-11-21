"use client"

import { useState, useEffect, FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categories, type Category, type ClothingItem } from "@/lib/wardrobe-data"

interface EditClothingDialogProps {
  item: ClothingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemUpdated: (item: ClothingItem) => void
}

export function EditClothingDialog({
  item,
  open,
  onOpenChange,
  onItemUpdated,
}: EditClothingDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const [color, setColor] = useState("")
  const [brand, setBrand] = useState("")
  const [season, setSeason] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item && open) {
      setName(item.name)
      setCategory(item.category)
      setColor(item.color)
      setBrand(item.brand)
      setSeason(item.season[0] || "")
      setError(null)
    }
  }, [item, open])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!item || !category || category === "all") {
      setError("请选择衣物分类")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const updated: ClothingItem = {
        ...item,
        name: name || item.name,
        category,
        color: color || item.color,
        brand: brand || item.brand,
        season: season ? [season] : item.season,
      }

      onItemUpdated(updated)
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update item", err)
      setError("更新失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">编辑衣物信息</DialogTitle>
          <DialogDescription>修改衣物的基本信息</DialogDescription>
        </DialogHeader>

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="edit-name">衣物名称</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：羊绒圆领毛衣"
              className="bg-secondary border-transparent focus:border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={category && category !== "all" ? category : undefined}
                onValueChange={(v) => {
                  setCategory(v as Category)
                  setError(null)
                }}
              >
                <SelectTrigger className="bg-secondary border-transparent">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-color">颜色</Label>
              <Input
                id="edit-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="例如：米色"
                className="bg-secondary border-transparent focus:border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">品牌</Label>
              <Input
                id="edit-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="例如：UNIQLO"
                className="bg-secondary border-transparent focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>季节</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger className="bg-secondary border-transparent">
                  <SelectValue placeholder="适合季节" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="春">春</SelectItem>
                  <SelectItem value="夏">夏</SelectItem>
                  <SelectItem value="秋">秋</SelectItem>
                  <SelectItem value="冬">冬</SelectItem>
                  <SelectItem value="全年">全年</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
