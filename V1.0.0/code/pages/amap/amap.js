
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxRequest = require('../../utils/wxRequest.js');
import config from '../../utils/config.js';
const app = getApp()

const amapFile = require('../../utils/amap-wx.js'); //引入高德地图

Page({
  data: {
    key: '', //重要！高德地图SDK申请的KEY
    myAmapFun: null,
    
    markers: [],
    textData:{},
    actit: '',
    actarea: '',
    actel: '',
    latitude: '',
    longitude: '',
    location:'',

    showerror: "none",
    floatDisplay: "none",

    isActive: false, //定义头部导航是否显示背景
    isGoback: true, //定义头部导航是否存在返回上一页/返回首页
    isSearch: false, //定义头部导航是否显示索索
    isScancode: false, //定义头部导航是否显示扫码
    isshare: "0",

    pageStyle: app.globalData.pageStyle,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight
  },
  onLoad: function (options) {
    var self = this;

    wx.getSystemInfo({
      success: function (t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
          //platform: t.platform
        });
      }
    })

    if (options.actit) {
      self.setData({
        actit: options.actit
      })
    }
    if (options.actarea) {
      self.setData({
        actarea: options.actarea
      })
    }
    if (options.actel) {
      self.setData({
        actel: options.actel
      })
    }
    if (options.location) {
      self.setData({
        latitude: options.location
      })
    }

    var myAmapFun = new amapFile.AMapWX({ key: self.data.key });
    myAmapFun.getRegeo({
      iconPath: "../../images/on/marker.png",
      //https://www.hellobeebee.com/wp-content/uploads/2019/06/marker.png
      iconWidth: 45,
      iconHeight: 45,
      location: options.location,
      success: function (data) {
        var marker = [{
          id: data[0].id,
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          iconPath: data[0].iconPath,
          width: data[0].width,
          height: data[0].height
        }]
        self.setData({
          markers: marker
        });
        self.setData({
          latitude: data[0].latitude
        });
        self.setData({
          longitude: data[0].longitude
        });
        self.setData({
          textData: {
            name: data[0].name,
            desc: data[0].desc
          }
        })
      },
      fail: function (info) {
        // wx.showModal({title:info.errMsg})
      }
    })

    
  },
  getAmap: function () {
    this.data.amapPlugin.getRegeo({
      iconPath: "../../images/on/marker.svg",
      iconWidth: 50,
      iconHeight: 50,
      location: this.data.location,
      success: (data) => {
        console.log(data)
        var marker = [{
          id: data[0].id,
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          iconPath: data[0].iconPath,
          width: data[0].width,
          height: data[0].height
        }]
        this.setData({
          markers: marker
        });
        this.setData({
          latitude: data[0].latitude
        });
        this.setData({
          longitude: data[0].longitude
        });
        this.setData({
          textData: {
            name: data[0].name,
            desc: data[0].desc
          }
        })
      },
      fail: function (info) {
        // wx.showModal({title:info.errMsg})
      }
    })
  },
})