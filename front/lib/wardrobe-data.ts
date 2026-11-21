export type Category =
  | "all"
  | "tops"
  | "bottoms"
  | "outerwear"
  | "dresses"
  | "shoes"
  | "bags"
  | "accessories"

export type Occasion = "casual" | "work" | "formal" | "sport" | "date" | "party"

export type Weather = "hot" | "warm" | "cool" | "cold"

export interface ClothingItem {
  id: string
  name: string
  category: Category
  color: string
  brand: string
  season: string[]
  image: string
  favorite: boolean
  wearCount: number
  lastWorn: string
  addedDate: string
}

export interface Outfit {
  id: string
  name: string
  items: string[] // ClothingItem IDs
  occasion?: Occasion
  weather?: Weather
  favorite: boolean
  createdAt: string
  wearCount: number
}

export const occasions: { id: Occasion; label: string }[] = [
  { id: "casual", label: "日常休闲" },
  { id: "work", label: "工作通勤" },
  { id: "formal", label: "正式场合" },
  { id: "sport", label: "运动健身" },
  { id: "date", label: "约会聚会" },
  { id: "party", label: "派对活动" },
]

export const weathers: { id: Weather; label: string; tempRange: string }[] = [
  { id: "hot", label: "炎热", tempRange: "30°C+" },
  { id: "warm", label: "温暖", tempRange: "20-30°C" },
  { id: "cool", label: "凉爽", tempRange: "10-20°C" },
  { id: "cold", label: "寒冷", tempRange: "10°C以下" },
]

export const colorPalette: { name: string; hex: string; group: string }[] = [
  { name: "黑色", hex: "#1a1a1a", group: "neutral" },
  { name: "白色", hex: "#ffffff", group: "neutral" },
  { name: "灰色", hex: "#808080", group: "neutral" },
  { name: "米色", hex: "#f5f5dc", group: "neutral" },
  { name: "棕色", hex: "#8b4513", group: "earth" },
  { name: "卡其色", hex: "#c3b091", group: "earth" },
  { name: "红色", hex: "#dc143c", group: "warm" },
  { name: "粉色", hex: "#ffb6c1", group: "warm" },
  { name: "橙色", hex: "#ff8c00", group: "warm" },
  { name: "黄色", hex: "#ffd700", group: "warm" },
  { name: "蓝色", hex: "#4169e1", group: "cool" },
  { name: "藏青色", hex: "#191970", group: "cool" },
  { name: "绿色", hex: "#228b22", group: "cool" },
  { name: "军绿色", hex: "#556b2f", group: "cool" },
]

// 颜色搭配规则
export const colorMatchRules: Record<string, string[]> = {
  "黑色": ["白色", "灰色", "红色", "粉色", "黄色", "米色"],
  "白色": ["黑色", "藏青色", "蓝色", "灰色", "棕色", "红色"],
  "灰色": ["黑色", "白色", "粉色", "蓝色", "红色"],
  "米色": ["黑色", "棕色", "藏青色", "白色", "蓝色"],
  "棕色": ["米色", "白色", "蓝色", "绿色", "卡其色"],
  "卡其色": ["白色", "藏青色", "棕色", "黑色"],
  "红色": ["黑色", "白色", "灰色", "藏青色"],
  "粉色": ["黑色", "白色", "灰色", "藏青色"],
  "橙色": ["白色", "藏青色", "黑色", "米色"],
  "黄色": ["黑色", "藏青色", "白色", "灰色"],
  "蓝色": ["白色", "米色", "灰色", "卡其色"],
  "藏青色": ["白色", "米色", "粉色", "黄色", "卡其色"],
  "绿色": ["白色", "棕色", "米色", "黑色"],
  "军绿色": ["白色", "棕色", "米色", "黑色", "卡其色"],
}

export const categories: { id: Category; label: string; icon: string }[] = [
  { id: "all", label: "全部", icon: "grid" },
  { id: "tops", label: "上衣", icon: "shirt" },
  { id: "bottoms", label: "裤装", icon: "ruler" },
  { id: "outerwear", label: "外套", icon: "cloud" },
  { id: "dresses", label: "裙装", icon: "sparkles" },
  { id: "shoes", label: "鞋履", icon: "footprints" },
  { id: "bags", label: "包袋", icon: "shopping-bag" },
  { id: "accessories", label: "配饰", icon: "gem" },
]

export const clothingItems: ClothingItem[] = []
