//faq.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();

Page({
  data: {
    postsList: {},

    isLastPage: false,

    pageCount: 10,
    page: 1,
    orderby: "id",
    order: "asc",
    categories: 166, //重要！定义要显示借还书FAQ的类目

    showerror: "none",
    floatDisplay: "none",

    isActive: true, //定义头部导航是否显示背景
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
  onShareAppMessage: function () {
    return {
      title: "借还书FAQ", //重要！定义该页面要显示分享的标题
      path: 'pages/faq/faq',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      showerror: "none",
      floatDisplay: "none"
    });
    this.fetchPostsData(self.data);
  },
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      console.log('最后一页');
    }
  },
  reload: function (e) {
    var self = this;
    self.fetchPostsData(self.data);
  },
  onLoad: function (options) {
    var self = this;
    this.fetchPostsData(self.data);
    
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    console.log(self.data);

    wx.showLoading({
      title: '正在加载',
      mask: true
    });

    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));

    getPostsRequest.then(response => {

      if (response.statusCode === 200) {
        if (response.data.length < self.data.pageCount) {
          self.setData({
            isLastPage: true
          });
        };
        self.setData({
          floatDisplay: "block",
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            var strdate = item.date
            item.date = util.cutstr(strdate, 10, 1);
            return item;
          })),

        });
        setTimeout(function () {
            wx.hideLoading();

        }, 1500);
      }
      else {
        if (response.data.code == "rest_post_invalid_page_number") {
          self.setData({
            isLastPage: true
          });
          wx.showToast({
            title: '没有更多内容',
            mask: false,
            duration: 1500
          });
        }
        else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          })
        }
      }
    })
      .catch(function () {
        if (data.page == 1) {
          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });
        }
        else {
          wx.showModal({
            title: '加载失败',
            content: '加载数据失败,请重试.',
            showCancel: false,
          });
          self.setData({
            page: data.page - 1
          });
        }
      })
      .finally(function () {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      })
  },
  //加载分页
  loadMore: function (e) {

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      //console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../faqdt/faqdt?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //获取分类列表
  fetchCategoriesData: function (id) {
    var self = this;
    self.setData({
      categoriesList: []
    });

    var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));

    getCategoryRequest.then(response => {

      self.setData({
        categoriesList: response.data,
        categoriesName: response.data.name
      });
      self.fetchPostsData(self.data);
    })
  },

})



