//card.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();

Page({
  data: {
    postsList: {},
    openid: '',

    showerror: "none",
    shownodata: false,
    floatDisplay: "none",

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
    if (options.openid) {
      this.setData({
        'openid': options.openid
      })
      this.fetchPostsData(self.data)
    }
  },
  onLoad: function (options) {
    var self = this;
    if (options.openid) {
      this.setData({
        'openid': options.openid
      })
      this.fetchPostsData(self.data);
    }
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
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

    var getPostsRequest = wxRequest.getRequest(Api.getMyLikeUrl(openid));

    getPostsRequest.then(response => {

      if (response.statusCode === 200) {
        self.setData({
          floatDisplay: "block",
          postsList: self.data.postsList.concat(response.data.data.map(function (item) {
            count++;
            return item;
          })),

        });
        if (count == 0) {
          self.setData({
            shownodata: true
          });
        }
        setTimeout(function () {
          wx.hideLoading();

        }, 1500); 
      }
      else {
        console.log(response);
        self.setData({
          showerror: 'block'
        });
      }
    })
      .catch(function () {
        self.setData({
          showerror: "block",
          floatDisplay: "none"
        });
      })
      .finally(function () {
        wx.hideLoading();
      })
  },
  
  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  

})



