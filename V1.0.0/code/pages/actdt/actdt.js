import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')

//const Zan = require('../../vendor/ZanUI/index')
///const innerAudioContext = wx.createInnerAudioContext();
let ctx = wx.createCanvasContext('mycanvas');

var app = getApp();
let isFocusing = false


//var webSiteName = config.getWebsiteName;
var domain = config.getDomain

let rewardedVideoAd = null


Page({
  data: {
    title: '',
    detail: {},
    videolook: false,

    detailDate: '',
    wxParseData: {},
    display: 'none',
    showerror: 'none',

    actit:'',
    actarea:'',
    actel:'',
    location:'',

    postList: [],
    link: '',
    content: '',
    system: '',

    postID: null,
    // platform: '',

    isActive: true, //定义头部导航是否显示背景
    isGoback: true, //定义头部导航是否存在返回上一页/返回首页
    isSearch: false, //定义头部导航是否显示索索
    isScancode: false, //定义头部导航是否显示扫码
    istoHelp: false, //定义头部导航是否显示帮助
    isshare: "0",

    pageStyle: app.globalData.pageStyle,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight

  },
  reload: function(e) {
    var self = this;
    self.fetchDetailData(options.id);

    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
          //platform: t.platform
        });
      }
    })
  },
  onLoad: function(options) {
    console.log(options.scene);
    var self = this;
    self.fetchDetailData(options.id);

    if (options.isshare == 1) {
      console.log('是分享进入');
      this.setData({
        'isshare': '1'
      })
    }

    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
          //platform: t.platform
        });
      }
    })
  },
  onUnload: function() {
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
    if (rewardedVideoAd && rewardedVideoAd.destroy) {
      rewardedVideoAd.destroy()
    }
    //innerAudioContext.destroy()
    ctx = null;

  },
  onShareAppMessage: function(res) {
    console.log(res);
    return {
      title: '建始同城活动-' + this.data.detail.title.rendered + '',
      path: 'pages/actdt/actdt?id=' + this.data.detail.id + '&isshare=1',
      success: function(res) {
        // 转发成功
        console.log(res);
      },
      fail: function(res) {
        console.log(res);
        // 转发失败
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
              image: '../../images/link.png',
              duration: 2000
            })
          }
        })
      }
    })
  },
  //获取文章内容
  fetchDetailData: function(id) {
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    var res;
    var _displayLike = 'none';
    getPostDetailRequest
      .then(response => {
        res = response;

        console.log(response);
        if (response.data.code && (response.data.data.status == "404")) {
          self.setData({
            showerror: 'block',
            display: 'none',
            detailAdsuccess: true,
            errMessage: response.data.message
          });

          return false;

        }

        WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
        WxParse.wxParse('gallery', 'html', response.data.format_gallery, self, 5);

        self.setData({
          detail: response.data,
          postID: id,
          link: response.data.link,
          actit: response.data.format_quote_author,
          actel: response.data.custom_author,
          actarea: util.cutspit(response.data.format_quote_content, 0),
          location: util.cutspit(response.data.format_quote_content, 1),
          detailDate: util.cutstr(response.data.date, 10, 1),
          //wxParseData: WxParse('md',response.data.content.rendered)
          //wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5),
          display: 'block',
          postImageUrl: response.data.postImageUrl

        });
        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || [];
        // 过滤重复值
        if (logs.length > 0) {
          logs = logs.filter(function(log) {
            return log[0] !== id;
          });
        }
        // 如果超过指定数量
        if (logs.length > 19) {
          logs.pop(); //去除最后一个
        }
        logs.unshift([id, response.data.title.rendered]);
        wx.setStorageSync('readLogs', logs);
        //end 

        var openAdLogs = wx.getStorageSync('openAdLogs') || [];
        var openAded = res.data.excitationAd == '1' ? false : true;
        if (openAdLogs.length > 19) {
          openAded = true;
        } else if (openAdLogs.length > 0 && res.data.excitationAd == '1') {
          for (var i = 0; i < openAdLogs.length; i++) {
            if (openAdLogs[i].id == res.data.id) {
              openAded = true;
              break;
            }
          }
        }

        // if (res.data.excitationAd == '1') {
        //   self.loadInterstitialAd(res.data.rewardedVideoAdId);
        // }

        self.setData({
          detail: response.data,
          postID: id,
          link: response.data.link,
          detailDate: util.cutstr(response.data.date, 10, 1),
          display: 'block',
          postImageUrl: response.data.postImageUrl,
          videolook: openAded ? true : false

        });

        return response.data
      })
      .catch(function(error) {
        console.log('error: ' + error);
      })
  },
  //给a标签添加跳转和复制链接事件
  wxParseTagATap: function(e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    console.log(href);
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
                image: '../../images/blackbg/copyurl.svg',
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
            console.log(response.data.message);
          })
      }
    }
  },
  detailAdbinderror: function(e) {
    var self = this;
    if (e.errCode) {
      self.setData({
        detailAdsuccess: false
      })

    }
  },
  loadInterstitialAd: function(excitationAdId) {
    var self = this;
    if (wx.createRewardedVideoAd) {
      rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: excitationAdId
      })
      rewardedVideoAd.onLoad(() => {
        console.log('onLoad event emit')
      })
      rewardedVideoAd.onError((err) => {
        console.log(err);
        this.setData({
          videolook: true
        })
      })
      rewardedVideoAd.onClose((res) => {

        var id = self.data.detail.id;
        if (res && res.isEnded) {

          var nowDate = new Date();
          nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

          var openAdLogs = wx.getStorageSync('openAdLogs') || [];
          // 过滤重复值
          if (openAdLogs.length > 0) {
            openAdLogs = openAdLogs.filter(function(log) {
              return log["id"] !== id;
            });
          }
          // 如果超过指定数量不再记录
          if (openAdLogs.length < 21) {
            var log = {
              "id": id,
              "date": nowDate
            }
            openAdLogs.unshift(log);
            wx.setStorageSync('openAdLogs', openAdLogs);
            console.log(openAdLogs);

          }
          this.setData({
            videolook: true
          })
        } else {

          wx.showToast({
            title: "你中途关闭了视频",
            icon: "none",
            duration: 3000
          });


        }
      })
    }
  },
  //阅读更多
  readMore: function() {
    var self = this;

    var platform = self.data.platform
    if (platform == 'devtools') {

      wx.showToast({
        title: "开发工具无法显示激励视频",
        icon: "none",
        duration: 2000
      });

      self.setData({
        videolook: true
      })
    } else {

      rewardedVideoAd.show()
        .catch(() => {
          rewardedVideoAd.load()
            .then(() => rewardedVideoAd.show())
            .catch(err => {
              console.log('激励视频 广告显示失败');
              self.setData({
                videolook: true
              })
            })
        })
    }
  },
  // 跳转至地图
  redictAmap: function (e) {
    var url = '../amap/amap?location=' + this.data.location + '&actit=' + this.data.actit + '&actarea=' + this.data.actarea + '&actel=' + this.data.actel;
    wx.navigateTo({
      url: url
    })
  },
  
})