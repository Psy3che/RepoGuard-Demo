"use client"

import { useState, useRef, FormEvent } from "react"
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
import { Camera, Upload, X } from "lucide-react"
import { categories, type Category, type ClothingItem } from "@/lib/wardrobe-data"
import { uploadItem } from "@/lib/api"

interface AddClothingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemAdded: (item: ClothingItem) => void
}

export function AddClothingDialog({
  open,
  onOpenChange,
  onItemAdded,
}: AddClothingDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<Category | null>(null)
  const [color, setColor] = useState("")
  const [brand, setBrand] = useState("")
  const [season, setSeason] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 两个独立 input：拍照（调用摄像头）vs 从相册/文件选择
  const cameraRef = useRef<HTMLInputElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setError(null)
  }

  function clearImage() {
    setPreview(null)
    if (cameraRef.current) cameraRef.current.value = ""
    if (fileRef.current) fileRef.current.value = ""
  }

  function getSelectedFile(): File | null {
    return cameraRef.current?.files?.[0] ?? fileRef.current?.files?.[0] ?? null
  }

  function resetForm() {
    setName("")
    setCategory(null)
    setColor("")
    setBrand("")
    setSeason(null)
    setError(null)
    clearImage()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const file = getSelectedFile()
    if (!file) { setError("请先拍照或上传衣物图片"); return }
    if (!category || category === "all") { setError("请选择衣物分类"); return }

    try {
      setLoading(true)
      setError(null)
      const created = await uploadItem({ file, category, name, colorLabel: color, brand, season })
      onItemAdded(created)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to upload item", err)
      setError("上传失败，请检查网络后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">添加新衣物</DialogTitle>
          <DialogDescription>为你的衣橱添加一件新的衣物</DialogDescription>
        </DialogHeader>

        <form className="mt-2 space-y-4" onSubmit={handleSubmit}>

          {/* ── 图片区域 ── */}
          {preview ? (
            <div className="relative flex items-center justify-center">
              <img
                src={preview}
                alt="预览"
                className="h-48 w-full rounded-xl object-contain border border-border bg-secondary/50"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* 点击整个区域 → 文件选择 */
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/50 transition-colors hover:border-accent hover:bg-secondary"
            >
              <div className="flex gap-3">
                {/* 相机：调用摄像头（移动端） */}
                <div
                  role="button"
                  onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Camera className="h-5 w-5" />
                </div>
                {/* 上传：从相册/文件选择 */}
                <div
                  role="button"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">点击拍照，或上传衣物图片</p>
            </button>
          )}

          {/* 拍照 input（移动端调用摄像头，桌面端打开文件选择） */}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={handleFileChange} />
          {/* 文件选择 input */}
          <input ref={fileRef} type="file" accept="image/*"
            className="hidden" onChange={handleFileChange} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* ── 衣物名称 ── */}
          <div className="space-y-2">
            <Label htmlFor="name">衣物名称</Label>
            <Input
              id="name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="例如：羊绒圆领毛衣"
              className="bg-secondary border-transparent focus:border-border"
            />
          </div>

          {/* ── 分类 + 颜色 ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={category && category !== "all" ? category : undefined}
                onValueChange={(v) => { setCategory(v as Category); setError(null) }}
              >
                <SelectTrigger className="bg-secondary border-transparent">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">颜色</Label>
              <Input
                id="color" value={color} onChange={(e) => setColor(e.target.value)}
                placeholder="例如：米色"
                className="bg-secondary border-transparent focus:border-border"
              />
            </div>
          </div>

          {/* ── 品牌 + 季节 ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="brand">品牌</Label>
              <Input
                id="brand" value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="例如：UNIQLO"
                className="bg-secondary border-transparent focus:border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>季节</Label>
              <Select value={season ?? undefined} onValueChange={setSeason}>
                <SelectTrigger className="bg-secondary border-transparent">
                  <SelectValue placeholder="适合季节" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">春</SelectItem>
                  <SelectItem value="summer">夏</SelectItem>
                  <SelectItem value="autumn">秋</SelectItem>
                  <SelectItem value="winter">冬</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── 操作按钮 ── */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1"
              onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? "上传中..." : "添加衣物"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
