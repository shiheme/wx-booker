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
    cnt_tp: String,
    search: String,
    categories: Number,
  },
  data: {
    postsList: {},
    categoriesList: {},
    cats_list_parentid: 0,
    searchKey: "",
    isLastPage: false,
    isCatePage: false,
    isSearchPage: false,
    listAdsuccess: true,
    pageCount: 10, //定义每页显示多少文章
    page: 1,
    orderby: 'date',
    order: 'desc',
    pagetitle: '',
    isActive: true,
    isGoback: true,
    isSearch: true,
    isScancode: true,
  },
  attached: function () {
    
  },
  methods: {
    onLoad: function(options) {
      var self = this;
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
        if (res.data.floatads_location) {
          var str4 = res.data.floatads_location;
          str4 = str4.replace(" ", "");
          str4 = str4.replace(" \u548c ", "");
          str4 = str4.replace("and", "");
          str4 = str4.split(",");
          str4 = str4.indexOf('list');
          self.setData({
            floatads_location: str4
          });
        }
        console.log(this.data.floatads_location)
        self.setData({
          isTouch: false,
          cmset: res.data,
          cnt_tp: res.data.cnt_tp
        })
        wx.setStorage({
          key: "cnt_tp",
          data: res.data.cnt_tp
        })
        console.log(wx.getStorageSync('cnt_tp'))
        if (self.data.categories && self.data.categories != 0) {
          self.setData({
            categories: self.data.categories,
            isCatePage: true
          });
          self.fetchCategoriesData(self.data.categories, self.data.cnt_tp);
        }
        if (self.data.search && self.data.search != '') {
          self.setData({
            search: self.data.search,
            isSearchPage: true,
            searchKey: self.data.search,
            pagetitle: self.data.search + '的搜索结果'
          })
          self.fetchPostsData(self.data);
        }
      });
    },
    onShareAppMessage: function() {
      var title = "分享";
      var path = ""
      if (this.data.categories && this.data.categories != 0) {
        title += this.data.pagetitle;
        path = 'pages/list/list?categories=' + this.data.categoriesList.id + '&isshare=1&cnt_tp=' + this.data.cnt_tp;
      } else {
        title += this.data.pagetitle;
        path = 'pages/list/list?search=' + this.data.searchKey + '&isshare=1&cnt_tp=' + this.data.cnt_tp;
      }
      return {
        title: title,
        path: path,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    onReachBottom: function() {
      var self = this;
      if (!self.data.isLastPage) {
        self.setData({
          page: self.data.page + 1
        });
        //console.log('当前页' + self.data.page);
        this.fetchPostsData(self.data);
      } else {
        //console.log('最后一页');
      }
    },
    //获取文章列表数据
    fetchPostsData: function(data) {
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
            postsList: self.data.postsList.concat(response.data.map(function(item) {
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
      }).then(response => {
        self.setData({
          isTouch: true
        })
      }).catch(function() {
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
      }).finally(function() {
        wx.hideLoading();
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
        url = '../detail/detail?id=' + id + '&cnt_tp=' + this.data.cnt_tp;
      wx.navigateTo({
        url: url
      })
    },
    //获取分类列表
    fetchCategoriesData: function (id, cnt_tp) {
      var self = this;
      self.setData({
        categoriesList: []
      });
      var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id, cnt_tp));
      getCategoryRequest.then(response => {
        if(id != '') {
        self.setData({
          categoriesList: response.data,
          categoriesName: response.data.name,
          pagetitle: '全部' + response.data.name
        });
        } else {
          self.setData({
            pagetitle: '全部内容'
          });
        }
        self.fetchPostsData(self.data);
      })
    },
    listAdbinderror: function (e) {
      var self = this;
      if (e.errCode) {
        self.setData({ listAdsuccess: false })
      }
    },
  }
})