
<h1 align="center">智学云枢 (ZXYS)</h1>
<p align="center">
  <strong>AI 驱动的智慧中医学习平台</strong>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Express-4.16-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/DeepSeek-AI-4A6CF7" alt="DeepSeek">
</p>

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [快速开始（本地开发）](#快速开始本地开发)
- [从零部署](#从零部署)
- [API 密钥配置](#api-密钥配置)
- [环境变量说明](#环境变量说明)
- [数据库说明](#数据库说明)
- [常见问题](#常见问题)

---

## 项目简介

**智学云枢** 是一款面向中医学习者的 AI 驱动智慧教育平台。平台深度融合大语言模型（DeepSeek / 讯飞星火）、数字人交互、知识图谱、语音识别等技术，为中医学习者提供个性化学习路径规划、AI 智能问答、模拟面试、知识图谱可视化、PDF 典籍阅读、3D 虚拟实验室等全方位学习体验。

---

## 功能特性

### 用户系统
- 邮箱注册/登录（验证码验证）
- 角色选择（中医学者 / 中医求职者 / 中医通识者）
- 入门测试 & 个性化初始化
- JWT Token 身份认证

### AI 学习助手
- **AI 每日总结**：基于用户学习数据，自动生成个性化学习报告与知识图谱
- **AI 智能问答**：DeepSeek / 讯飞星火驱动，回复附带知识图谱可视化
- **用户画像**：多维度能力评估（理论/辨证/临床/科研/经典），雷达图 + 趋势图展示

### 典籍书房
- PDF 在线阅读（带目录导航、页码跳转、缩放）
- 章节知识点映射
- 配套题库练习（选择题/填空题/简答题）
- 答题进度追踪 & 错题回顾

### 模拟面试
- **数字人面试官**：讯飞虚拟人 SDK 驱动，实时语音交互
- **浏览器语音识别**：Web Speech API 实现语音答题
- **AI 面试评估**：答题后自动分析，给出评分与改进建议
- 面试记录保存 & 历史回顾

### 知识图谱
- 中医知识点关系网络可视化
- 知识点掌握度追踪
- 学习浮动值每日更新

### 更多模块
- **AI 视频**：AI 生成的讲解视频，支持视频介绍页
- **方剂配伍 (FJPW)**：方剂组成与配伍关系可视化
- **中医词典 (ZYCD)**：中医术语查询
- **中医养生 (ZYYS)**：养生知识与建议
- **针灸腧穴 (ZCYJ)**：穴位图解
- **古籍经方 (GJHS)**：经典医籍与经方
- **中医舌诊 (ZYSZ)**：舌诊学习
- **Unity 3D 实验室**：虚拟中医实验场景
- **求职广场**：中医行业岗位浏览与搜索
- **考证中心**：中医资格证考试模拟练习

### 后台管理
- 用户管理 / 书籍管理 / 面试记录管理
- 题库管理 / 视频管理 / 简历管理

---

## 技术栈

### 前端 (ZXYS)

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5 + Composition API |
| 构建工具 | Vite 7.0 |
| 语言 | TypeScript 6.0 |
| 路由 | Vue Router 5.0 |
| 状态管理 | Pinia 3.0 |
| UI 组件库 | Ant Design Vue 4.2 / Element Plus 2.13 / Vant 4.9 |
| 图表 | ECharts 6.0 |
| HTTP 客户端 | Axios 1.14 |
| 3D 渲染 | Three.js 0.128 |
| PDF 阅读 | PDF.js 3.2 |
| 动画 | GSAP 3.14 |
| 翻页效果 | page-flip 2.0 |
| 国际化 | vue-i18n 12.0 |
| 数字人 SDK | 讯飞虚拟人 SDK / 阿里云 AICall SDK |

### 后端 (ZXYSBackend)

| 类别 | 技术 |
|------|------|
| 运行时 | Node.js |
| 框架 | Express 4.16 |
| ORM | Sequelize 6.37 |
| 数据库 | SQLite 3 |
| 认证 | JWT (jsonwebtoken 9.0) |
| 密码加密 | bcryptjs 3.0 |
| 邮件服务 | Nodemailer 8.0 (QQ SMTP) |
| AI SDK | OpenAI SDK (兼容 DeepSeek) / 讯飞星火 WebSocket |
| 云服务 | 阿里云 POP Core SDK / 阿里云 ICE |
| 日志 | Winston 3.19 |
| 参数校验 | Joi 18.1 / express-validator 7.3 |
| 文件上传 | Multer 2.1 |

---

## 项目结构

```
2026计算机设计大赛/
├── ZXYS/                          # 前端项目
│   ├── .env                       # 前端环境变量
│   ├── .env.example               # 环境变量示例（请复制为 .env）
│   ├── index.html                 # HTML 入口
│   ├── vite.config.ts             # Vite 配置
│   ├── tsconfig.json              # TypeScript 配置
│   ├── package.json               # 依赖与脚本
│   ├── public/                    # 静态资源
│   │   ├── pdfjs-3.2/             # PDF.js 库
│   │   ├── models/                # 3D 模型 (MediaPipe)
│   │   ├── Fonts/                 # 中文字体
│   │   ├── AiVideo/               # AI 视频数据
│   │   └── Unity/                 # Unity WebGL 构建
│   └── src/
│       ├── api/                   # API 请求模块
│       ├── assets/                # 图片/音频/视频资源
│       ├── components/            # 通用组件
│       │   ├── AIAssistant.vue    # AI 助手
│       │   ├── Nav.vue            # 导航栏
│       │   ├── Footer.vue         # 页脚
│       │   ├── Dialogue/          # 对话框组件
│       │   ├── Notification/      # 通知组件
│       │   ├── Popup/             # 弹窗组件
│       │   └── pdf/               # PDF 阅读组件
│       ├── i18n/                  # 国际化
│       ├── router/                # 路由配置
│       ├── services/              # 业务服务层
│       ├── stores/                # Pinia 状态管理
│       ├── types/                 # TypeScript 类型定义
│       ├── utils/                 # 工具函数
│       │   ├── AIYS/              # AI 语音 SDK 封装
│       │   └── ZYSZ_Lib/          # 舌诊 AI 工具库
│       └── views/                 # 页面组件
│           ├── Auth/              # 登录注册
│           ├── HomePage/          # 首页
│           ├── UserHome/          # 用户主页
│           ├── MockInterview/     # 模拟面试
│           ├── BookHouse/         # 典籍书房
│           ├── Manager/           # 后台管理
│           ├── AIYS/              # AI 语音交互
│           └── ...                # 其他页面模块
│
├── ZXYSBackend/                   # 后端项目
│   ├── .env                       # 后端环境变量
│   ├── .env.example               # 环境变量示例（请复制为 .env）
│   ├── package.json               # 依赖与脚本
│   ├── database.sqlite            # SQLite 数据库文件
│   ├── bin/www                    # 启动脚本
│   ├── uploads/                   # 上传文件目录
│   │   ├── books/                 # PDF 书籍
│   │   ├── covers/                # 书籍封面
│   │   └── emotionImg/           # 表情图片
│   └── src/
│       ├── server.js              # 服务入口
│       ├── app.js                 # Express 应用配置
│       ├── config/
│       │   └── database.js        # 数据库配置
│       ├── controllers/           # 控制器
│       ├── dtos/                  # 数据传输对象
│       ├── exceptions/            # 自定义异常
│       ├── middlewares/           # 中间件
│       ├── models/                # 数据模型 (Sequelize)
│       ├── routes/                # 路由定义
│       ├── services/              # 业务服务层
│       └── utils/                 # 工具函数
│           └── AI/                # AI 工厂 & 适配器
│               ├── aiFactory.js   # AI 提供商工厂
│               ├── deepseek.js    # DeepSeek 适配器
│               ├── iflytek.js     # 讯飞星火适配器
│               └── chatPrompt.js  # 对话提示词模板
│
└── README.md                      # 本文件
```

---

## 环境要求

| 环境 | 版本要求 |
|------|----------|
| Node.js | `^20.19.0` 或 `>=22.12.0` |
| npm | 随 Node.js 附带 |
| 操作系统 | macOS / Windows / Linux |

> 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node.js 版本。

---

## 快速开始（本地开发）

### 1. 克隆项目

```bash
# 将项目文件夹复制到你的工作目录
cd 2026计算机设计大赛
```

### 2. 配置后端

```bash
cd ZXYSBackend

# 安装依赖
npm install

# 复制环境变量文件并编辑
# （注意：项目已包含 .env 文件，但你需要将里面的占位符替换为真实值）
# 编辑 .env，填入你自己的 API Key（详见下方「API 密钥配置」章节）
```

```bash
# 启动后端开发服务器（默认 http://0.0.0.0:3000）
npm run dev
```

后端 API 启动后可以访问 `http://localhost:3000/health` 验证是否正常运行。

### 3. 配置前端

```bash
cd ../ZXYS

# 安装依赖
npm install

# 编辑 .env，确认 API 地址指向本地后端
# VITE_API_URL=http://localhost:3000/api
# VITE_RESOURCES_URL=http://localhost:3000
```

```bash
# 启动前端开发服务器（默认 http://localhost:5173）
npm run dev
```

### 4. 访问应用

浏览器打开 `http://localhost:5173`，注册账号后即可开始使用。

---

## 从零部署

### 后端部署

#### 方式一：直接部署（推荐用于小型/个人部署）

```bash
cd ZXYSBackend

# 1. 安装依赖
npm install

# 2. 配置环境变量（填入真实 API Key）
# 编辑 .env 文件

# 3. 启动服务（使用 pm2 保持后台运行）
npm install -g pm2
pm2 start src/server.js --name zxys-backend
pm2 save
pm2 startup  # 设置开机自启
```

#### 方式二：使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://127.0.0.1:3000;
    }

    # 前端静态文件
    location / {
        root /path/to/ZXYS/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 前端部署

```bash
cd ZXYS

# 1. 确认 .env 中的 API 地址指向你的后端服务器
# VITE_API_URL=https://your-domain.com/api
# VITE_RESOURCES_URL=https://your-domain.com

# 2. 构建生产版本
npm run build

# 3. 将 dist/ 目录部署到 Nginx 或其他静态服务器
# 生产文件位于 ZXYS/dist/
```

### Docker 部署（可选）

<details>
<summary>点击展开 Docker 部署说明</summary>

后端 Dockerfile 示例：

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY ZXYSBackend/package*.json ./
RUN npm ci --production
COPY ZXYSBackend/ .
EXPOSE 3000
CMD ["node", "src/server.js"]
```

```bash
docker build -t zxys-backend .
docker run -d -p 3000:3000 --env-file ZXYSBackend/.env zxys-backend
```

前端可以使用 Nginx Docker 镜像部署 `dist/` 目录。
</details>

---

## API 密钥配置

本项目集成了多个第三方 AI 和云服务，**必须将以下 API 密钥替换为你自己的，否则相关功能无法使用**。

### 必须配置的密钥

| 服务 | 用途 | 获取地址 | 配置位置 |
|------|------|----------|----------|
| **DeepSeek API** | AI 对话、每日总结、用户画像生成 | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) | `ZXYSBackend/.env` → `DEEPSEEK_API_KEY` |
| **QQ 邮箱 SMTP** | 注册验证码发送 | QQ邮箱 → 设置 → 账户 → POP3/SMTP → 生成授权码 | `ZXYSBackend/.env` → `EMAIL_USER` / `EMAIL_PASS` |
| **JWT Secret** | 用户登录 Token 签名 | 自行生成随机字符串 | `ZXYSBackend/.env` → `JWT_SECRET` |

### 可选配置的密钥

| 服务 | 用途 | 获取地址 | 配置位置 |
|------|------|----------|----------|
| **讯飞星火大模型** | 替代 DeepSeek 的 AI 提供商 | [console.xfyun.cn](https://console.xfyun.cn/) | `ZXYSBackend/.env` → `SPARK_*` |
| **讯飞数字人** | 模拟面试中的虚拟数字人形象 | [console.xfyun.cn](https://console.xfyun.cn/) | `ZXYS/.env` → `VITE_API_XFHUMAN_*` |
| **讯飞语音识别** | 模拟面试中的语音输入 | [console.xfyun.cn](https://console.xfyun.cn/) | `ZXYSBackend/.env` → `LIVE_MIC_*` |
| **阿里云 AccessKey** | AI 智能体服务（阿里云 ICE） | [ram.console.aliyun.com](https://ram.console.aliyun.com/manage/ak) | `ZXYSBackend/.env` → `OPENAPI_ACCESS_*` |

### 重要提醒

- **不要将包含真实密钥的 `.env` 文件提交到 Git 仓库**。项目中的 `.env` 文件已使用占位符替换。
- 所有源代码中硬编码的默认密钥均已被替换为占位符（如 `your_deepseek_api_key`）。
- 如果某项服务不使用，可以保持占位符不变，对应功能将显示错误提示但不会影响其他功能。
- 生产环境建议使用环境变量注入或密钥管理服务，而非 `.env` 文件。

---

## 环境变量说明

### 后端环境变量 (`ZXYSBackend/.env`)

```bash
# 服务端口
PORT=3000

# 邮件服务（用于发送注册验证码）
EMAIL_HOST=smtp.qq.com
EMAIL_PORT=465
EMAIL_USER=your_email@qq.com        # 你的QQ邮箱
EMAIL_PASS=your_email_auth_code     # QQ邮箱SMTP授权码

# CORS 跨域配置
HTTP_CORS_HOST=*

# DeepSeek AI（主要 AI 提供商）
DEEPSEEK_API_KEY=your_deepseek_api_key

# AI 提供商选择：deepseek 或 spark
AI_PROVIDER=deepseek

# 讯飞星火大模型（备选 AI 提供商）
SPARK_APPID=your_spark_appid
SPARK_API_KEY=your_spark_api_key
SPARK_API_SECRET=your_spark_api_secret

# 日志级别：debug / info / warn / error
LOG_LEVEL=info

# JWT 密钥（用于用户登录token签名，务必修改为随机字符串）
JWT_SECRET=your-jwt-secret-here-change-me

# 讯飞语音识别（直播麦）
LIVE_MIC_APP_ID=your_live_mic_app_id
LIVE_MIC_APP_KEY=your_live_mic_app_key

# 阿里云 AccessKey（AI 智能体服务）
OPENAPI_ACCESS_KEY=your_aliyun_access_key
OPENAPI_ACCESS_SECRET=your_aliyun_access_secret
```

### 前端环境变量 (`ZXYS/.env`)

```bash
# 后端 API 地址（开发环境用 localhost，生产环境用实际域名）
VITE_API_URL=http://localhost:3000/api

# 资源文件地址（通常与 API 同域）
VITE_RESOURCES_URL=http://localhost:3000

# 讯飞数字人配置（模拟面试功能使用）
VITE_API_XFHUMAN_APPID=your_xfhuman_appid
VITE_API_XFHUMAN_APIKEY=your_xfhuman_apikey
VITE_API_XFHUMAN_APISECRET=your_xfhuman_apisecret
```

---

## 数据库说明

- 后端使用 **SQLite** 数据库，数据库文件为 `ZXYSBackend/database.sqlite`
- 首次启动后端时，Sequelize 会自动创建所有数据表（`sequelize.sync()`）
- 数据表包括：用户、验证码、知识点、知识关系、用户掌握度、书籍、章节、题库、书架、学习进度、每日浮动、模块表现、AI 总结、每日任务、简历、面试准备、面试记录等
- 如需重置数据库，删除 `database.sqlite` 文件后重启后端即可
- 生产环境如需更高性能，可修改 `src/config/database.js` 切换为 MySQL/PostgreSQL

### 模型关系图

```
User
├── 1:1 UserResume          (简历)
├── 1:N UserMastery         (知识点掌握度)
├── 1:N UserBookshelf       (书架)
├── 1:N UserChapterProgress (章节学习进度)
├── 1:N UserKpDailyFloat    (每日知识点浮动)
├── 1:N UserDailyAISummary  (AI 每日总结)
├── 1:N UserDailyTask       (每日学习任务)
├── 1:N InterviewPreparation(面试准备)
└── 1:N InterviewRecord     (面试记录)

BookDetail
├── 1:N BookChapter         (书籍章节)
└── 1:N BookNodeMap         (书籍-知识点映射)

KnowledgePoint
├── 1:N KnowledgeRelation   (知识关系)
├── 1:N UserMastery         (掌握度)
└── 1:N BookNodeMap         (书籍映射)
```

---

## 常见问题

### 1. 注册时收不到验证码邮件？

- 检查 `ZXYSBackend/.env` 中邮箱配置是否正确
- QQ 邮箱需要使用**授权码**而非登录密码（QQ邮箱 → 设置 → 账户 → POP3/SMTP 服务）
- 检查后端控制台是否有报错日志

### 2. AI 对话/总结功能不工作？

- 确认 `DEEPSEEK_API_KEY` 已配置且有效
- 确认后端 `.env` 中 `AI_PROVIDER=deepseek`
- 检查后端日志中的 API 错误信息
- DeepSeek API 需要网络能访问 `api.deepseek.com`

### 3. 模拟面试数字人无法使用？

- 模拟面试默认使用**浏览器语音识别**（Chrome/Edge 支持），无需额外配置
- 数字人功能需要配置讯飞虚拟人 SDK 凭证（`.env` 中的 `VITE_API_XFHUMAN_*`）
- 如果只是模拟面试答题（不含数字人形象），可以不配置数字人

### 4. 前端页面空白/路由不工作？

- 确保使用 `npm run dev` 启动 Vite 开发服务器
- 检查浏览器控制台是否有报错
- 确保后端 API 正常运行（访问 `http://localhost:3000/health` 验证）

### 5. 如何切换 AI 提供商？

在 `ZXYSBackend/.env` 中修改：
```bash
AI_PROVIDER=spark     # 使用讯飞星火
# 或
AI_PROVIDER=deepseek  # 使用 DeepSeek（默认）
```
并确保对应提供商的 API 密钥已正确配置。

### 6. 数据库如何备份？

```bash
# 直接复制 SQLite 数据库文件即可
cp ZXYSBackend/database.sqlite ZXYSBackend/database_backup.sqlite
```

### 7. Node.js 版本不兼容？

项目要求 Node.js `^20.19.0` 或 `>=22.12.0`。如果版本不符：
```bash
# 使用 nvm 切换版本
nvm install 22
nvm use 22
```

---

## 开源协议

本项目仅用于学习和参赛目的。

---

<p align="center">
  <sub>Made with ❤️ for Traditional Chinese Medicine Education</sub>
</p>
