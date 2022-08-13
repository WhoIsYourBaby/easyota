
# server搭建

- clone代码
- cd .../server
- npm install



## 0、数据库设置

- .../server/utils/mysql.js


## 1、表结构设计

- user(使用邮箱+密码登录)
  - id
  - create_time
  - email
  - nickname
  - secret
  - type(账号类型：admin/user/guest)

- app(支持3个视频10张截图，desc与关键字冲突)
  - id
  - uuid
  - create_time
  - name
  - icon
  - short
  - adesc
  - platform(ios/android)
  - bundle_id

- app_version
  - id
  - create_time
  - app_id
  - version
  - build
  - vdesc
  - branch(alpha/beta/rc)
  - bin_url(oss/本地)
  - mainfest(ios专用)

- source(附件存储表，主要是一些截图+视频)
  - id
  - create_time
  - app_id(关联对应app，可空)
  - url
  - store(ali/qiniu/tencent/local)
  - type(pic/video/ipa/apk/...)
  



## 2、API设计

### 2.1 用户账户验证

- 登录注册、找回密码
- 管理员增删查改用户账户

### 2.2 App版本管理

- 上传ipa/apk
- 生成二维码(iOS与安卓有不同的二维码生成依据机制)
- app增删查改
- app版本增删查改


nginx反向代理转发域名和clientIp
{
# 其它部分
                proxy_set_header  Host  $host;
                proxy_set_header  X-real-ip $remote_addr;
                proxy_set_header  X-Forwarded-For $proxy_add_x_forwarded_for;
}