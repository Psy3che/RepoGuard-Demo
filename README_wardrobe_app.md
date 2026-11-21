## 电子衣橱应用说明

这是一个基于 Streamlit 的简易电子衣橱 Web 应用，支持：

- **图片上传与一键抠图**：上传衣物图片，使用 `rembg` 自动去除背景。
- **图片存储与展示**：自动将原图和抠图结果保存到本地，并在“我的衣橱”页面以画廊形式展示。
- **自动命名**：根据主色和衣物类别自动生成中文名称，例如「蓝色上衣-20260302-120000」。
- **自动搭配**：根据颜色和类别的简单规则，从你的衣橱中智能地组合出一套穿搭。

### 安装依赖

在项目根目录（包含 `wardrobe_app.py` 的目录）下执行：

```bash
pip install -r requirements.txt
```

首次使用 `rembg` 时会自动下载模型，可能需要一些时间。

### 启动应用

在同一目录下运行：

```bash
streamlit run wardrobe_app.py
```

然后根据终端提示，在浏览器中打开对应的本地地址（通常是 `http://localhost:8501`）。

### 数据存储位置

应用会在项目根目录下自动创建 `wardrobe_data/` 文件夹：

- 原图：`wardrobe_data/original/`
- 抠图结果：`wardrobe_data/cutout/`
- 元数据（JSON）：`wardrobe_data/metadata.json`

删除这些文件即可清空电子衣橱数据。

