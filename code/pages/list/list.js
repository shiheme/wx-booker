var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
//var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'

var app = getApp();

Page({
  data: {
    postsList: {},
    categoriesList: {},
    searchKey: "",

    isLastPage: false,
    isCatePage: false,
    isSearchPage: false,

    pageCount:10, //定义每页显示多少文章
    page: 1,
    orderby: 'date',
    order: 'desc',
    search: '',
    categories: 0,

    showerror: "none",
    shownodata: false,
    floatDisplay: "none",
    
    pagetitle: '',
    isActive: true, //定义头部导航是否显示背景
    isGoback: true, //定义头部导航是否存在返回上一页/返回首页
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

    var title = "分享";
    var path = ""

    if (this.data.categories && this.data.categories != 0) {
      title += "全部" + this.data.categoriesList.name;
      path = 'pages/list/list?categoryID=' + this.data.categoriesList.id + '&isshare=1';

    }
    else {
      title += this.data.searchKey + "的搜索结果";
      path = 'pages/list/list?search=' + this.data.searchKey + '&isshare=1';
    }
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      //console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      //console.log('最后一页');
    }
  },
  reload: function (e) {
    var self = this;
    if (self.data.categories && self.data.categories != 0) {

      self.setData({
        categories: options.categoryID,
        isCatePage: true

      });
      self.fetchCategoriesData(self.data.categories);
    }
    if (self.data.search && self.data.search != '') {
      self.setData({
        //search: options.search,
        isSearchPage: true,
        searchKey: self.data.search
      })
    }
    self.fetchPostsData(self.data);
  },
  onLoad: function (options) {
    var self = this;

    if (options.isshare == 1) {
      //console.log('是分享进入');
      this.setData({
        'isshare': '1'
      })
    }

    if (options.categoryID && options.categoryID != 0) {
      self.setData({
        categories: options.categoryID,
        isCatePage: true
      });
      self.fetchCategoriesData(options.categoryID);
    }
    if (options.search && options.search != '') {
      self.setData({
        search: options.search,
        isSearchPage: true,
        searchKey: options.search,
        pagetitle: options.search + '的搜索结果'
      })

      this.fetchPostsData(self.data);
    }
  },
  //获取文章列表数据
  fetchPostsData: function (data) {
    var self = this;
    var count = 0;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    //console.log(self.data);

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
    }).catch(function () {
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
      }).finally(function () {
        wx.hideLoading();
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
      url = '../detail/detail?id=' + id;
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
        categoriesName: response.data.name,
        pagetitle: '全部' + response.data.name
      });
      self.fetchPostsData(self.data);
    })
  },

})



