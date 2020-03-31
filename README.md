## wx-booker
微信小程序-书巢小程序（图书共享预定 ）  更新至V2.0.0

# 体验效果
**在微信中搜索小程序【建始同城共享书】或扫码体验**  
![viewimg/01.jpg](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20191209//078f48a42b6ecfd21bdc9507cf022f46.jpg)

![viewimg/02.jpg](https://img-cdn-qiniu.dcloud.net.cn/uploads/article/20191209//33c03e5bea60a753715e235791728765.jpg)  

![viewimg/02.gif](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/02.gif) 


# 初衷
通过微信小程序向当地爱书者提供一个图书共享预定平台，前期期望投入费用越少越好。同时还要有一定的变现能力，例如图书借阅费、本地商家广告投放。

# V2.0.0功能新增（20200205）
1. 完全自定义文章类型和自定义字段
2. 增加输入ISBN一键获取豆瓣书籍信息
3. 增加看广告显示隐藏内容短代码，可插入到正文任意位置
4. 增加办公文档查看
5. 增加切换风格
6. 增加关于页面，内容在后台配置输出
7. 增加悬浮广告位，可后台配置显示在首页/列表页/详情页
8. 增加可关闭借阅按钮
9. 增加若干全局设置

# V1.0.0功能分解
1. 图书分类管理
2. 图书信息管理，包括介绍和图书相关ISBN、关联分类等
3. 预借功能与费用管理
4. 图书在馆状态
5. 全局搜索图书
6. 图书条形码扫码查询
7. 用户管理与用户等级
8. 广告管理
9. 本地商家服务投放
10. 图书订阅帮助信息
11. 用户浏览与喜欢统计
12. UI交互清爽简单

# 程序选型
- **域名：阿里云购买**  
制作小程序域名还是必须的，这个去阿里云买一个.com域名就好。年费50元+。
- **服务器：阿里云ECS**  
这个是做互联网没办法少的，选用ECS主要因为我服务器有其他建站需求，建立多个网站使用。年费：500元+。
- **后台：Wordpress**  
强大而免费，通过插件的使用可以打造出功能完善的CMS/商城系统。年费：0元。
- **RESTAPI:微慕小程序插件**  
这个是用于将wordpress和小程序通信的插件程序，我是用的是微慕小程序插件1.6.0。年费：0元。
- **小程序：微信小程序个人版**  
前期因为无法预测变现能力，所以考虑成本，我输出的是个人版小程序。未来有更多本地商业服务的时候，移植到企业版。年费：0元。
- **前端：微慕开源版+自己摸索完成**  
小程序的前端是我通过微慕开源版3.6的代码二次开发完成，我现在Github已开源，有需要的朋友可以Clone。费用：0元。

# 使用
- **环境准备** [服务器选型](https://www.aliyun.com/minisite/goods?userCode=zz7g1dvg)购买、[域名购买](https://wanwang.aliyun.com/)、[备案](https://beian.aliyun.com/)、[配置环境](https://www.zhihu.com/search?type=content&q=%E9%98%BF%E9%87%8C%E4%BA%91%20ecs%20centos%20%E6%90%AD%E5%BB%BAPHP%E7%BD%91%E7%AB%99)网上很多教程这里不再赘述，注意：微信小程序要求域名需备案、https：//开头。  

- **程序安装**
 1. *Wordpress安装*  
 前往[官方下载](https://wordpress.org/)或者[https://github.com/WordPress/WordPress](https://github.com/WordPress/WordPress)最新版本，按网上教程一步步安装。
 2. *Wordpress主题安装*  
 我使用[raz主题](http://appbeebee.com/product/raz/)，主要是我比较懒，这个主题不光是因为我网站商城需要简洁的效果，自带的文章自定义字段也方便我定义。
 ![viewimg/03.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/03.jpg)  
 3. *Wordpress插件安装*  
 这里用到两个插件：微慕的小程序插件[https://github.com/iamxjb/rest-api-to-miniprogram](https://github.com/iamxjb/rest-api-to-miniprogram)+全局搜索插件Search Everything，在wordpress后台安装新插件搜索进行安装。前者的RestAPI用于与微信小程序通信，后者用于小程序支持字段搜索。
 ![viewimg/04.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/04.jpg)   
 ![viewimg/05.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/05.jpg)   
 ![viewimg/06.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/06.jpg)   
 4. *微慕开源版下载*  
 微慕算很良心的小程序开源商，功能多，文档详细，社区活跃，值得使用。需要高级功能的可以去[微慕商城](https://shops.minapper.com/)购买专业版，提供在线技术支持。微慕开源版本在Github的传送门：[https://github.com/iamxjb/winxin-app-watch-life.net](https://github.com/iamxjb/winxin-app-watch-life.net)。
 5. *微信小程序账号申请*  
 前往[微信官方](https://mp.weixin.qq.com/)注册小程序账号，后台获取你的appid和秘匙，填写相应的小程序信息。选择服务类型时要注意，个人类型的小程序在服务类型选择上要慎重，看[官方文档](https://developers.weixin.qq.com/miniprogram/product/material/)，最好选择工具类型。
 6. *微信小程序开发环境安装*  
 前往[微信官方下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)最新版本的微信开发者工具，安装后启用微慕开源版的代码，按[微慕官方的帮助文档](https://www.minapper.com/doc/web/#/3?page_id=54)修改代码中相应的设置。
 ![viewimg/07.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/07.jpg) 

至此，程序安装完成，这一步预览小程序的效果是微慕小程序的模板。

- **微信小程序-书巢小程序模板安装调试**  
 1. *Wordpress插件替换*  
 Clone [微信小程序-图书共享预定](https://github.com/shiheme/wx-booker)到本地，其中code是小程序前端代码。plug是微慕的小程序插件的修改版，该插件务必配合使用[raz主题](http://appbeebee.com/product/raz/)才能用。  
 ![viewimg/08.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/08.jpg) 
 2. *小程序前端代码替换*  
 将code里的代码复制替换微慕的前端代码即可。  
 ![viewimg/09.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/09.jpg) 
 3. *建立分类*  
 代码中的书籍、帮助FAQ、本地活动调用的是Wordpress的三个父级目录。在Wordpress的文章分类中首先创建三个父级目录，将目录ID分别替换代码的中cateparentID/categories。三个id分别在page/index/index.js,page/faq/faq.js,page/act/act.js  
 ![viewimg/10.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/10.jpg)   
 ![viewimg/11.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/11.jpg)  
 4. *写文章*  
 自定义字段和分类记得填写和选择。注意书目、本地活动对应的字段对应不同的用途。  
 ![viewimg/12.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/12.jpg) 
 ![viewimg/13.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/13.jpg)    
 5. *配置本地活动轮播*  
 进入wordpress后台微慕的小程序插件，输入要在小程序中轮播显示的本地活动文章ID。用于轮播显示在详情页底部和我的信息页入口。  
 ![viewimg/14.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/14.jpg) 
 6. *天气和地址配置*  
 使用[高德SDK](https://lbs.amap.com/api/wx/summary/)，前往并注册账号获取key，key和city需要配置成你的信息。需要配置的文件pages/mine/mine.js,pages/amap/amap.js。SDK在Github的传送门：[https://github.com/amap-demo/wx-regeo-poiaround-weather](https://github.com/amap-demo/wx-regeo-poiaround-weather)。  
 ![viewimg/15.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/15.jpg)

 - **微信小程序2.0.0-书巢小程序模板安装调试**  
 1. 将文件包插件目录下的两个插件文件安装或覆盖在wordpress的插件目录中（/wp-content/plugins/）；
 2. 进入wordpress后台管理，开启pods和微慕小程序插件；
 3. 在pods插件中启用Migrate: Packages组件;
 4. 在Migrate: Packages组件中导入文件包data目录下的pods文件;
 5. 导入后，左侧菜单栏会出现【书目】【帮助】【活动】三个自定义文章以及二级菜单分类和设置等；
 6. 接下来导入书目模拟数据：进入菜单工具-可用工具中启用【导入】, 然后将文件包中的书目模拟数据导入；
 7. 将小程序代码直接在小程序开发工具中导入。
 8. 在wordpress后台配置微慕小程序的相关key
 9. 在小程序代码里的project.config.json和config.js进行配置相关key
 10. 在wordpress的书目设置和全局设置中进行相关文字设置，包括首页标题等
 11. 完成后，进行测试即可。

 任何问题进QQ群反馈：~~928993356~~  
 **20200331补充：**  
 不知为何mac笔记本搜索不到群。先通过加我个人QQ号和个人微信号拉进群。  
 - QQ号：**2307944871** (小鱼哥)
 - 微信号：**gamch2** (小鱼哥)

# 感谢
- 感谢[https://www.hellobeebee.com/](https://www.hellobeebee.com/) 提供空间。升级为书巢小程序官方网站。  
- 感谢[https://www.appbeebee.com/](https://www.appbeebee.com/) 提供主题。V2.0.0无需安装此主题。  
- 感谢[https://shops.minapper.com/](https://shops.minapper.com/) 提供小程序代码  
- 如果你觉得这个模板不错，请打赏馆长。  
![viewimg/16.jpg](https://raw.githubusercontent.com/shiheme/wx-booker/master/viewimg/16.jpg) 

# 相关资源  
- *github*  
[https://github.com/shiheme/wx-booker](https://github.com/shiheme/wx-booker)
- *gitee镜像*  
[https://gitee.com/week7day/wx-booker](https://gitee.com/week7day/wx-booker)

