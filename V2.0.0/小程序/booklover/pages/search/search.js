//search.js
var pageCommonBehavior = require('../../utils/common');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
var app = getApp();
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    cnt_tp: String,
  },
  data: {
    isActive: true,
    isGoback: true,
    placeHolder: '输入你要查找的内容',
    autoFocus: false,
    inputEnable: true,
    searchLogs: [],
    keydown_number: 0,
    input_value: "",
  },
  attached: function() {
    var self = this;
    this.setData({})
    setTimeout(function() {
      self.setData({
        autoFocus: true
      });
    }, 100);
    var cnt_tp = self.data.cnt_tp;

    var searchlogs = wx.getStorageSync('searchlogs') || [];
    this.setData({
      searchLogs: searchlogs
    })
    console.log(wx.getStorageSync('searchlogs'))
    console.log(self.data)
  },
  methods: {
    onLoad: function(options) {},
    onInput: function(e) {
      this.setData({
        searchKey: e.detail.value,
      })
      if (e.detail.cursor != 0) {
        this.setData({
          keydown_number: 1
        })
      } else {
        this.setData({
          keydown_number: 0
        })
      }
      console.log(this.data.keydown_number)
    },

    formSubmit: function(e) {
      if (this.data.keydown_number == 1) {
        var url = '../list/list'
        var key = this.data.searchKey;


        var cnt_tp = this.data.cnt_tp;

        let arr = this.data.searchLogs;
        // console.log('进来第er个')
        // 判断数组中是否已存在
        if (arr.length >= 1) {
          arr = arr.filter(function(log) {
            return log[0] !== key;
          });
        }
        if (arr.length > 10) {
          arr.pop(); //去除最后一个
        }
        arr.unshift([key, url, cnt_tp]);
        wx.setStorageSync('searchlogs', arr);
        //存储搜索记录
        console.log(wx.getStorageSync('searchlogs'))


        url = url + '?search=' + key + '&cnt_tp=' + cnt_tp;
        wx.navigateTo({
          url: url
        })

      } else {
        wx.showModal({
          title: '提示',
          content: '请输入内容',
          showCancel: false,
        });
      }
    },
    //点击历史也记录到缓存顺序中
    historyValue: function(e) {
      let url = e.currentTarget.dataset.url;
      let key = e.currentTarget.dataset.key;
      let cnt_tp = e.currentTarget.dataset.cnt_tp;

      let arr = this.data.searchLogs;
      // console.log('进来第er个')
      // 判断数组中是否已存在
      if (arr.length >= 1) {
        arr = arr.filter(function(log) {
          return log[0] !== key;
        });
      }
      if (arr.length > 10) {
        arr.pop(); //去除最后一个
      }
      arr.unshift([key, url, cnt_tp]);
      wx.setStorageSync('searchlogs', arr);
      console.log(arr)
      wx.setStorage({
        key: "searchlogs",
        data: arr
      })
      console.log(wx.getStorageSync('searchlogs'))
      wx.navigateTo({
        url: url
      })
    },
    //清除搜索记录
    deleteHistory: function() {
      //清除当前数据
      this.setData({
        searchLogs: []
      });
      //清除缓存数据
      wx.removeStorageSync('searchlogs')
    },
    onClear: function() {
      this.setData({
        searchKey: '',
      })
    },
  }
})