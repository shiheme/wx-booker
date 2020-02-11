var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var wxRequest = require('../../utils/wxRequest.js');
import config from '../../utils/config.js';
const app = getApp()

const amapFile = require('../../utils/amap-wx.js'); //引入高德地图

Component({
  behaviors: [pageCommonBehavior],
  properties: {
    act_shopname: String,
    act_shopads: String,
    act_shoptel: String,
    act_shoplocation: String,
  },
  data: {
    key: '', //高德地图SDK申请的KEY
    myAmapFun: null,
    markers: [],
    textData:{},
    isGoback: true,
  },
  attached: function () {
    var self = this;
    this.setData({
    })
    if (self.data.cnt_tp && self.data.cnt_tp != '') {
      var data = {
        cnt_tp: self.data.cnt_tp
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
      self.setData({
        cmset: res.data,
      });
      var myAmapFun = new amapFile.AMapWX({ key: res.data.amap_key });
      myAmapFun.getRegeo({
        iconPath: "../../images/on/marker.png",
        iconWidth: 45,
        iconHeight: 45,
        location: self.data.act_shoplocation,
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
            latitude: data[0].latitude,
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
    });
  }
})