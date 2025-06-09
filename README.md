# 宠爱社区 (PetCare Community)

基于Vue 3、TypeScript和Element Plus的宠物服务社区网站。

## 项目设置

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境构建
npm run build
```

## Netlify部署说明

1. 在Netlify上创建新的站点并连接到您的GitHub仓库
2. 设置以下环境变量:
   - `VITE_SUPABASE_URL`: 您的Supabase项目URL
   - `VITE_SUPABASE_ANON_KEY`: 您的Supabase匿名密钥

### 环境变量设置步骤

1. 登录Netlify管理后台
2. 进入您的站点设置
3. 点击"Build & deploy"菜单
4. 在"Environment"部分，点击"Edit variables"
5. 添加上述两个环境变量

## 本地开发环境变量

创建一个`.env.local`文件在项目根目录，添加以下内容:

```
VITE_SUPABASE_URL=您的Supabase项目URL
VITE_SUPABASE_ANON_KEY=您的Supabase匿名密钥
```

## 常见问题解决

### 登录/注册按钮没有反应

确保您已经正确设置了Supabase环境变量。检查浏览器控制台是否有错误信息。

### 默认显示已登录状态

这可能是由于浏览器保存了之前的登录会话。您可以:

1. 尝试退出登录
2. 清除浏览器缓存和cookies
3. 使用隐私模式/无痕模式访问网站

### 登录状态持久化

本项目使用Supabase Auth的自动会话管理功能。登录后的状态会保存在浏览器的localStorage中，刷新页面或第二天访问时会自动恢复登录状态。 