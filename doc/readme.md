# 环境搭建
122.51.162.24
- 安装pip 
```
yum upgrade python-setuptools
yum install python-pip
```

- 安装isign
```
pip install isign
```

- 创建server
node v10.15.3
npm 6.4.1
```
npm install -g koa-generator
koa2 server
cd server & npm install
```

- 创建web
```
# 克隆项目
git clone https://github.com/PanJiaChen/vue-element-admin.git web

# 进入项目目录
cd web

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev

# 浏览器访问 http://localhost:9527


# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod

# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```