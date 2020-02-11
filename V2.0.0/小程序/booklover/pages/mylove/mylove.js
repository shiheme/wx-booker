//mylove.js
var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();

Component({
  behaviors: [pageCommonBehavior],
  properties: {
    // 接受页面参数
    openid: String,
  },
  data: {
    postsList: {},
    openid: '',
    cnt_tp: '',
    isActive: true,
    isGoback: true,
  },
  attached: function() {
    var self = this;
    self.setData({
      cnt_tp: wx.getStorageSync('cnt_tp')
    });
    this.fetchPostsData(self.data);
    console.log(this.data.cnt_tp)
  },
  methods: {
    onLoad: function(options) {},
    //获取文章列表数据
    fetchPostsData: function(data) {
      var self = this;
      var count = 0;
      var openid = this.data.openid;
      self.setData({
        postsList: []
      });
      console.log(self.data);
      wx.showLoading({
        title: '正在加载',
        mask: true
      });
      var getPostsRequest = wxRequest.getRequest(Api.getMyLikeUrl(data));
      getPostsRequest.then(response => {
          if (response.statusCode === 200) {
            self.setData({
              floatDisplay: "block",
              postsList: self.data.postsList.concat(response.data.data.map(function(item) {
                count++;
                return item;
              })),
            });
            if (count == 0) {
              self.setData({
                shownodata: true
              });
            }
            setTimeout(function() {
              wx.hideLoading();
            }, 1500);
          } else {
            console.log(response);
            self.setData({
              showerror: 'block'
            });
          }
        })
        .catch(function() {
          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });
        })
        .finally(function() {
          wx.hideLoading();
        })
    },
    // 跳转至查看文章详情
    redictDetail: function(e) {
      // console.log('查看文章');
      var id = e.currentTarget.id,
        url = '../detail/detail?id=' + id;
      wx.navigateTo({
        url: url
      })
    },
  }
})