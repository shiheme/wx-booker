//actdt.js
var pageCommonBehavior = require('../../utils/common');
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
var app = getApp();
let isFocusing = false
let rewardedVideoAd = null
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    // 接受页面参数
    cnt_tp: String,
    id: Number,
  },
  data: {
    title: '',
    detail: {},
    detailDate: '',
    wxParseData: {},
    display: 'none',
    showerror: 'none',
    postList: [],
    link: '',
    postID: null,
    videolook: false,
    fileopen: '',
    platform: '', //开发平台
    isActive: true,
    isGoback: true,
  },
  attached: function () {
    
  },
  methods: {
    onLoad: function (options) {
      var self = this;
      self.setData({
      });
      if (options.cnt_tp && options.cnt_tp != '') {
        var data = {
          cnt_tp: options.cnt_tp
        }
      } else if (wx.getStorageSync('cnt_tp') != '') {
        var data = {
          cnt_tp: wx.getStorageSync('cnt_tp')
        }
      } else {
        var data = {}
      }
      var getCustomsetBycnttpRequest = wxRequest.getRequest(Api.getCustomsetBycnttp(data));
      getCustomsetBycnttpRequest.then(res => {
        this.setData({
          cmset: res.data
        })
        wx.getSystemInfo({
          success: function (t) {
            self.setData({
              platform: t.platform
            });
          }
        })
        self.fetchDetailData(self.data.id, self.data.cnt_tp);
      });
    },
    onShareAppMessage: function (res) {
      console.log(res);
      return {
        title: '建始同城活动-' + this.data.detail.title.rendered + '',
        path: 'pages/actdt/actdt?id=' + this.data.detail.id + '&isshare=1',
        success: function (res) {
          // 转发成功
          console.log(res);
        },
        fail: function (res) {
          console.log(res);
          // 转发失败
        }
      }
    },
    //获取文章内容
    fetchDetailData: function (id, cnt_tp) {
      var self = this;
      var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id, cnt_tp));
      var res;
      var _displayLike = 'none';
      wx.showLoading({
        title: '正在加载',
        mask: true
      });
      getPostDetailRequest
        .then(response => {
          res = response;
          
          if (response.data.code && (response.data.data.status == "404")) {
            self.setData({
              showerror: 'block',
              display: 'none',
              errMessage: response.data.message
            });
            return false;
          }
          WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
          
          // WxParse.wxParse('gallery', 'html', response.data.act_gallery, self, 5);
          // if (response.data.act_fileopen[0]) {
          //   self.setData({
          //     fileopen: response.data.act_fileopen[0].guid,
          //   })
          // }
          console.log(res)
          var openAdLogs = wx.getStorageSync('openAdLogs') || [];
          var openAded = true;
          //var openAded = res.data.act_openvideoads[0] == '1' ? false : true;
          // if (openAdLogs.length > 19) {
          //   openAded = true;
          // } else if (openAdLogs.length > 0 && res.data.act_openvideoads[0] == '1') {
          //   for (var i = 0; i < openAdLogs.length; i++) {
          //     if (openAdLogs[i].id == res.data.id) {
          //       openAded = true;
          //       break;
          //     }
          //   }
          // }
          // if (res.data.act_openvideoads[0] == '1') {
          //   self.loadInterstitialAd(res.data.rewardedVideoAdId);
          // }
         
          self.setData({
            detail: response.data,
            postID: id,
            act_shopname: response.data.act_shopname,
            act_shoptel: response.data.act_shoptel,
            act_shopads: response.data.act_shopads,
            act_shoplocation: response.data.act_shoplocation,
            link: response.data.link,
            detailDate: util.cutstr(response.data.date, 10, 1),
            display: 'block',
            total_comments: response.data.total_comments,
            videolook: openAded ? true : false
          });
          return response.data
        })
        .catch(function (error) {
          //console.log('error: ' + error);
        })
        .finally(function () {
          wx.hideLoading();
        })
    },
    loadInterstitialAd: function (excitationAdId) {
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
              openAdLogs = openAdLogs.filter(function (log) {
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
    readMore: function () {
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
      var url = '../amap/amap?act_shoplocation=' + this.data.act_shoplocation + '&act_shopname=' + this.data.act_shopname + '&act_shopads=' + this.data.act_shopads + '&act_shoptel=' + this.data.act_shoptel;
      wx.navigateTo({
        url: url
      })
    },
  }
})