var Api = require('../utils/api.js');
var wxRequest = require('../utils/wxRequest.js')
import config from '../utils/config.js'
var app = getApp();
module.exports = Behavior({
  behaviors: [
    //引入其它的 behavior
  ],
  properties: {
    isshare: Number,
  },
  data: {
    // 公共数据定义
    showerror: "none",
    shownodata: false,
    floatDisplay: "none",
    isshare: "0",
    isTouch: false,
    cnt_tp: '', //定义文章类型
    isActive: false, //定义头部导航是否显示背景
    isGoback: false, //定义头部导航是否存在返回上一页/返回首页
    isSearch: false, //定义头部导航是否显示索索
    isScancode: false, //定义头部导航是否显示扫码
    istoHelp: false, //定义头部导航是否显示帮助
    isTheme: false,
    pageBackground: app.globalData.pageBackground,
    pageStyle: app.globalData.pageStyle,
    wrapperhide: app.globalData.wrapperhide,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight
  },
  attached: function() {
    // 页面创建时执行
    var self = this;
    
    app.setNavBarBg(); //设置标题栏背景色
    self.setData({
      pageBackground: app.globalData.pageBackground,
      pageStyle: app.globalData.pageStyle,
      skinSwitch: app.globalData.skinSwitch
    })

    if (this.data.isshare == 1) {
      //console.log('是分享进入');
      self.setData({
        'isshare': this.data.isshare
      })
    }
  },
  pageLifetimes: {
    show: function() {
      var self = this;
      app.setNavBarBg(); //设置标题栏背景色
      self.setData({
        pageBackground: app.globalData.pageBackground,
        pageStyle: app.globalData.pageStyle,
        skinSwitch: app.globalData.skinSwitch
      })
    },
    hide: function() {
      // 页面被隐藏
    },
    resize: function(size) {
      // 页面尺寸变化
    }
  },
  methods: {
    // 公共事件
    //给a标签添加跳转和复制链接事件
    wxParseTagATap: function(e) {
      var self = this;
      var href = e.currentTarget.dataset.src;
      //console.log(href);
      var domain = config.getDomain;
      //可以在这里进行一些路由处理
      if (href.indexOf(domain) == -1) {
        wx.setClipboardData({
          data: href,
          success: function(res) {
            wx.getClipboardData({
              success: function(res) {
                wx.showToast({
                  title: '链接已复制',
                  //icon: 'success',
                  duration: 2000
                })
              }
            })
          }
        })
      } else {
        var slug = util.GetUrlFileName(href, domain);
        if (slug == 'index') {
          wx.switchTab({
            url: '../index/index'
          })
        } else {
          var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
          getPostSlugRequest
            .then(res => {
              if (res.statusCode == 200) {
                if (res.data.length != 0) {
                  var postID = res.data[0].id;
                  var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
                  if (openLinkCount > 4) {
                    wx.redirectTo({
                      url: '../detail/detail?id=' + postID
                    })
                  } else {
                    wx.navigateTo({
                      url: '../detail/detail?id=' + postID
                    })
                    openLinkCount++;
                    wx.setStorageSync('openLinkCount', openLinkCount);
                  }
                } else {
                  var enterpriseMinapp = self.data.detail.enterpriseMinapp;
                  var url = '../webpage/webpage'
                  if (enterpriseMinapp == "1") {
                    url = '../webpage/webpage';
                    wx.navigateTo({
                      url: url + '?url=' + href
                    })
                  } else {
                    self.copyLink(href);
                  }
                }
              }
            }).catch(res => {
              //console.log(response.data.message);
            })
        }
      }
    },
    gotowebpage: function() {
      var self = this;
      var enterpriseMinapp = self.data.detail.enterpriseMinapp;
      var url = '';
      if (enterpriseMinapp == "1") {
        var url = '../webpage/webpage';
        wx.navigateTo({
          url: url + '?url=' + self.data.link
        })
      } else {
        self.copyLink(self.data.link);
      }
    },
    copyLink: function(url) {
      wx.setClipboardData({
        data: url,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              wx.showToast({
                title: '链接已复制',
                duration: 2000
              })
            }
          })
        }
      })
    },
    //赞赏功能
    praise: function() {
      var self = this;
      if (self.data.cmset.img_dashang != false) {
        var src = self.data.cmset.img_dashang;
      } else {
        var src = ""
      }
      wx.previewImage({
        urls: [src],
      });
    },
    touchmove: function(e) {
      this.setData({
        isTrans: true
      })
    },
    touchend: function(e) {
      this.setData({
        isTrans: false
      })
    },
    touchcancel: function(e) {
      this.setData({
        isTrans: false
      })
    },
    closeLoginPopup() {
      this.setData({
        isLoginPopup: false
      });
    },
    openLoginPopup() {
      this.setData({
        isLoginPopup: true
      });
    },
    confirm: function() {
      this.setData({
        'dialog.hidden': true,
        'dialog.title': '',
        'dialog.content': ''
      })
    },
    toFloatadsurl: function(e) {
      var url = e.target.dataset.url;
      wx.navigateTo({
        url: url
      })
    },
    popSingleimg: function(e) {
      var src = e.target.dataset.src;
      wx.previewImage({
        urls: [src],
      });
    },
    fileOpen: function(e) {
      var url = e.currentTarget.dataset.fileopen;
      wx.downloadFile({
        url: url,
        success: function(res) {
          var Path = res.tempFilePath //返回的文件临时地址
          wx.openDocument({
            filePath: Path,
            success: function(res) {
              console.log('打开成功');
            }
          })
        },
        fail: function(res) {
        }
      })
    },
    detached: function() {
      // 页面销毁时执行
      console.info('Page unloaded!')
    },
  }

})