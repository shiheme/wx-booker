var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
var Auth = require('../../utils/auth.js');
import config from '../../utils/config.js'
var app = getApp();

var webSiteName = config.getWebsiteName;
var domain = config.getDomain
Component({
  behaviors: [pageCommonBehavior],
  properties: {},
  data: {
    pageData: {},
    pagesList: {},
    wxParseData: [],
    praiseList: [],
    openid: "",
    system: "",
    webSiteName: webSiteName,
    domain: domain,
    isActive: true,
    isGoback: true,
  },
  attached: function() {
    var self = this;
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);
    this.fetchData();
  },
  methods: {
    onLoad: function(options) {},
    onPullDownRefresh: function() {
      var self = this;
      self.setData({
        floatDisplay: 'none',
        pageData: {},
        wxParseData: {},
      });
      this.fetchData();
      //消除下刷新出现空白矩形的问题。
      wx.stopPullDownRefresh()
    },
    onShareAppMessage: function() {
      return {
        title: '关于“' + config.getWebsiteName + '”官方小程序',
        path: 'pages/about/about',
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    fetchData: function() {
      var self = this;
      var getPageRequest = wxRequest.getRequest(Api.getAboutPage());
      getPageRequest.then(response => {
          console.log(response);
          WxParse.wxParse('article', 'html', response.data.post_content, self, 5);
          self.setData({
            pageData: response.data,
          });
          self.setData({
            floatDisplay: 'block'
          });
        })
    }
  },
})