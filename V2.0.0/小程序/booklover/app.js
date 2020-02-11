//app.js
App({
  onLaunch: function() {
    this.getSkin();
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 小程序主动更新
    this.updateManager();

    // 获取系统信息
    wx.getSystemInfo({
      success: (t) => {
        this.globalData.navBarHeight = t.statusBarHeight,
          this.globalData.customBarHeight = t.platform == 'android' ? t.statusBarHeight + 50 : t.statusBarHeight + 45,
          this.globalData.titleBarHeight = t.platform == 'android' ? 50 : 45;

        var version = t.SDKVersion;
        version = version.replace(/\./g, "")
        if (parseInt(version) > 290) {// 小于230的版本 基础库
          this.globalData.wrapperhide = 'wrapperhide'
        }
      }
    })
  },
  //皮肤
  getSkin: function () {
    var that = this
    try {
      if (wx.getStorageSync('pageStyle')) {
        var value = wx.getStorageSync('pageStyle')
      } else {
        var value = that.globalData.pageStyle
      }
      if (value) {
        // Do something with return value
        that.globalData.pageStyle = value
        if (that.globalData.pageStyle == 'whitebg') {
          that.globalData.skinSwitch = false
          that.globalData.pageBackground = 'rgba(255,255,255,1)'
          that.setSkinNormalTitle()
          that.setNormalTabBar();
        } else {
          that.globalData.skinSwitch = true
          that.globalData.pageBackground = 'rgba(20,20,20,1)'
          that.setSkinBlackTitle()
          that.setBlackTabBar()
        }
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function() {
          wx.getUserInfo({
            success: function(res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  /*小程序主动更新*/
  updateManager() {
    if (!wx.canIUse('getUpdateManager')) {
      return false;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {});
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '有新版本',
        content: '新版本已经准备好，即将重启',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    });
  },
  //获取用户地理位置权限
  getPermission: function(obj) {
    wx.chooseLocation({
      success: function(res) {
        obj.setData({
          addr: res.address //调用成功直接设置地址
        })
      },
      fail: function() {
        wx.getSetting({
          success: function(res) {
            var statu = res.authSetting;
            if (!statu['scope.userLocation']) {
              wx.showModal({
                title: '是否授权当前位置',
                content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                success: function(tip) {
                  if (tip.confirm) {
                    wx.openSetting({
                      success: function(data) {
                        if (data.authSetting["scope.userLocation"] === true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 1000
                          })
                          //授权成功之后，再调用chooseLocation选择地方
                          wx.chooseLocation({
                            success: function(res) {
                              obj.setData({
                                addr: res.address
                              })
                            },
                          })
                        } else {
                          wx.showToast({
                            title: '授权失败',
                            icon: 'success',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }
                }
              })
            }
          },
          fail: function(res) {
            wx.showToast({
              title: '调用授权窗口失败',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  },
  //设置tabBar -- 默认模式
  setNormalTabBar() {
    wx.setTabBarItem({
      index: 0,
      iconPath: "images/whitebg/btmnav-01.png",
      selectedIconPath: "images/whitebg/btmnav-02-on.png",
    })
    wx.setTabBarItem({
      index: 1,
      iconPath: "images/whitebg/btmnav-02.png",
      selectedIconPath: "images/whitebg/btmnav-02-on.png",
    })
    wx.setTabBarItem({
      index: 2,
      iconPath: "images/whitebg/btmnav-04.png",
      selectedIconPath: "images/whitebg/btmnav-04-on.png",
    })
    wx.setTabBarStyle({
      color: '#333333',
      selectedColor: '#000000',
      backgroundColor: '#ffffff',
      borderStyle: 'white'
    })
  },
  //设置tabBar -- 黑色模式
  setBlackTabBar() {
    wx.setTabBarItem({
      index: 0,
      iconPath: "images/blackbg/btmnav-01.png",
      selectedIconPath: "images/blackbg/btmnav-02-on.png",
    })
    wx.setTabBarItem({
      index: 1,
      iconPath: "images/blackbg/btmnav-02.png",
      selectedIconPath: "images/blackbg/btmnav-02-on.png",
    })
    wx.setTabBarItem({
      index: 2,
      iconPath: "images/blackbg/btmnav-04.png",
      selectedIconPath: "images/blackbg/btmnav-04-on.png",
    })
    wx.setTabBarStyle({
      color: '#f5f5f5',
      selectedColor: '#ffffff',
      backgroundColor: '#141414',
      borderStyle: 'black'
    })
  },
  //导航栏标题背景
  setNavBarBg: function() {
    var self = this
    if (self.globalData.pageStyle == "whitebg") {
      self.globalData.pageBackground = '#ffffff'
      self.setSkinNormalTitle()
    } else {
      self.globalData.pageBackground = '#141414'
      self.setSkinBlackTitle()
    }
  },
  setSkinBlackTitle: function() {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#141414',
    })
    wx.setBackgroundTextStyle({
      textStyle: 'light'
    })
    wx.setBackgroundColor({
      backgroundColor: '#141414',
      backgroundColorTop: '#141414',
      backgroundColorBottom: '#141414',
    })
  },
  setSkinNormalTitle: function() {
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#ffffff',
    })
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })
    wx.setBackgroundColor({
      backgroundColor: '#ffffff',
      backgroundColorTop: '#ffffff',
      backgroundColorBottom: '#ffffff',
    })
  },
  globalData: {
    userInfo: null,
    openid: '',
    isGetUserInfo: false,
    isGetOpenid: false,
    navBarHeight: '',
    customBarHeight: '',
    titleBarHeight: '',
    pageBackground: '',
    pageStyle: 'blackbg', //默认主题风格，whitebg白色风格，blackbg深灰色风格
    skinSwitch: '',
    cnt_tp: '',
    wrapperhide:'',
  },

})