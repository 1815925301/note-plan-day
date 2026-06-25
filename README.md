# 工作日志 · Note Plan Day

记录每天的工作内容，支持按日 / 周 / 月查看，部署到云端后通过网址随时访问。

## 功能

- **日视图**：编辑当天工作记录，自动保存
- **周视图**：以周为单位浏览，点击某天进入编辑，支持导出 Markdown
- **月视图**：月历概览，有记录的日期会显示标记，支持导出 Markdown
- **访问密码**：设置 `APP_PASSWORD` 后需登录才能访问
- **数据持久化**：SQLite 存储，Docker 部署时挂载卷保存数据

## 本地开发

```bash
# 安装依赖
npm run install:all

# 终端 1：启动后端
npm run dev:server

# 终端 2：启动前端（带 API 代理）
npm run dev:client
```

浏览器打开 http://localhost:5173

本地开发默认不启用密码（未设置 `APP_PASSWORD`）。如需测试登录：

```bash
# Windows PowerShell
$env:APP_PASSWORD="test123"; npm run dev:server
```

## 本地生产模式

```bash
npm run install:all
npm run build
APP_PASSWORD=your-password npm start
```

访问 http://localhost:3000

## Docker 部署（推荐）

```bash
# 设置密码后启动
APP_PASSWORD=your-password docker compose up -d --build
```

访问 http://localhost:3000，数据保存在 Docker 卷 `note-data` 中。

## 云端部署（Render）

### 第一步：推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit: work log app with auth and export"
gh repo create note-plan-day --public --source=. --push
```

### 第二步：Render 部署

1. 登录 [Render](https://render.com)
2. **New → Blueprint**
3. 连接 GitHub 仓库 `note-plan-day`
4. Render 读取 `render.yaml` 自动创建服务
5. 在 Dashboard 中为 `APP_PASSWORD` 设置访问密码
6. 部署完成后访问 `https://note-plan-day.onrender.com`

> 免费实例 15 分钟无访问后会休眠，首次打开需等待约 30 秒唤醒。

## 导出

在周视图或月视图点击 **导出** 按钮，下载 `.md` 文件，可直接在 Obsidian、Typora 等工具中打开。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/auth/status` | 认证状态 |
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 退出 |
| GET | `/api/entries/:date` | 获取某天记录 |
| PUT | `/api/entries/:date` | 保存某天记录 |
| GET | `/api/entries?week=YYYY-MM-DD` | 获取某周记录 |
| GET | `/api/entries?year=2025&month=6` | 获取某月记录 |
| DELETE | `/api/entries/:date` | 删除某天记录 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3000 | 服务端口 |
| `DATA_DIR` | `./server/data` | SQLite 数据库目录 |
| `APP_PASSWORD` | （空） | 访问密码，设置后启用登录 |

## 技术栈

- 后端：Node.js + Express + better-sqlite3
- 前端：React + Vite
- 部署：Docker / Render
