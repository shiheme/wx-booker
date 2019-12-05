//index.js
//获取应用实例
var Api = require('../../utils/api.js');
//var util = require('../../utils/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
//var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();

Page({
  data: {
    categoriesList: [],
    cateparentID: 120, //重要！定义要显示的书目父分类
    orderby: "id",
    order: "asc",
    bookimgshow: false,

    showerror: "none",
    floatDisplay: "none",

    isActive:true, //定义头部导航是否显示背景
    isGoback: false, //定义头部导航是否存在返回上一页/返回首页
    isSearch: true, //定义头部导航是否显示索索
    isScancode: true, //定义头部导航是否显示扫码
    istoHelp: false, //定义头部导航是否显示帮助
    isshare: "0",
 
    pageStyle: app.globalData.pageStyle,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight
  },
  onPullDownRefresh: function() {
    var self = this;
    self.setData({
      bookimgshow: false,
      showerror: "none",
      floatDisplay: "none"
    });
    this.fetchCategoriesData(self.data);

  },
  onLoad: function (options) {
    var self = this;
    this.fetchCategoriesData(self.data);

    // if (options.isshare == 1) {
    //   //console.log('是分享进入');
    //   this.setData({
    //     'isshare': options.isshare
    //   })
    // }
  },
  onShareAppMessage: function () {
    return {
      title: "一杯咖啡，一本书，一位朋友", //重要！定义该页面要显示分享的标题
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //获取分类列表
  fetchCategoriesData: function(data) {
    var self = this;
    if (!data) data = {};
    if (!data.cateparentID) data.cateparentID = '';
    if (!data.orderby) data.orderby = 'count';
    if (!data.order) data.order = 'desc';
    self.setData({
      categoriesList: []
    });
    //console.log(self.data);
    //console.log(Api.getCategories());

    wx.showLoading({
      title: '正在加载',
      mask: true
    });

    var getCategoriesRequest = wxRequest.getRequest(Api.getCategories(data));
    getCategoriesRequest.then(response => {
        if (response.statusCode === 200) {

          //console.log(response.data)

          self.setData({
            categoriesList: self.data.categoriesList.concat(response.data.map(function(item) {
              return item;
            })),
            floatDisplay: "block"
          });

          setTimeout(function() {
            wx.hideLoading();
          }, 900);

        } else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          })
        }
      })
      .then(res => {
        self.setData({
          bookimgshow: true
        });

      })
      .catch(function(response) {
        self.setData({
          showerror: "block",
          floatDisplay: "none"
        });
      })
      .finally(function() {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      })
  },
  //跳转至某分类下的文章列表
  redictIndex: function(e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.item;
    var url = '../list/list?categoryID=' + id;
    wx.navigateTo({
      url: url
    });
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
  
})