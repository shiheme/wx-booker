var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
//var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'

var app = getApp();

Component({
  behaviors: [pageCommonBehavior],
  properties: {
    auth: String,
    openid: String,
    level: String,
    leveltxt: String,
    booktit: String,
    bookimg: String,
    bookisbn: String,
    bookcost: String,
  },
  data: {
    isActive: true,
    isGoback: true,
  },
  attached: function() {
    
  },
  methods: {
    onLoad: function(options) {
      var self = this;
      this.setData({

      })
      if (self.data.level == '贡献者') {
        this.setData({
          level: self.data.level,
          leveltxt: '*享有免费免押借阅特权',
          bookcost: '0.00'
        })
      }
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
        console.log(this.data.floatads_location)
        self.setData({
          cmset: res.data
        });
      });
    },
    addhaoyou: function() {
      var self = this;
      var src = this.data.cmset.img_conaut;
      wx.previewImage({
        urls: [src],
      });
    },
    copytxt: function() {
      var self = this;
      var booktit = this.data.booktit;
      var bookisbn = this.data.bookisbn;
      var auth = this.data.auth;
      var level = this.data.level;
      var leveltxt = this.data.leveltxt;
      var openid = this.data.openid;
      var bookcost = this.data.bookcost;

      wx.setClipboardData({
        data: '预借信息\n-----------\n\r书名：《' + booktit + '》\nISBN：' + bookisbn + '\n\r借书人：' + auth + '\n用户等级：' + level + leveltxt + '\n借书ID：' + openid + '\n\r借阅费：' + bookcost + '\n借阅时间：1个月',
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
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
  }

})