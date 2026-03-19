# 项目记忆

## 项目概述
这是一个个人 GitHub Pages 网站（yetian.github.io），包含多个小项目。网站支持中英文双语切换。

### 主页设计
- 现代化炫酷 UI 设计
- 动态渐变背景 + 浮动粒子动画
- 玻璃态效果卡片
- 悬停彩色边框动画
- 交错入场动画
- 响应式设计

## 完整项目结构
```
yetian.github.io/
├── index.html / index-zh.html    # 中英文主页
├── CLAUDE.md                     # 项目记忆文件
├── LICENSE                       # 许可证
├── acsdm/                        # 反云软件开发宣言
│   ├── index.html (英文)
│   └── index-zh.html (中文)
├── sudoku/                       # 数独游戏
│   ├── index.html
│   ├── sudoku.js
│   └── style.css
├── hanz/                         # 汉字学习
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── data/
│       └── dictionary.json       # 汉字字典数据
├── wxcy/                         # 五行穿衣
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── data/
│       ├── lunar-calendar.json   # 阴历数据
│       ├── five-element.json     # 五行数据
│       ├── zodiac.json           # 星座数据
│       ├── blood-type.json       # 血型数据
│       └── dressing-rules.json   # 穿衣规则
├── openclaw_suggest/             # AI Agent 安装决策与安全指南
│   ├── index.html                # 中文版
│   ├── index-en.html             # 英文版
│   ├── style.css
│   └── script.js                 # 包含 i18n 翻译对象
└── geodrive/                     # 3D 地图赛车游戏
    ├── index.html
    ├── main.js
    └── style.css
└── calcgen/                      # 算术题目生成器
    ├── index.html
    ├── style.css
    └── script.js
└── transformer/                  # Transformer 可视化
    ├── index.html
    ├── style.css
    └── script.js
└── mdeditor/                     # Markdown 编辑器
    ├── index.html
    ├── style.css
    └── script.js
```

---

## 项目详情

### 1. acsdm - 反云软件开发宣言

**功能**：展示"反云软件宣言"文章内容

**技术特点**：
- 支持浅色/深色主题切换
- 纯 HTML + CSS
- 响应式设计

**文件**：
- `index.html` - 英文版
- `index-zh.html` - 中文版

---

### 2. sudoku - 数独游戏

**功能**：可交互的数独游戏

**功能特点**：
- 多种难度等级（3x3, 4x4, 5x5 等）
- 计时器功能
- 错误高亮提示
- 智能提示功能
- 选中数字高亮
- 胜利弹窗显示用时
- 游戏统计（成功次数、最佳时间）

**技术特点**：
- 纯 JavaScript 类实现
- 本地存储游戏统计
- 响应式设计

**文件**：
- `index.html` - 游戏页面
- `sudoku.js` - 游戏逻辑
- `style.css` - 样式

---

### 3. hanz - 汉字学习

**功能**：互动汉字学习工具

**功能特点**：
- 搜索单个汉字
- 显示拼音和释义
- 笔顺动画演示（HanziWriter 库）
- 随机汉字学习
- 支持简繁切换（使用 CDN 库）

**技术特点**：
- 使用 HanziWriter CDN 库
- JSON 数据存储汉字字典
- 响应式设计

**文件**：
- `index.html` - 学习页面
- `app.js` - 主逻辑
- `style.css` - 样式
- `data/dictionary.json` - 汉字数据（约200个常用汉字）

---

### 4. wxcy - 五行穿衣

**功能**：根据八字五行、血型和天气推荐穿衣搭配

**输入信息**：
- 姓名（用于计算姓名五行）
- 阳历生日（含时间/时辰）
- 性别
- 血型
- 所在城市
- 今日天气

**计算功能**：
- **阳历转阴历**：使用预计算的农历数据表（1900-2100年）
- **八字计算**：年柱、月柱、日柱、时柱
- **姓名五行**：结合笔画数法和偏旁部首法
- **星座**：基于日期范围匹配
- **喜用神**：根据八字五行强弱计算
- **流年计算**：基于当前年份计算流年干支和五行
- **时间段能量**：根据当前时辰和季节计算五行能量

**输出内容**：
1. 今日运势（置顶，显示阳历/阴历日期、流年信息）
2. 基本信息展示
3. 八字分析（四柱）
4. 五行平衡分析（柱状图可视化）
5. 详细八字解读（包含性格特点、适合职业、健康提示）
6. 今日开运建议（幸运数字、方位、宝石等）
7. 穿衣推荐（颜色、款式、材质、配饰）- 每项最多3条
8. 穿衣禁忌

