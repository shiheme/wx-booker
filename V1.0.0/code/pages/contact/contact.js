var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
//var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'

var app = getApp();

Page({
  data: {

    auth:'',
    openid:'',
    level:'',
    leveltxt: '',
    booktit:'',
    bookimg: '',
    bookisbn:'',
    bookcost:'',

    pagetitle: '',
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
  reload: function (e) {
    var self = this;

    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
        });
      }
    })

    if (options.auth) {
      this.setData({
        'auth': options.auth
      })
    }
    if (options.openid) {
      this.setData({
        'openid': options.openid
      })
    }
    if (options.level == '贡献者') {
      this.setData({
        'level': options.level,
        'leveltxt': '*享有免费免押借阅特权'
      })
    } else {
      this.setData({
        'level': options.level
      })
    }
    if (options.booktit) {
      this.setData({
        'booktit': options.booktit
      })
    }
    if (options.bookimg) {
      this.setData({
        'bookimg': options.bookimg
      })
    }
    if (options.bookisbn) {
      this.setData({
        'bookisbn': options.bookisbn
      })
    }
    if (options.bookcost && options.level == '贡献者') {
      this.setData({
        'bookcost': '0.00'
      })
    } else if (options.bookcost) {
      if (options.bookcost <= 9) {
        this.setData({
          'bookcost': '0.50'
        })
      } else if (options.bookcost <= 9) {
        this.setData({
          'bookcost': '1.00'
        })
      }
      else if (options.bookcost > 9 && options.bookcost <= 20) {
        this.setData({
          'bookcost': '1.00'
        })
      }
      else if (options.bookcost > 20 && options.bookcost <= 40) {
        this.setData({
          'bookcost': '2.00'
        })
      }
      else if (options.bookcost > 40 && options.bookcost <= 60) {
        this.setData({
          'bookcost': '3.00'
        })
      } else if (options.bookcost > 60 && options.bookcost <= 80) {
        this.setData({
          'bookcost': '4.00'
        })
      } else if (options.bookcost > 80 && options.bookcost <= 100) {
        this.setData({
          'bookcost': '5.00'
        })
      } else if (options.bookcost > 100) {
        this.setData({
          'bookcost': '6.00'
        })
      }
    }
    
  },
  onLoad: function (options) {
    var self = this;

    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
        });
      }
    })

    if (options.auth) {
      this.setData({
        'auth': options.auth
      })
    }
    if (options.openid) {
      this.setData({
        'openid': options.openid
      })
    }
    if (options.level == '贡献者') {
      this.setData({
        'level': options.level,
        'leveltxt':'*享有免费免押借阅特权'
      })
    } else {
      this.setData({
        'level': options.level
      })
    }
    if (options.booktit) {
      this.setData({
        'booktit': options.booktit
      })
    }
    if (options.bookimg) {
      this.setData({
        'bookimg': options.bookimg
      })
    }
    if (options.bookisbn) {
      this.setData({
        'bookisbn': options.bookisbn
      })
    }
    if (options.bookcost && options.level == '贡献者') {
      this.setData({
        'bookcost': '0.00'
      })
    } else if (options.bookcost) {
      if (options.bookcost <= 9) {
        this.setData({
          'bookcost': '0.50'
        })
      } else if (options.bookcost <= 9) {
        this.setData({
          'bookcost': '1.00'
        })
      }
      else if (options.bookcost > 9 && options.bookcost <= 20) {
        this.setData({
          'bookcost': '1.00'
        })
      }
      else if (options.bookcost > 20 && options.bookcost <= 40) {
        this.setData({
          'bookcost': '2.00'
        })
      }
      else if (options.bookcost > 40 && options.bookcost <= 60) {
        this.setData({
          'bookcost': '3.00'
        })
      } else if (options.bookcost > 60 && options.bookcost <= 80) {
        this.setData({
          'bookcost': '4.00'
        })
      } else if (options.bookcost > 80 && options.bookcost <= 100) {
        this.setData({
          'bookcost': '5.00'
        })
      } else if (options.bookcost > 100) {
        this.setData({
          'bookcost': '6.00'
        })
      }
    }
    
  },
  addhaoyou: function () {
    var self = this;
    var src = config.getAddHaoyou;
      wx.previewImage({
        urls: [src],
      });
  },
  copytxt: function () {
    var self = this;
    var booktit = this.data.booktit;
    var bookisbn = this.data.bookisbn;
    var auth = this.data.auth;
    var level = this.data.level;
    var leveltxt = this.data.leveltxt;
    var openid = this.data.openid;
    var bookcost = this.data.bookcost;

      wx.setClipboardData({
        data: '预借信息\n-----------\n\r书名：《' + booktit + '》\nISBN：' + bookisbn + '\n\r借书人：' + auth + '\n用户等级：' + level + leveltxt +'\n借书ID：' + openid + '\n\r借阅费：' + bookcost + '\n借阅时间：1个月',
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '内容已复制',
                icon: 'success',
                duration: 2000
              })
            }
          })
        }
      })
  },
  
})



