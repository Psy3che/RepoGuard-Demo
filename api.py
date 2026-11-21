import io
import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from wardrobe_app import (
    CUTOUT_DIR,
    DATA_DIR,
    ORIGINAL_DIR,
    add_item_to_metadata,
    auto_name,
    color_to_name,
    dominant_color,
    ensure_dirs,
    extract_clothing,
    load_metadata,
    save_metadata,
)


app = FastAPI(title="Wardrobe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensure_dirs()
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")


@app.get("/api/items")
def list_items(category: Optional[str] = None) -> List[dict]:
    items = load_metadata()
    if category:
        items = [it for it in items if it.get("category") == category]
    result = []
    for item in items:
        cutout_file = item.get("cutout_file", "")
        cutout_path = os.path.join(CUTOUT_DIR, cutout_file)
        try:
            mtime = int(os.path.getmtime(cutout_path))
        except OSError:
            mtime = 0
        result.append({
            **item,
            "image_url": f"/static/cutout/{cutout_file}?v={mtime}",
        })
    return result


@app.post("/api/items")
async def upload_item(
    file: UploadFile = File(...),
    category: str = Form(...),
    name: Optional[str] = Form(None),
    color_label: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
) -> dict:
    ensure_dirs()

    content = await file.read()
    img = Image.open(io.BytesIO(content)).convert("RGBA")

    cutout_img = extract_clothing(img, category)

    rgb = dominant_color(img)
    color_name = color_to_name(rgb)
    display_name = auto_name(color_name, category)
    stem = uuid.uuid4().hex[:8]

    from wardrobe_app import save_image_files

    original_file, cutout_file = save_image_files(img, cutout_img, stem)

    extra = {
        "brand": brand or "未设置",
        "season": [season] if season else ["全年"],
        "wear_count": 0,
        "last_worn": datetime.now().isoformat(timespec="seconds"),
    }
    if name:
        display_name = name

    item = add_item_to_metadata(
        display_name,
        category,
        color_name,
        rgb,
        original_file,
        cutout_file,
        extra=extra,
    )

    item_with_urls = {
        **item,
        "image_url": f"/static/cutout/{cutout_file}",
        "original_url": f"/static/original/{original_file}",
    }
    return item_with_urls


@app.delete("/api/items/{item_id}")
def delete_item(item_id: str) -> dict:
    items = load_metadata()
    target = next((it for it in items if it["id"] == item_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Item not found")

    for file_field, dir_path in [("cutout_file", CUTOUT_DIR), ("original_file", ORIGINAL_DIR)]:
        fname = target.get(file_field, "")
        if fname:
            try:
                os.remove(os.path.join(dir_path, fname))
            except FileNotFoundError:
                pass

    save_metadata([it for it in items if it["id"] != item_id])
    return {"deleted": item_id}


@app.put("/api/items/{item_id}")
def update_item(
    item_id: str,
    name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    color_label: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
) -> dict:
    items = load_metadata()
    target = next((it for it in items if it["id"] == item_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Item not found")

    if name:
        target["name"] = name
    if category:
        target["category"] = category
    if color_label:
        target["color_name"] = color_label
    if brand:
        target["brand"] = brand
    if season:
        target["season"] = [season]

    save_metadata(items)

    cutout_file = target.get("cutout_file", "")
    cutout_path = os.path.join(CUTOUT_DIR, cutout_file)
    try:
        mtime = int(os.path.getmtime(cutout_path))
    except OSError:
        mtime = 0

    return {
        **target,
        "image_url": f"/static/cutout/{cutout_file}?v={mtime}",
    }


@app.get("/api/outfits/suggest")
def get_suggested_outfit() -> List[dict]:
    from wardrobe_app import suggest_outfit

    outfit = suggest_outfit()
    return outfit


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

