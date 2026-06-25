# 工作日志 · Note Plan Day

记录每天的工作内容，支持按日 / 周 / 月查看，部署到云端后通过网址随时访问。

## 功能

- **日视图**：编辑当天工作记录，自动保存
- **周视图**：以周为单位浏览，点击某天进入编辑，支持导出 Markdown
- **月视图**：月历概览，有记录的日期会显示标记，支持导出 Markdown
- **访问密码**：设置 `APP_PASSWORD` 后需登录才能访问
- **数据持久化**：SQLite 存储；本地 Docker 部署可挂载卷；Render 免费版重启后数据可能丢失（可用导出功能备份）

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

## 云端部署（Render 免费版，无需绑卡）

### 方式一：Blueprint（推荐）

1. 登录 [Render](https://render.com)
2. **New → Blueprint**
3. 连接 GitHub 仓库 `1815925301/note-plan-day`
4. 设置环境变量 **`APP_PASSWORD`**（访问密码）
5. 点击 **Apply** 部署

### 方式二：Web Service

1. **New → Web Service**
2. 选择仓库 `1815925301/note-plan-day`
3. Runtime 选 **Docker**，Instance Type 选 **Free**
4. 添加环境变量 **`APP_PASSWORD`**
5. 点击 **Create Web Service**

部署完成后访问 Render 提供的 `https://xxx.onrender.com` 地址。

> **免费版限制**：15 分钟无访问会休眠（唤醒约 30 秒）；服务重启或重新部署后数据可能丢失，请定期用「导出」备份。

修改配置后推送到 GitHub：

```bash
git add render.yaml
git commit -m "Remove persistent disk for Render free tier"
git push
```

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
