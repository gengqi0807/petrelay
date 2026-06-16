# PetRelay

PetRelay 是一个基于邻里互助的宠物临时托管平台，采用前后端分离架构。

**后端**：Node.js + Express + Sequelize + MySQL  
**前端**：Vue 3 + Vite + Element Plus

## 快速开始

### 1. 数据库初始化

进入 `backend/` 目录：

```bash
cd backend
```

复制环境文件（包含您的 MySQL 凭证）：

```bash
Copy-Item .env.example .env
```

初始化数据库（自动创建数据库和表）：

```bash
npm run init-db
```

### 2. 启动后端

```bash
npm start
```

后端运行在 `http://localhost:3000`

### 3. 启动前端

进入 `frontend/` 目录：

```bash
cd frontend
npm run dev
```

前端运行在 `http://localhost:5173`

## 功能模块

### 用户管理
- ✅ 用户注册（支持宠物主人/宠托师角色选择）
- ✅ 用户登录（JWT认证）
- ✅ 个人资料编辑
- ✅ 宠物信息管理

### 宠物主人功能
- ✅ 发布托管需求
- ✅ 查看我的发布
- ✅ 查看宠托师申请
- ✅ 确认订单并评价

### 宠托师功能
- ✅ 浏览托管需求（仅宠托师可访问）
- ✅ 申请接单
- ✅ 查看我的应聘
- ✅ 查看进行中的订单

### 订单管理
- ✅ 订单创建与确认
- ✅ 订单状态管理
- ✅ 服务记录上传
- ✅ 订单评价

## 权限控制

- **未登录用户**：仅可访问首页、登录、注册页面
- **宠物主人**：可发布需求、查看申请、管理订单
- **宠托师**：仅可浏览需求列表、申请接单、管理订单

## 项目结构

```
petrelay/
├── backend/
│   ├── config/          # 数据库配置
│   ├── middleware/      # 认证中间件
│   ├── models/          # Sequelize 数据模型
│   ├── routes/          # API 路由
│   ├── scripts/         # 初始化脚本
│   └── index.js         # 主入口
├── frontend/
│   ├── src/
│   │   ├── components/  # 可复用组件
│   │   ├── composables/ # 业务逻辑钩子
│   │   ├── router/      # 路由配置与守卫
│   │   ├── utils/       # 工具函数
│   │   ├── views/       # 页面组件
│   │   ├── App.vue      # 根组件
│   │   └── main.js      # 入口
│   └── vite.config.js   # Vite 配置
└── README.md
```

## API 端点

### 认证 (`/api/auth`)
- `POST /register` - 注册
- `POST /login` - 登录

### 用户 (`/api/users`)
- `GET /me` - 获取当前用户信息
- `PUT /me` - 更新用户信息

### 宠物 (`/api/pets`)
- `POST /` - 创建宠物
- `GET /` - 获取我的宠物列表

### 需求 (`/api/requests`)
- `POST /` - 发布需求
- `GET /` - 获取所有需求
- `GET /my` - 获取我的需求
- `GET /:id` - 获取需求详情

### 申请 (`/api/applications`)
- `POST /` - 提交申请
- `POST /:id/accept` - 接受申请
- `GET /received` - 获取收到的申请
- `GET /mine` - 获取我的申请

### 订单 (`/api/orders`)
- `POST /` - 创建订单
- `POST /:id/complete` - 完成订单
- `GET /my` - 获取我的订单

### 评价 (`/api/reviews`)
- `POST /` - 提交评价
- `GET /by-sitter/:sitterId` - 获取宠托师评价

## 数据模型

- **User** - 用户（宠物主人/宠托师/管理员）
- **Pet** - 宠物
- **Request** - 托管需求
- **Application** - 接单申请
- **Order** - 托管订单
- **ServiceRecord** - 服务记录
- **Review** - 评价

## 开发指南

### 环境变量

后端 `.env` 文件：

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=petrelay
DB_USER=bank
DB_PASSWORD=210507Qq@
PORT=3000
JWT_SECRET=petrelay-secret (可选)
```

### 前端配置

在 `vite.config.js` 中配置代理：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

## 注意事项

1. 需求列表仅宠托师可访问，未登录或非宠托师身份的用户将被重定向
2. 所有需要认证的接口需在请求头中带 `Authorization: Bearer {token}`
3. 密码存储使用 bcrypt 加密
4. JWT 令牌有效期为 7 天

## 后续功能

- [ ] 实时通知系统
- [ ] 在线聊天
- [ ] 支付集成
- [ ] 用户信用评分
- [ ] 宠物照片与视频上传
- [ ] 地理位置距离计算
