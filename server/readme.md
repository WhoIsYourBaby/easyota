
## 0、数据库设置

- mysql
- 账号密码:easyota123/easyota123


## 1、表结构设计

- user(使用邮箱+密码登录)
  - id
  - create_time
  - email
  - nickname
  - secret
  - type(账号类型：管理员、普通用户、邀请用户)

- app(支持3个视频10张截图)
  - id
  - uuid
  - create_time
  - name
  - icon
  - short_link
  - desc
  - platform
  - bundleid
  

- app_screen
  - id
  - create_time
  - app_id(关联对应app)
  - url(oss/本地)
  - suffix(jpg/png...)


- app_video
  - id
  - create_time
  - app_id(关联对应app)
  - url(oss/本地)
  - suffix(mp4...)
  
- app_version
  - id
  - create_time
  - app_id
  - version
  - build
  - desc
  - type(0:开发版 1:内测版 2:发布版)
  - bin_url(oss/本地)



## 2、API设计

### 2.1 用户账户验证

- 登录注册、找回密码
- 管理员增删查改用户账户

### 2.2 App版本管理

- 上传ipa/apk
- 生成二维码(iOS与安卓有不同的二维码生成依据机制)
- app增删查改
- app版本增删查改