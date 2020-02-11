var pageCommonBehavior = require('../../utils/common');
import config from '../../utils/config.js';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
var app = getApp();
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    cnt_tp: String,
    id:Number
  },
  data: {
    title: '',
    detail: {},
    detailDate: '',
    wxParseData: {},
    postList: [],
    link: '',
    content: '',
    postID: null,
    display: 'none',
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
        self.setData({
          cmset: res.data,
          categories: res.data.faq_list_id
        });
        self.fetchDetailData(self.data.id, self.data.cnt_tp);
      });
    },
    onShareAppMessage: function(res) {
      console.log(res);
      return {
        title: '借还书FAQ',
        path: 'pages/faqdt/faqdt?id=' + this.data.detail.id + '&isshare=1',
        success: function(res) {},
        fail: function(res) {}
      }
    },
    //获取文章内容
    fetchDetailData: function(id, cnt_tp) {
      var self = this;
      var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id, cnt_tp));
      var res;
      getPostDetailRequest
        .then(response => {
          res = response;
          console.log(response);
          if (response.data.code && (response.data.data.status == "404")) {
            self.setData({
              showerror: 'block',
              display: 'none',
              errMessage: response.data.message
            });
            return false;
          }
          WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
          WxParse.wxParse('gallery', 'html', response.data.faq_gallery, self, 5);
          self.setData({
            detail: response.data,
            postID: id,
            link: response.data.link,
            detailDate: util.cutstr(response.data.date, 10, 1),
            display: 'block',
          });
          self.setData({
            detail: response.data,
            postID: id,
            link: response.data.link,
            detailDate: util.cutstr(response.data.date, 10, 1),
            display: 'block',
          });
          return response.data
        })
        .catch(function(error) {
          console.log('error: ' + error);
        })
    },
  }
})