**特色功能**：
- localStorage 保存/加载用户信息
- **清除保存按钮**：仅在有保存信息时显示
- 隐私保护提示
- 动态星星背景动画（60颗星星 + 流星）
- 穿衣推荐区块用不同颜色区分
- **动态推荐**：根据当前日期、天气、流年动态调整推荐内容
- **每日幸运数字**：结合八字喜用神+当日日期+流年天干计算，每日变化

**数据扩展**（five-element.json）：
- 每个五行包含：幸运数字、幸运颜色、幸运方向、幸运花卉、幸运宝石、幸运动物
- 性格特点、性格优势、性格缺点
- 适合职业、不适合职业
- 健康提示

**数据扩展**（dressing-rules.json）：
- 每个五行包含：扩展颜色列表（6-8种）、款式风格（4种）、材质建议（5种）
- 配饰建议、避免颜色、面料图案、鞋子建议
- 幸运数字、幸运月份

**技术特点**：
- 纯 HTML + CSS + JavaScript
- 无需后端，所有计算在本地完成
- 使用 fetch 加载 JSON 数据文件
- CSS 动画实现星星背景

**文件**：
- `index.html` - 主页面
- `app.js` - 核心逻辑（约950行）
- `style.css` - 样式（约700行）
- `data/` - JSON 数据文件

---

### 5. openclaw_suggest - AI Agent 安装决策与安全指南

**功能**：交互式决策树，帮助用户选择合适的 AI Agent 并评估安全风险

**决策树问题**：
1. Q1 目标：开发 App/写代码 | 自动化操作网页/任务
2. Q2 实现方式：使用 AI Agent | 寻求专家帮助 | 使用现有工具
3. 环境（仅 Agent）：主力办公电脑 | 隔离环境
4. 审计能力（仅 Agent）：具备 | 不具备
5. 成本（仅 Agent）：已设置 API 限额 | 未设置

**核心功能**：
- 动态结果生成：根据回答给出安装建议
- 安全评分系统：0-100 分，根据环境、审计能力、成本控制综合评分
- 低分警告：评分 < 40 分时建议不使用 AI Agent，改用其他方案
- 安全警示板：四大分类（错误配置、供应链、错误认知、成本认知）
- 一键导出 PDF 报告

**UI 设计**：
- 终端美学深色模式
- 语言切换支持（中文/英文）
- 响应式设计，支持移动端
- 语言切换器位于页面顶部

**文件**：
- `index.html` - 中文版主页面
- `index-en.html` - 英文版主页面
- `style.css` - 终端风格样式
- `script.js` - 决策树逻辑、导出功能和 i18n 翻译

**i18n 实现**：
- 翻译对象 `i18n` 定义在 `script.js` 顶部
- 通过检测 `document.documentElement.lang` 自动判断语言
- 所有用户可见文本都通过 `i18n` 对象获取，支持中英文切换

**安全评分等级**（2026年更新）：
- High (高): 80-100 分
- Medium (中): 40-79 分
- Low (低): 0-39 分

---

### 6. geodrive - 3D 地图赛车游戏

**功能**：在真实世界地图上驾驶赛车的 3D 游戏

**功能特点**：
- 真实地图驾驶体验（使用 MapLibre GL JS）
- 浏览器 GPS 定位支持
- 地点搜索（Nominatim API）
- 道路导航（OSRM API）
- 左右两侧浮动侧栏（搜索导航 + 车辆配置）
- 车辆参数可配置并保存到 localStorage
- 输入时自动禁用 WASD 控制

**配置项**：
- 最大速度、倒车速度
- 加速度、转向速度、摩擦力
- 视觉缩放比例
- 缩放级别、视角倾斜

**文件**：
- `index.html` - 游戏页面
- `main.js` - 核心逻辑
- `style.css` - 样式

**技术栈**：
- Vanilla JS（原生脚本）
- MapLibre GL JS（地图引擎）
- Nominatim（地点搜索）
- OSRM（道路规划）
- OpenFreeMap（免费地图源）

---

### 7. calcgen - 算术题目生成器

**功能**：生成可打印的小学生数学练习题

**输入设置**：
- 数字范围（起始数字和终止数字）
- 计算方法（加法、减法、乘法、除法，可多选）
- 题目数量（1-100）
- 每行题目数（1-10）
- 计算方式（行计算 / 竖式计算）

