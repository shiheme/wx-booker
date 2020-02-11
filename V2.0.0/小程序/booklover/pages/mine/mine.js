//index.js
//获取应用实例
var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxRequest = require('../../utils/wxRequest.js');
import config from '../../utils/config.js';
const app = getApp()
const amap = require('../../utils/amap-wx.js'); //引入高德地图
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    // 接受页面参数
  },
  data: {
    key: '', //高德地图SDK申请的KEY
    myAmapFun: null,
    weather: {}, //获取实时天气数据
    bggradient: "", //定义天气的默认背景色
    showweather: false,
    city: '',
    isweatherbg: "wewhitebg", //定义天气页的样式
    isJianshi: false, //判断当前位置是否在建始县
    subscription: "",
    userInfo: {},
    userLevel: {},
    openid: '',
    isLoginPopup: false,
    current: 0,
    isloading: false,
  },
  attached: function() {
  },
  methods: {
    onLoad: function (options) { 
      var self = this;
      
        var data = {}
      
      var getCustomsetBycnttpRequest = wxRequest.getRequest(Api.getCustomsetBycnttp(data));
      getCustomsetBycnttpRequest.then(res => {
        self.setData({
          cmset: res.data,
          key: res.data.amap_key,
          city: res.data.amap_city,
          floatDisplay: "block",
          amapPlugin: new amap.AMapWX({
            key: res.data.amap_key
          })
        }, () => {
          if (res.data.open_mine_weather == 1) {
            this.getWeatherlive();
          }
        });
        Auth.setUserInfoData(self);
        Auth.checkLogin(self);

      });
      if (this.data.pageStyle == "blackbg") {
        this.setData({
          bggradient2: "rgba(20,20,20,0) 90%",
        });
      } else {
        this.setData({
          bggradient2: "rgba(255,255,255,0) 90%",
        });
      }
    },
    onPullDownRefresh: function() {
      var self = this;
      this.setData({
        showweather: false,
        showerror: "none"
      });
      if (wx.getStorageSync('cnt_tp') != '') {
        var data = {
          cnt_tp: wx.getStorageSync('cnt_tp')
        }
      } else {
        var data = {}
      }
      var getCustomsetBycnttpRequest = wxRequest.getRequest(Api.getCustomsetBycnttp(data));
      getCustomsetBycnttpRequest.then(res => {
        self.setData({
          cmset: res.data,
          key: res.data.amap_key,
          city: res.data.amap_city,
          floatDisplay: "block",
          amapPlugin: new amap.AMapWX({
            key: res.data.amap_key
          })
        }, () => {
          if (res.data.open_mine_weather == 1) {
            this.getWeatherlive();
          }
        });
        Auth.setUserInfoData(self);
        Auth.checkLogin(self);

      });
      if (this.data.pageStyle == "blackbg") {
        this.setData({
          bggradient2: "rgba(20,20,20,0) 90%",
        });
      } else {
        this.setData({
          bggradient2: "rgba(255,255,255,0) 90%",
        });
      }
    },
    onReady: function() {},
    onShow: function(options) {
      var self = this;
      this.setData({
        amapPlugin: new amap.AMapWX({
          key: this.data.key
        })
      }, () => {
        this.getWeatherlive();
      });
      //self.fetchTopFivePosts();
      Auth.setUserInfoData(self);
      Auth.checkLogin(self);
      //获取缓存使用情况
      wx.getStorageInfo({
        success(res) {
          var currentSize = res.currentSize;
          if (currentSize < 1024) {
            self.setData({
              currentSize: currentSize + 'Kb'
            });
          } else {
            currentSize = currentSize / 1024;
            currentSize = String(currentSize).replace(/^(.*\..{2}).*$/, "$1");
            currentSize = parseFloat(currentSize);
            self.setData({
              currentSize: currentSize + 'Mb'
            });
          }
          console.log(res.limitSize);
        }
      })
    },
    refresh: function(e) {
      var self = this;
      if (self.data.openid) {
        var args = {};
        var userInfo = e.detail.userInfo;
        args.openid = self.data.openid;
        args.avatarUrl = userInfo.avatarUrl;
        args.nickname = userInfo.nickName;
        this.setData({
          isloading: true
        })
        var url = Api.getUpdateUserInfo();
        var postUpdateUserInfoRequest = wxRequest.postRequest(url, args);
        postUpdateUserInfoRequest.then(res => {
          if (res.data.status == '200') {
            var userLevel = res.data.userLevel;
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('userLevel', userLevel);
            self.setData({
              userInfo: userInfo
            });
            self.setData({
              userLevel: userLevel
            });
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 900,
              success: function() {}
            });
            this.setData({
              isloading: false
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 900,
              success: function() {}
            });
            this.setData({
              isloading: false
            })
          }
        });
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    exit: function(e) {
      Auth.logout(this);
      wx.reLaunch({
        url: '../mine/mine'
      })
    },
    clear: function(e) {
      wx.clearStorageSync();
      wx.showToast({
        title: '清除完毕',
      })
      this.onLoad();
    },
    //获取天气数据
    getWeatherlive: function() {
      if (this.data.city) {
        this.data.amapPlugin.getWeather({
          city: this.data.city,
          type: 'live',
          success: (data) => {
            //成功回调
            console.log(data)
            if (data.liveData.weather == '雨雪天气' || data.liveData.weather == '雨夹雪' || data.liveData.weather == '阵雨夹雪' || data.liveData.weather == '冻雨') {
              this.setData({
                weathericon: "yujiaxue",
                bggradient: "#7e8285 0%," + this.data.bggradient2,
                tiptext: "我陪你走过" + data.liveData.city + "的晴天雨天，即使是这雪里带着雨，我也要守护你的冷热酸甜",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '雪' || data.liveData.weather == '阵雪' || data.liveData.weather == '小雪' || data.liveData.weather == '中雪' || data.liveData.weather == '大雪' || data.liveData.weather == '暴雪' || data.liveData.weather == '小雪-中雪' || data.liveData.weather == '中雪-大雪' || data.liveData.weather == '大雪-暴雪') {
              this.setData({
                weathericon: "xuehua",
                bggradient: "#8cb8ec 0%," + this.data.bggradient2,
                tiptext: "一下雪," + data.liveData.city + "就成了童话世界。煮一壶好水，泡一杯好茶，尽享这童话世界中的珍贵时光",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '浮尘' || data.liveData.weather == '扬沙' || data.liveData.weather == '雾' || data.liveData.weather == '浓雾' || data.liveData.weather == '强浓雾' || data.liveData.weather == '轻雾' || data.liveData.weather == '大雾' || data.liveData.weather == '特强浓雾' || data.liveData.weather == '霾' || data.liveData.weather == '中度霾' || data.liveData.weather == '重度霾' || data.liveData.weather == '严重霾') {
              this.setData({
                weathericon: "wu",
                bggradient: "#7e8285 0%," + this.data.bggradient2,
                tiptext: "只有在" + data.liveData.city + "这样的雾霾天，才明白，靠近，竟是如此惊心动魄的一件事",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '沙尘暴' || data.liveData.weather == '强沙尘暴' || data.liveData.weather == '龙卷风') {
              this.setData({
                weathericon: "fengbao",
                bggradient: "#c6c6c7 0%," + this.data.bggradient2,
                tiptext: "我们一起经历" + data.liveData.city + "的沙尘暴，也许这就叫黄天不负有情人",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '晴' || data.liveData.weather == '少云') {
              this.setData({
                weathericon: "qing",
                bggradient: "#2576d5 0%," + this.data.bggradient2,
                tiptext: data.liveData.city + "的好天气，就犹如你一般，晴朗加无云，偶尔清风徐来，你便在我心间荡漾开来",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '雷阵雨' || data.liveData.weather == '雷阵雨并伴有冰雹' || data.liveData.weather == '强雷阵雨' || data.liveData.weather == '极端降雨') {
              this.setData({
                weathericon: "shandian",
                bggradient: "#08090a 0%," + this.data.bggradient2,
                tiptext: data.liveData.city + data.liveData.weather + "，这样的天气还是在家待着吧，泡杯咖啡看本书",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '阴' || data.liveData.weather == '烈风' || data.liveData.weather == '风暴' || data.liveData.weather == '狂爆风' || data.liveData.weather == '飓风' || data.liveData.weather == '热带风暴') {
              this.setData({
                weathericon: "yin",
                bggradient: "#242627 0%," + this.data.bggradient2,
                tiptext: "我是个俗气的人，不喜山水，也不饮烂醉，若你在，即使" + data.liveData.city + "今天的阴天也极美",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '雨' || data.liveData.weather == '阵雨' || data.liveData.weather == '小雨' || data.liveData.weather == '中雨' || data.liveData.weather == '大雨' || data.liveData.weather == '暴雨' || data.liveData.weather == '大暴雨' || data.liveData.weather == '特大暴雨' || data.liveData.weather == '强阵雨' || data.liveData.weather == '毛毛雨/细雨' || data.liveData.weather == '小雨-中雨' || data.liveData.weather == '中雨-大雨' || data.liveData.weather == '大雨-暴雨' || data.liveData.weather == '暴雨-大暴雨' || data.liveData.weather == '大暴雨-特大暴雨') {
              this.setData({
                weathericon: "dayu",
                bggradient: "#31363a 0%," + this.data.bggradient2,
                tiptext: "最美的不是" + data.liveData.city + "的下雨天,是和你一起躲过雨的屋檐",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '多云' || data.liveData.weather == '强风/劲风' || data.liveData.weather == '疾风' || data.liveData.weather == '大风') {
              this.setData({
                weathericon: "cloudy",
                bggradient: "#d9d9d9 0%," + this.data.bggradient2,
                tiptext: "我见过" + data.liveData.city + "的晴空万里却不及你眉眼，我听过清风徐徐却不及你呢喃，我闻过春日花香却不及你芬芳",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else if (data.liveData.weather == '晴间多云' || data.liveData.weather == '有风' || data.liveData.weather == '平静' || data.liveData.weather == '微风' || data.liveData.weather == '和风' || data.liveData.weather == '清风') {
              this.setData({
                weathericon: "cloud",
                bggradient: "#77aadb 0%," + this.data.bggradient2,
                tiptext: "他们说，" + data.liveData.city + "的清风是否妩媚还须看清风是谁，可我摇头，我见众生皆草木唯你是清风",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            } else {
              this.setData({
                weathericon: "none",
                bggradient: "#eeeeee 0%," + this.data.bggradient2,
                tiptext: "一个下午，一杯咖啡，一本书",
                weather: data,
                isweatherbg: "wewhitebg",
                showweather: true
              });
            }
            if (data.liveData.adcode == '422822') {
              this.setData({
                isJianshi: true
              });
            }
            wx.hideLoading();
            wx.stopPullDownRefresh();
          },
          fail: function(info) {
            var self = this;
            //失败回调
            // wx.showModal({
            //   title: '位置未授权成功',
            //   content: '如需正常使用天气需要开启位置功能。是否在授权管理中开启“位置授权”?',
            //   showCancel: true,
            //   cancelColor: '#296fd0',
            //   confirmColor: '#296fd0',
            //   confirmText: '设置权限',
            //   success: function (res) {
            //     if (res.confirm) {
            //       console.log('用户点击确定')
            //       wx.openSetting({
            //         success: function success(res) {
            //           console.log('打开设置', res.authSetting);
            //           var scopeUserLocation = res.authSetting["scope.userLocation"];
            //           if (scopeUserLocation) {
            //             wx.showToast({
            //               title: '授权成功',
            //               icon: 'success',
            //               duration: 1000
            //             });
            //             wx.startPullDownRefresh();
            //           }
            //         }
            //       });
            //     }
            //   }
            // });
            console.log(info)
          }
        })
      }
    },
    // 跳转至我喜欢的
    redictMylove: function() {
      var self = this;
      if (self.data.openid) {
        var url = '../mylove/mylove?openid=' + this.data.openid;
        wx.navigateTo({
          url: url
        })
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    bindlogin: function() {
      var self = this;
      Auth.checkSession(self, 'isLoginNow');
    },
    agreeGetUser: function(e) {
      let self = this;
      Auth.checkAgreeGetUser(e, app, self, '0');;
    },
    // 跳转至活动
    redictAct: function() {
      var self = this;
      var url = '../act/act';
      wx.navigateTo({
        url: url
      })
    },
    redictAbout: function () {
      var self = this;
      if (self.data.openid) {
        var url = '../about/about';
        wx.navigateTo({
          url: url
        })
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    switchChange: function(e) {
      var self = this;
      //开启
      if (e.detail.value == true) {
        app.globalData.pageStyle = "blackbg"
        app.setSkinBlackTitle(); //设置标题栏
        app.globalData.skinSwitch = true
        app.setBlackTabBar(); //设置tabBar
      } else {
        app.globalData.pageStyle = 'whitebg'
        app.setSkinNormalTitle()
        app.globalData.skinSwitch = false
        app.setNormalTabBar();
      }
      self.setData({
        pageStyle: app.globalData.pageStyle
      })
      //保存到本地
      wx.setStorage({
        key: "pageStyle",
        data: app.globalData.pageStyle
      })
      console.log(app.globalData.pageStyle)
      console.log('changeStyle' + wx.getStorageSync('pageStyle'))
      wx.setStorage({
        key: "skinSwitch",
        data: app.globalData.skinSwitch
      })
    },
  }
})