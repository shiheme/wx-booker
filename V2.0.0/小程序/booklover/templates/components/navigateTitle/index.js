var app = getApp()
Component({
  data: {
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
    cnt_tp: {
      type: String,
      value: ''
    },
    helpurl: {
      type: String,
      value: '' //帮助文档的路径
    },
    isshare: {
      type: String,
      value: '0' //如果为1则表示页面为分享来的页面
    },
    bgcolor: {
      type: String,
      value: '' //用于详情页的特别颜色
    },
    pageStyle: {
      type: String,
      value: 'whitebg' //用于显示头部文字及图标颜色
    },
    isGoback: {
      type: Boolean,
      value: false //是否显示返回按钮/返回首页按钮
    },
    isSearch: {
      type: Boolean,
      value: false //是否显示搜索按钮
    },
    isScancode: {
      type: Boolean,
      value: false //是否显示扫码按钮
    },
    isTheme: {
      type: Boolean,
      value: false //是否显示扫码按钮
    },
    istoHelp: {
      type: Boolean,
      value: false //是否显示帮助按钮
    },
    isRefresh: {
      type: Boolean,
      value: false //是否显示刷新按钮
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
      var cnt_tp = e.currentTarget.dataset.cnt_tp;
      wx.navigateTo({
        url: '../search/search?cnt_tp='+cnt_tp
      })
    },
    scanCode: function(event) {
      console.log(1)
      var cnt_tp = event.currentTarget.dataset.cnt_tp;
      // 允许从相机和相册扫码
      wx.scanCode({
        //onlyFromCamera: true,
        //scanType: ['barCode'],
        success: res => {
          console.log(res.result)
          var url = '../list/list'
          var key = res.result;
          if (key != '') {
            url = url + '?search=' + key + '&cnt_tp=' + cnt_tp;
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
    redictHelp: function(e) {
      // console.log('查看文章');
      var url = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: url
      })
    },
  }
})