**核心功能**：
- 随机生成加减乘除题目
- 减法确保结果非负
- 乘法限制范围（1-12，乘法口诀）
- 除法确保整除
- 实时预览
- A4 打印支持

**UI 设计**：
- 液态玻璃效果（Glassmorphism）
- 动态渐变背景 + 浮动 orb 动画
- 响应式设计
- 打印样式优化

**文件**：
- `index.html` - 主页面
- `style.css` - 液态玻璃样式
- `script.js` - 生成逻辑和打印功能

---

### 8. transformer - Transformer 可视化

**功能**：交互式可视化展示Transformer架构原理

**输入**：文本（最多100字）

**可视化视图**：
- 神经元视图：展示 Q/K 向量如何计算注意力
- 注意力矩阵：热力图展示权重分布
- 连接图：可视化 Token 间注意力关系
- 全局视图：所有层和头的鸟瞰图

**技术特点**：
- Three.js 3D粒子背景
- 多头注意力可视化（8种不同模式）
- 详细解释每个计算步骤
- 液态玻璃效果 UI

**文件**：
- `index.html` - 主页面
- `style.css` - 样式
- `script.js` - 可视化逻辑

---

### 9. mdeditor - Markdown 编辑器

**功能**：简洁优雅的 Markdown 编辑器

**功能特点**：
- 实时预览（分屏/仅编辑/仅预览）
- 工具栏快捷操作（标题、加粗、斜体、链接等）
- 代码语法高亮（highlight.js）
- 数学公式支持（KaTeX，支持 $...$ 和 $$...$$ 语法）
- 自动保存到 localStorage
- 多格式导出（.md / .html / .txt）
- 行号显示
- 字符/词/行统计
- 可拖动分割线

**UI 设计**：
- **Liquid Glass 风格**：Apple 液态玻璃设计语言
  - 半透明背景 + 模糊效果（backdrop-filter: blur）
  - 渐变边框和内部阴影
  - 浮动光球背景动画
- **视图切换动画**：
  - 滑动指示器效果，点击时平滑滑动到目标按钮
  - 面板展开/收缩动画（scale + opacity）
- **紧凑工具栏**：紧凑的按钮设计，视图切换位于主工具栏
- **面板头部统一高度**：编辑器和预览面板头部均为 46px
- **响应式布局**：适配移动端

**快捷键**：
- Ctrl+S：保存
- Ctrl+B：加粗
- Ctrl+I：斜体

**文件**：
- `index.html` - 主页面
- `style.css` - Liquid Glass 样式
- `script.js` - 编辑器逻辑

**CDN 依赖**：
- marked.js - Markdown 解析
- highlight.js - 代码高亮
- KaTeX - 数学公式渲染

---

## 技术栈

- 纯 HTML + CSS + JavaScript（无框架）
- GitHub Pages 托管
- 无后端服务
- CDN 库：
  - HanziWriter（汉字学习）
  - MapLibre GL JS（地图引擎）
  - marked.js（Markdown 解析）
  - highlight.js（代码高亮）
  - KaTeX（数学公式渲染）
  - Three.js（3D 动画）
- 免费 API：
  - Nominatim（地点搜索）
  - OSRM（道路规划）
  - OpenFreeMap（地图瓦片）
  - 无需 token 的开源库

## 用户偏好

- 使用 bun 作为包管理器（如需）
- 不使用 API，所有计算本地完成
- 喜欢详细的 UI 反馈和动效
- 注重隐私，数据存储在本地浏览器
- 喜欢现代化、炫酷的 UI 设计
- 标签：全栈开发、产品安全与合规、UI/UX、开源爱好者

## 常用命令

- 本地预览：使用任意静态服务器打开 index.html
- 部署：推送到 GitHub 后自动部署到 GitHub Pages
- 测试：由于是静态网站，可直接用浏览器打开 HTML 文件测试

## 页面链接

- 主页：https://yetian.github.io
- 中文主页：https://yetian.github.io/index-zh.html

---

## 开发注意事项

1. 所有项目都是纯静态 HTML/CSS/JS，无需构建步骤
2. 外部资源（如 HanziWriter）使用 CDN
3. 数据存储在 JSON 文件中
4. 用户数据存储在 localStorage，不上传服务器
5. 多语言版本文件用 `-zh` 后缀区分（如 index-zh.html）
