var app = getApp()
Component({
  data: {
    placeHolder: '输入你要查找的书名/作者/ISBN',
    autoFocus: false,
    inputEnable: true,
    showsearcharea: false,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight
  },
  properties: {
    //属性值可以在组件使用时指定
    title: {
      type: String,
      value: ''
    },
    helpurl: {
      type: String,
      value: ''  //帮助文档的路径
    },
    isshare: {
      type: String,
      value: '0'  //如果为1则表示页面为分享来的页面
    },
    bgcolor: {
      type: String,
      value: '#ffffff' //用于详情页的特别颜色
    },
    pageStyle: {
      type: String,
      value: 'whitebg' //用于显示头部文字及图标颜色
    },
    isGoback: {
      type: Boolean,
      value: false    //是否显示返回按钮/返回首页按钮
    },
    isSearch: {
      type: Boolean,
      value: false  //是否显示搜索按钮
    },
    isScancode: {
      type: Boolean,
      value: false  //是否显示扫码按钮
    },
    istoHelp: {
      type: Boolean,
      value: false  //是否显示帮助按钮
    },
    isRefresh: {
      type: Boolean,
      value: false  //是否显示刷新按钮
    },
    isActive: {
      type: Boolean,
      value: true
    }
  },
  attached() {
    let pageContext = getCurrentPages()
    // if (pageContext.length > 1) {
    //   this.setData({
    //     isShowHome: false
    //   })
    // } else {
    //   this.setData({
    //     isShowHome: true
    //   })
    // }
    this.setData({
      navBarHeight: app.globalData.navBarHeight,
      customBarHeight: app.globalData.customBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    })
  },
  methods: {
    tapsearcharea: function (e) {
      var self = this;
      this.setData({
        showsearcharea: true
      })

      setTimeout(function () {
        self.setData({
          autoFocus: true
        });
      }, 100);
    },
    closeCommentary: function () {
      this.setData({
        showsearcharea: false
      });
    },
    onInput: function (e) {
      this.setData({
        searchKey: e.detail.value
      })
    },
    formSubmit: function (e) {
      var url = '../list/list'
      var key = '';
      if (e.currentTarget.id == "search-input") {
        key = e.detail.value;
      } else {

        key = e.detail.value.input;

      }
      if (key != '') {
        url = url + '?search=' + key;
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
    onClear: function () {
      this.setData({
        searchKey: '',
      })
    },
    scanCode: function (event) {
      console.log(1)
      // 允许从相机和相册扫码
      wx.scanCode({
        onlyFromCamera: true,
        scanType: ['barCode'],
        success: res => {
          console.log(res.result)
          var url = '../list/list'
          var key = res.result;
          if (key != '') {
            url = url + '?search=' + key;
            wx.navigateTo({
              url: url
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      })
    },
    // 跳转至帮助文档
    redictHelp: function (e) {
      // console.log('查看文章');
      var url = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: url
      })
    },
  }
})
