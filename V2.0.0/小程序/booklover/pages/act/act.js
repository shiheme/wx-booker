//act.js
var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();
Component({
  behaviors: [pageCommonBehavior],
  properties: {},
  data: {
    postsList: {},
    actarea: '',
    isLastPage: false,
    pageCount: 10,
    page: 1,
    orderby: "id",
    order: "asc",
    cnt_tp: 'act',
    isActive: true,
    isGoback: true,
    categories: '',
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
          cmset: res.data
        });
        this.fetchCategoriesData(self.data.categories, self.data.cnt_tp);
      });
      console.log(self.data)
    },
    onShareAppMessage: function() {
      return {
        title: "本地活动",
        path: 'pages/act/act?isshare=1',
        success: function(res) {},
        fail: function(res) {}
      }
    },
    onPullDownRefresh: function() {
      var self = this;
      self.setData({
        showerror: "none",
        floatDisplay: "none"
      });
      if (wx.getStorageSync('cnt_tp') != '') {
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
        this.fetchCategoriesData(self.data.categories, self.data.cnt_tp);
      });
    },
    onReachBottom: function() {
      var self = this;
      if (!self.data.isLastPage) {
        self.setData({
          page: self.data.page + 1
        });
        console.log('当前页' + self.data.page);
        this.fetchPostsData(self.data);
      } else {
        console.log('最后一页');
      }
    },
    //获取文章列表数据
    fetchPostsData: function(data) {
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
          console.log(response);
          if (response.statusCode === 200) {
            if (response.data.length < self.data.pageCount) {
              self.setData({
                isLastPage: true
              });
            };
            self.setData({
              floatDisplay: "block",
              postsList: self.data.postsList.concat(response.data.map(function(item) {
                var strdate = item.date
                item.date = util.cutstr(strdate, 10, 1);
                return item;
              })),
            });
            setTimeout(function() {
              wx.hideLoading();
            }, 1500);
          } else {
            if (response.data.code == "rest_post_invalid_page_number") {
              self.setData({
                isLastPage: true
              });
              wx.showToast({
                title: '没有更多内容',
                mask: false,
                duration: 1500
              });
            } else {
              wx.showToast({
                title: response.data.message,
                duration: 1500
              })
            }
          }
        })
        .catch(function() {
          if (data.page == 1) {
            self.setData({
              showerror: "block",
              floatDisplay: "none"
            });
          } else {
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
        .finally(function() {
          wx.hideLoading();
          wx.stopPullDownRefresh();
        })
    },
    //加载分页
    loadMore: function(e) {
      var self = this;
      if (!self.data.isLastPage) {
        self.setData({
          page: self.data.page + 1
        });
        //console.log('当前页' + self.data.page);
        this.fetchPostsData(self.data);
      } else {
        wx.showToast({
          title: '没有更多内容',
          mask: false,
          duration: 1000
        });
      }
    },
    // 跳转至查看文章详情
    redictDetail: function(e) {
      // console.log('查看文章');
      var id = e.currentTarget.id,
        url = '../actdt/actdt?id=' + id + '&cnt_tp=' + this.data.cnt_tp;
      wx.navigateTo({
        url: url
      })
    },
    //获取分类列表
    fetchCategoriesData: function(id, cnt_tp) {
      var self = this;
      self.setData({
        categoriesList: []
      });
      var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id, cnt_tp));
      getCategoryRequest.then(response => {
        if (id != '') {
          self.setData({
            categoriesList: response.data,
            categoriesName: response.data.name
          });
        } else {
          self.setData({
            categoriesName: '活动'
          });
        }
        self.fetchPostsData(self.data);
      })
    },
  }
})