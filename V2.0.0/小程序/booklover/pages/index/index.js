//index.js
//获取应用实例
var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    // 接受页面参数
    cnt_tp: String,
  },
  data: {
    categoriesList: [],
    orderby: "id",
    order: "asc",
    bookimgshow: false,
    cnt_tp: '', //定义文章类型
    isActive: true,
    isSearch: true,
    isScancode: true
  },
  attached: function() {

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
        console.log(res.data.floatads_location)
        self.setData({
          cmset: res.data,
          cnt_tp: res.data.cnt_tp,
        });

        wx.setStorage({
          key: "cnt_tp",
          data: res.data.cnt_tp
        })
        console.log(wx.getStorageSync('cnt_tp'))
        self.fetchCategoriesData(self.data);
        console.log(self.data)
      });
    },
    onPullDownRefresh: function() {
      var self = this;
      self.setData({
        bookimgshow: false,
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
        console.log(res.data.floatads_location)
        self.setData({
          cmset: res.data,
          cnt_tp: res.data.cnt_tp,
        });

        wx.setStorage({
          key: "cnt_tp",
          data: res.data.cnt_tp
        })
        console.log(wx.getStorageSync('cnt_tp'))
        self.fetchCategoriesData(self.data);
      });
    },
    onShareAppMessage: function() {
      return {
        title: this.data.cmset.cnt_index_mintit + '-' + this.data.cmset.cnt_index_subtit,
        path: 'pages/index/index?cnt_tp=' + this.data.cnt_tp,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    //获取分类列表
    fetchCategoriesData: function(data) {
      var self = this;
      if (!data) data = {};
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
            isTouch: true,
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
      var url = '../list/list?categories=' + id + '&cnt_tp=' + this.data.cnt_tp;
      wx.navigateTo({
        url: url
      });
    },
  },
})