import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import numpy as np
from PIL import Image
from rembg import remove, new_session
import streamlit as st


DATA_DIR = "wardrobe_data"
ORIGINAL_DIR = os.path.join(DATA_DIR, "original")
CUTOUT_DIR = os.path.join(DATA_DIR, "cutout")
META_PATH = os.path.join(DATA_DIR, "metadata.json")


CATEGORY_OPTIONS = {
    "top": "上衣",
    "bottom": "下装",
    "outer": "外套",
    "shoes": "鞋子",
    "dress": "连衣裙",
    "other": "其他",
}


BASE_COLORS = {
    "黑色": (0, 0, 0),
    "白色": (255, 255, 255),
    "灰色": (128, 128, 128),
    "红色": (220, 20, 60),
    "橙色": (255, 140, 0),
    "黄色": (255, 215, 0),
    "绿色": (34, 139, 34),
    "蓝色": (30, 144, 255),
    "紫色": (138, 43, 226),
    "粉色": (255, 105, 180),
    "棕色": (139, 69, 19),
}


def inject_base_css() -> None:
    """为整个应用注入一些全局样式，让 UI 更现代。"""
    st.markdown(
        """
        <style>
        .stApp {
            background: #f3f4f6;
        }
        .smart-page-title {
            font-size: 1.6rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        .smart-page-subtitle {
            color: #6b7280;
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
        }
        .smart-card {
            background: #ffffff;
            border-radius: 18px;
            padding: 16px 18px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
            margin-bottom: 16px;
        }
        .smart-grid > div > div {
            background: #ffffff;
            border-radius: 16px;
            padding: 10px;
            box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
        }
        .smart-grid img {
            border-radius: 12px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def ensure_dirs() -> None:
    os.makedirs(ORIGINAL_DIR, exist_ok=True)
    os.makedirs(CUTOUT_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(META_PATH):
        with open(META_PATH, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)


def load_metadata() -> List[Dict]:
    ensure_dirs()
    try:
        with open(META_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_metadata(items: List[Dict]) -> None:
    ensure_dirs()
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)


def dominant_color(image: Image.Image) -> Tuple[int, int, int]:
    img = image.convert("RGB").resize((80, 80))
    arr = np.array(img).reshape(-1, 3)
    # 简单取中位数颜色，避免噪声
    med = np.median(arr, axis=0)
    return int(med[0]), int(med[1]), int(med[2])


def color_to_name(rgb: Tuple[int, int, int]) -> str:
    r, g, b = rgb
    best_name = "未知色"
    best_dist = 1e9
    for name, base_rgb in BASE_COLORS.items():
        br, bg, bb = base_rgb
        dist = (r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2
        if dist < best_dist:
            best_dist = dist
            best_name = name
    return best_name


def auto_name(color_name: str, category_key: str) -> str:
    category_cn = CATEGORY_OPTIONS.get(category_key, "单品")
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"{color_name}{category_cn}-{ts}"


def save_image_files(
    img: Image.Image, cutout: Image.Image, filename_stem: str
) -> Tuple[str, str]:
    ensure_dirs()
    original_name = f"{filename_stem}_orig.png"
    cutout_name = f"{filename_stem}_cut.png"
    original_path = os.path.join(ORIGINAL_DIR, original_name)
    cutout_path = os.path.join(CUTOUT_DIR, cutout_name)
    img.save(original_path)
    cutout.save(cutout_path)
    return original_name, cutout_name


def add_item_to_metadata(
    display_name: str,
    category_key: str,
    color_name: str,
    color_rgb: Tuple[int, int, int],
    original_file: str,
    cutout_file: str,
    extra: Optional[Dict] = None,
) -> Dict:
    items = load_metadata()
    item_id = str(uuid.uuid4())
    item: Dict = {
        "id": item_id,
        "name": display_name,
        "category": category_key,
        "color_name": color_name,
        "color_rgb": color_rgb,
        "original_file": original_file,
        "cutout_file": cutout_file,
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }
    if extra:
        item.update(extra)
    items.append(item)
    save_metadata(items)
    return item


def load_items_by_category() -> Dict[str, List[Dict]]:
    items = load_metadata()
    by_cat: Dict[str, List[Dict]] = {key: [] for key in CATEGORY_OPTIONS.keys()}
    for it in items:
        cat = it.get("category", "other")
        by_cat.setdefault(cat, []).append(it)
    return by_cat


def color_compatible(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> bool:
    # 简单规则：亮度和色差不要太极端
    r1, g1, b1 = c1
    r2, g2, b2 = c2
    l1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1
    l2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2
    if abs(l1 - l2) > 160:
        return False
    dist = (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
    return dist < 30000


def suggest_outfit() -> List[Dict]:
    by_cat = load_items_by_category()
    tops = by_cat.get("top", []) + by_cat.get("dress", [])
    bottoms = by_cat.get("bottom", [])
    outers = by_cat.get("outer", [])
    shoes = by_cat.get("shoes", [])

    if not tops:
        return []

    rng = np.random.default_rng()
    top = rng.choice(tops)

    outfit = [top]

    top_color = tuple(top.get("color_rgb", [128, 128, 128]))

    if bottoms:
        compatible_bottoms = [
            b
            for b in bottoms
            if color_compatible(
                top_color, tuple(b.get("color_rgb", [128, 128, 128]))
            )
        ]
        if not compatible_bottoms:
            compatible_bottoms = bottoms
        outfit.append(rng.choice(compatible_bottoms))

    if shoes:
        compatible_shoes = [
            s
            for s in shoes
            if color_compatible(
                top_color, tuple(s.get("color_rgb", [128, 128, 128]))
            )
        ]
        if not compatible_shoes:
            compatible_shoes = shoes
        outfit.append(rng.choice(compatible_shoes))

    if outers:
        outfit.append(rng.choice(outers))

    # 去重（同一件衣服可能同时标为 dress/top）
    unique = {it["id"]: it for it in outfit}
    return list(unique.values())


def image_path(file_name: str, cutout: bool = False) -> str:
    return os.path.join(CUTOUT_DIR if cutout else ORIGINAL_DIR, file_name)


_cloth_session = None
_human_session = None
_general_session = None

# 类别 → u2net_cloth_seg 的 cloth_category 参数
_CATEGORY_TO_CLOTH_TYPE: Dict[str, Optional[str]] = {
    "top":         "upper",
    "outer":       "upper",
    "dress":       "full",
    "bottom":      "lower",
    "shoes":       None,   # cloth_seg 不擅长鞋子，直接用通用模型
    "bags":        None,
    "accessories": None,
    "other":       None,
}


def _keep_largest_component(arr: np.ndarray) -> np.ndarray:
    """只保留 alpha 通道中面积最大的连通区域，去除散落碎片。"""
    from scipy import ndimage

    mask = arr[:, :, 3] > 0
    labeled, num = ndimage.label(mask)
    if num <= 1:
        return arr

    sizes = ndimage.sum(mask, labeled, range(1, num + 1))
    largest_label = int(np.argmax(sizes)) + 1
    keep = labeled == largest_label

    out = arr.copy()
    out[~keep, 3] = 0
    return out


def _fill_holes(arr: np.ndarray) -> np.ndarray:
    """对 alpha 通道做形态学闭运算，填补衣物内部小孔洞。"""
    from scipy import ndimage

    alpha = arr[:, :, 3]
    closed = ndimage.binary_fill_holes(alpha > 128).astype(np.uint8) * 255
    out = arr.copy()
    # 只填充原本就有前景的区域内的孔洞，不扩张边界
    out[:, :, 3] = np.where(closed > 0, np.maximum(alpha, closed), alpha)
    return out


def _detect_person(img_rgb: Image.Image) -> bool:
    """用 u2net_human_seg 判断图片中是否有人体（穿着照 vs 平铺/商品图）。"""
    global _human_session
    try:
        if _human_session is None:
            _human_session = new_session("u2net_human_seg")
        masks = _human_session.predict(img_rgb)
        if not masks:
            return False
        arr = np.array(masks[0])
        ratio = (arr > 128).sum() / arr.size
        return ratio > 0.05
    except Exception:
        return False


def extract_clothing(img: Image.Image, category: str = None) -> Image.Image:
    """三阶段精准抠图流程：

    1. 人体检测：判断是穿着照还是平铺/商品图
    2. 分支处理：
       - 穿着照 + 服装类别 → u2net_cloth_seg（按上/下/全身分类）+ alpha matting
       - 平铺/商品图 / 鞋包配饰 → u2net 通用模型 + alpha matting
    3. 后处理：填孔 → 保留最大连通域 → tight crop → padding
    """
    global _cloth_session, _general_session

    img_rgba = img.convert("RGBA")
    img_rgb  = img.convert("RGB")
    orig_size = img_rgba.size

    cloth_type = _CATEGORY_TO_CLOTH_TYPE.get(category or "", None)
    result: Optional[Image.Image] = None

    try:
        # ── 阶段 1：检测是否有人体 ──────────────────────────────────────
        has_person = _detect_person(img_rgb) if cloth_type is not None else False

        # ── 阶段 2a：穿着照 + 服装类别 → cloth_seg ─────────────────────
        if has_person and cloth_type is not None:
            if _cloth_session is None:
                _cloth_session = new_session("u2net_cloth_seg")

            # 先用 only_mask 拿到原始 mask，评估质量
            raw_mask = remove(
                img_rgb,
                session=_cloth_session,
                only_mask=True,
                post_process_mask=True,
                cc=cloth_type,
            )
            mask_arr = np.array(raw_mask)
            visible_ratio = (mask_arr > 128).sum() / mask_arr.size

            if visible_ratio > 0.03:
                # 用 alpha matting 获得柔和边缘
                try:
                    result = remove(
                        img_rgb,
                        session=_cloth_session,
                        alpha_matting=True,
                        alpha_matting_foreground_threshold=230,
                        alpha_matting_background_threshold=20,
                        alpha_matting_erode_size=8,
                        post_process_mask=True,
                        cc=cloth_type,
                    )
                except Exception:
                    result = remove(
                        img_rgb,
                        session=_cloth_session,
                        post_process_mask=True,
                        cc=cloth_type,
                    )

        # ── 阶段 2b：平铺图 / 鞋包配饰 → 通用模型 ──────────────────────
        if result is None:
            if _general_session is None:
                _general_session = new_session("u2net")

            try:
                result = remove(
                    img_rgb,
                    session=_general_session,
                    alpha_matting=True,
                    alpha_matting_foreground_threshold=240,
                    alpha_matting_background_threshold=10,
                    alpha_matting_erode_size=10,
                    post_process_mask=True,
                )
            except Exception:
                result = remove(img_rgb, session=_general_session, post_process_mask=True)

    except Exception:
        # 最终兜底
        result = remove(img_rgba)

    # 确保尺寸一致
    if result.size != orig_size:
        result = result.resize(orig_size, Image.LANCZOS)

    # ── 阶段 3：后处理 ────────────────────────────────────────────────
    arr = np.array(result.convert("RGBA"))

    # 填补衣物内部孔洞
    arr = _fill_holes(arr)

    # 只保留最大连通域
    arr = _keep_largest_component(arr)

    result = Image.fromarray(arr)

    # tight crop 去掉透明边缘
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)

    # 添加 10% padding，保持视觉呼吸感
    w, h = result.size
    pad_w = int(w * 0.10)
    pad_h = int(h * 0.10)
    canvas = Image.new("RGBA", (w + pad_w * 2, h + pad_h * 2), (0, 0, 0, 0))
    canvas.paste(result, (pad_w, pad_h))

    return canvas


def page_upload():
    st.markdown('<div class="smart-page-title">📤 上传衣物</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="smart-page-subtitle">选择类别并上传图片，系统会自动抠图与识别主色。</div>',
        unsafe_allow_html=True,
    )

    with st.container():
        st.markdown('<div class="smart-card">', unsafe_allow_html=True)
        category_key = st.selectbox(
            "衣物类别",
            options=list(CATEGORY_OPTIONS.keys()),
            format_func=lambda k: CATEGORY_OPTIONS[k],
        )

        uploaded_files = st.file_uploader(
            "选择图片（支持多张）",
            type=["png", "jpg", "jpeg", "webp"],
            accept_multiple_files=True,
        )
        st.markdown("</div>", unsafe_allow_html=True)

    if not uploaded_files:
        return

    if st.button("开始抠图并保存", type="primary"):
        with st.spinner("正在处理图片并抠图，这可能需要一点时间..."):
            for file in uploaded_files:
                img = Image.open(file).convert("RGBA")
                cutout_img = extract_clothing(img, category_key)

                rgb = dominant_color(img)
                color_name = color_to_name(rgb)
                display_name = auto_name(color_name, category_key)
                stem = f"{uuid.uuid4().hex[:8]}"

                original_file, cutout_file = save_image_files(
                    img, cutout_img, stem
                )
                item = add_item_to_metadata(
                    display_name,
                    category_key,
                    color_name,
                    rgb,
                    original_file,
                    cutout_file,
                    extra=None,
                )

                st.success(f"已保存：{item['name']}（{color_name}）")
                col1, col2 = st.columns(2)
                with col1:
                    st.caption("原图")
                    st.image(img, use_column_width=True)
                with col2:
                    st.caption("抠图结果")
                    st.image(cutout_img, use_column_width=True)


def page_gallery():
    st.markdown('<div class="smart-page-title">👗 我的衣橱</div>', unsafe_allow_html=True)
    items = load_metadata()
    if not items:
        st.info("还没有衣物，请先在“上传抠图”页面添加。")
        return

    sort_key = st.selectbox(
        "排序方式",
        options=["时间最新", "时间最早", "颜色", "类别"],
    )

    if sort_key == "时间最新":
        items = sorted(items, key=lambda x: x.get("created_at", ""), reverse=True)
    elif sort_key == "时间最早":
        items = sorted(items, key=lambda x: x.get("created_at", ""))
    elif sort_key == "颜色":
        items = sorted(items, key=lambda x: x.get("color_name", ""))
    elif sort_key == "类别":
        items = sorted(items, key=lambda x: x.get("category", ""))

    tab_all, tab_top, tab_bottom, tab_shoes, tab_outer, tab_dress = st.tabs(
        ["全部", "上衣", "下装", "鞋子", "外套", "连衣裙"]
    )

    def render_items(filtered):
        cols = st.columns(3)
        for idx, item in enumerate(filtered):
            col = cols[idx % 3]
            with col:
                with st.container():
                    st.markdown('<div class="smart-grid">', unsafe_allow_html=True)
                    st.image(
                        image_path(item["cutout_file"], cutout=True),
                        use_column_width=True,
                    )
                    st.markdown(
                        f"**{item['name']}**  \n"
                        f"{CATEGORY_OPTIONS.get(item['category'], '单品')} · {item['color_name']}"
                    )
                    st.markdown("</div>", unsafe_allow_html=True)

    with tab_all:
        render_items(items)
    with tab_top:
        render_items([it for it in items if it.get("category") == "top"])
    with tab_bottom:
        render_items([it for it in items if it.get("category") == "bottom"])
    with tab_shoes:
        render_items([it for it in items if it.get("category") == "shoes"])
    with tab_outer:
        render_items([it for it in items if it.get("category") == "outer"])
    with tab_dress:
        render_items([it for it in items if it.get("category") == "dress"])


def page_outfit():
    st.markdown('<div class="smart-page-title">🤖 自动搭配</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="smart-page-subtitle">基于颜色和类别规则，从衣橱中自动生成一套穿搭建议。</div>',
        unsafe_allow_html=True,
    )

    if st.button("生成一套搭配", type="primary"):
        outfit = suggest_outfit()
        if not outfit:
            st.info("还没有足够的衣物数据，请先上传一些衣物。")
            return

        st.subheader("本次推荐搭配")
        cols = st.columns(len(outfit))
        for col, item in zip(cols, outfit):
            with col:
                st.image(
                    image_path(item["cutout_file"], cutout=True),
                    use_column_width=True,
                )
                st.markdown(
                    f"**{item['name']}**  \n"
                    f"{CATEGORY_OPTIONS.get(item['category'], '单品')} · {item['color_name']}"
                )

        st.caption("提示：可以多点几次按钮，看看不同的搭配灵感。")


def main():
    st.set_page_config(page_title="电子衣橱助手", page_icon="👗", layout="wide")

    inject_base_css()

    st.sidebar.title("电子衣橱助手")
    page = st.sidebar.radio(
        "功能",
        options=["上传抠图", "我的衣橱", "自动搭配"],
    )

    if page == "上传抠图":
        page_upload()
    elif page == "我的衣橱":
        page_gallery()
    else:
        page_outfit()


if __name__ == "__main__":
    main()

