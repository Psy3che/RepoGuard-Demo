import type { ClothingItem, Category } from "./wardrobe-data"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8000"

type BackendItem = {
  id: string
  name: string
  category: string
  color_name: string
  color_rgb: [number, number, number]
  original_file: string
  cutout_file: string
  created_at: string
  image_url?: string
  brand?: string
  season?: string[]
  wear_count?: number
  last_worn?: string
}

function mapCategory(cat: string): Category {
  switch (cat) {
    case "top":
      return "tops"
    case "bottom":
      return "bottoms"
    case "outer":
      return "outerwear"
    case "dress":
      return "dresses"
    case "shoes":
      return "shoes"
    default:
      return "accessories"
  }
}

function mapItem(item: BackendItem): ClothingItem {
  const created = item.created_at || new Date().toISOString()
  const lastWorn = item.last_worn || created
  const image = item.image_url
    ? item.image_url.startsWith("/")
      ? `${API_BASE}${item.image_url}`
      : item.image_url
    : `${API_BASE}/static/cutout/${encodeURIComponent(item.cutout_file)}`

  return {
    id: item.id,
    name: item.name,
    category: mapCategory(item.category),
    color: item.color_name,
    brand: item.brand || "未设置",
    season: item.season && item.season.length ? item.season : ["全年"],
    image,
    favorite: false,
    wearCount: item.wear_count ?? 0,
    lastWorn: lastWorn,
    addedDate: created,
  }
}

export async function fetchItems(category?: Category): Promise<ClothingItem[]> {
  const params =
    category && category !== "all"
      ? `?category=${encodeURIComponent(
          category === "tops"
            ? "top"
            : category === "bottoms"
              ? "bottom"
              : category === "outerwear"
                ? "outer"
                : category === "dresses"
                  ? "dress"
                  : category === "shoes"
                    ? "shoes"
                    : ""
        )}`
      : ""

  const res = await fetch(`${API_BASE}/api/items${params}`)
  if (!res.ok) throw new Error("Failed to fetch items")
  const data: BackendItem[] = await res.json()
  return data.map(mapItem)
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete item")
}

export async function updateItem(
  id: string,
  updates: {
    name?: string
    category?: Category
    colorLabel?: string
    brand?: string
    season?: string
  }
): Promise<ClothingItem> {
  const form = new FormData()
  if (updates.name) form.append("name", updates.name)
  if (updates.category) {
    const backendCategory =
      updates.category === "tops"
        ? "top"
        : updates.category === "bottoms"
          ? "bottom"
          : updates.category === "outerwear"
            ? "outer"
            : updates.category === "dresses"
              ? "dress"
              : updates.category === "shoes"
                ? "shoes"
                : "other"
    form.append("category", backendCategory)
  }
  if (updates.colorLabel) form.append("color_label", updates.colorLabel)
  if (updates.brand) form.append("brand", updates.brand)
  if (updates.season) form.append("season", updates.season)

  const res = await fetch(`${API_BASE}/api/items/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: form,
  })

  if (!res.ok) throw new Error("Failed to update item")
  const data: BackendItem = await res.json()
  return mapItem(data)
}

export async function uploadItem(opts: {
  file: File
  category: Category
  name?: string
  colorLabel?: string
  brand?: string
  season?: string | null
}): Promise<ClothingItem> {
  const form = new FormData()
  form.append("file", opts.file)

  const backendCategory =
    opts.category === "tops"
      ? "top"
      : opts.category === "bottoms"
        ? "bottom"
        : opts.category === "outerwear"
          ? "outer"
          : opts.category === "dresses"
            ? "dress"
            : opts.category === "shoes"
              ? "shoes"
              : "other"

  form.append("category", backendCategory)
  if (opts.name) form.append("name", opts.name)
  if (opts.colorLabel) form.append("color_label", opts.colorLabel)
  if (opts.brand) form.append("brand", opts.brand)
  if (opts.season) form.append("season", opts.season)

  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) throw new Error("Failed to upload item")
  const data: BackendItem = await res.json()
  return mapItem(data)
}

