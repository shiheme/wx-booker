var pageCommonBehavior = require('../../utils/common');
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var Auth = require('../../utils/auth.js');
var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')

//const Zan = require('../../vendor/ZanUI/index')
///const innerAudioContext = wx.createInnerAudioContext();
let ctx = wx.createCanvasContext('mycanvas');

var app = getApp();
let isFocusing = false
//var webSiteName = config.getWebsiteName;
var domain = config.getDomain
import {
  ModalView
} from '../../templates/modal-view/modal-view.js'
import Poster from '../../templates/components/wxa-plugin-canvas-poster/poster/poster';
let rewardedVideoAd = null
Component({
  behaviors: [pageCommonBehavior],
  properties: {
    // 接受页面参数
    cnt_tp: String,
    id: Number,
  },
  data: {
    title: '',
    detail: {},
    detailDate: '',
    wxParseData: {},
    display: 'none',
    showerror: 'none',
    postList: [],
    link: '',
    showtopFive: '1',
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    content: '',
    likeImag: "",
    likeList: [],
    likeCount: 0,
    displayLike: 'none',
    userid: "",
    flag: 1,
    logo: config.getLogo,
    isLoading: false,
    isLoginPopup: false,
    openid: "",
    booktit: "",
    bookimg: "",
    bookisbn: "",
    bookcost: "",
    userInfo: {},
    userLevel: {},
    downloadFileDomain: config.getDownloadFileDomain,
    postID: null,
    postsShowSwiperList: [],
    videolook: false,
    fileopen: '',
    platform: '', //开发平台
    isGoback: true,
  },
  attached: function () {

  },
  methods: {
    onLoad: function (options) {
      var self = this;
      self.setData({});
      Auth.setUserInfoData(self);
      Auth.checkLogin(self);
      if (self.data.openid) {
        self.getIslike();
      }
      if (self.data.openid) {
        this.setData({
          videolook: true
        })
      }
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
      console.log(self.data.cnt_tp)
      var getCustomsetBycnttpRequest = wxRequest.getRequest(Api.getCustomsetBycnttp(data));
      getCustomsetBycnttpRequest.then(res => {
        if (res.data.floatads_location) {
          var str4 = res.data.floatads_location;
          str4 = str4.replace(" ", "");
          str4 = str4.replace(" \u548c ", "");
          str4 = str4.replace("and", "");
          str4 = str4.split(",");
          str4 = str4.indexOf('detail');
          self.setData({
            floatads_location: str4
          });
        }
        this.setData({
          cmset: res.data,
          cnt_tp: res.data.cnt_tp
        })
        wx.setStorage({
          key: "cnt_tp",
          data: res.data.cnt_tp
        })

        this.setData({
          cnt_tp_ok: 'book'
        })

        wx.getSystemInfo({
          success: function (t) {
            self.setData({
              system: t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android',
              platform: t.platform
            });
          }
        })
        self.fetchTopFivePosts();
        self.fetchDetailData(self.data.id, self.data.cnt_tp);
        new ModalView;
      });

    },
    showLikeImg: function () {
      var self = this;
      var flag = false;
      var _likes = self.data.detail.avatarurls;
      if (!_likes) {
        return;
      }
      var likes = [];
      for (var i = 0; i < _likes.length; i++) {
        var avatarurl = "/images/" + self.data.pageStyle+"/gravatar.png";
        if (_likes[i].avatarurl.indexOf('wx.qlogo.cn') != -1) {
          avatarurl = _likes[i].avatarurl;
        }
        likes[i] = avatarurl;
      }
      var temp = likes;
      self.setData({
        likeList: likes
      });
    },
    onShareAppMessage: function (res) {
      //console.log(res);
      return {
        title: '分享一本好书《' + this.data.detail.title.rendered + '》给你',
        path: 'pages/detail/detail?id=' + this.data.detail.id + '&isshare=1&cnt_tp=' + this.data.cnt_tp,
        success: function (res) { },
        fail: function (res) { }
      }
    },
    clickLike: function (e) {
      var id = e.target.id;
      var self = this;
      if (self.data.openid) {
        var data = {
          openid: self.data.openid,
          postid: self.data.postID
        };
        var url = Api.postLikeUrl();
        var postLikeRequest = wxRequest.postRequest(url, data);
        postLikeRequest
          .then(response => {
            if (response.data.status == '200') {
              var _likeList = []
              var _like = self.data.userInfo.avatarUrl;
              _likeList.push(_like);
              var tempLikeList = _likeList.concat(self.data.likeList);
              var _likeCount = parseInt(self.data.likeCount) + 1;
              self.setData({
                likeList: tempLikeList,
                likeCount: _likeCount,
                displayLike: 'block'
              });
              wx.showToast({
                title: '喜欢成功',
                icon: 'success',
                duration: 900,
                success: function () { }
              })
            } else if (response.data.status == '501') {
              //console.log(response.data.message);
              wx.showToast({
                title: '已喜欢',
                icon: 'success',
                duration: 900,
                success: function () { }
              })
            } else {
              //console.log(response.data.message);
            }
            self.setData({
              likeImag: "on/like.svg",
              likeText: "已喜欢",
              likeCss: "disabled",
            });
          })
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    getIslike: function () { //判断当前用户是否点赞
      var self = this;
      if (self.data.openid) {
        var data = {
          openid: self.data.openid,
          postid: self.data.id
        };
        var url = Api.postIsLikeUrl();
        var postIsLikeRequest = wxRequest.postRequest(url, data);
        postIsLikeRequest
          .then(response => {
            if (response.data.status == '200') {
              self.setData({
                likeImag: "on/like.svg",
                likeText: "已喜欢",
                likeCss: "disabled",
              });
              //console.log("已喜欢");
            }
          })
      }
    },
    //获取文章内容
    fetchDetailData: function (id, cnt_tp) {
      var self = this;
      var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id, cnt_tp));
      var res;
      var _displayLike = 'none';
      wx.showLoading({
        title: '正在加载',
        mask: true
      });
      getPostDetailRequest
        .then(response => {
          res = response;
          console.log(res)
          if (response.data.code && (response.data.data.status == "404")) {
            self.setData({
              showerror: 'block',
              display: 'none',
              errMessage: response.data.message
            });
            return false;
          }
          if (self.data.pageStyle) {
            self.setData({
              likeImag: self.data.pageStyle + "/like.svg"
            });
          }
          if (res.data.book_pagestyle[0] == "blackbg") {
            wx.setNavigationBarColor({
              frontColor: '#ffffff',
              backgroundColor: '#141414',
            })
          } else {
            wx.setNavigationBarColor({
              frontColor: '#141414',
              backgroundColor: '#ffffff',
            })
          }
          WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
          WxParse.wxParse('gallery', 'html', response.data.book_gallery, self, 5);
          WxParse.wxParse('videoadscnt', 'html', response.data.book_videoadscnt, self, 5);

          var _likeCount = response.data.like_count;
          if (response.data.like_count != '0') {
            _displayLike = "block"
          }
          if (response.data.book_fileopen[0]) {
            self.setData({
              fileopen: response.data.book_fileopen[0].guid,
            })
          }
          // 调用API从本地缓存中获取阅读记录并记录
          var logs = wx.getStorageSync('readLogs_' + self.data.cnt_tp) || [];
          console.log(logs)
          // 过滤重复值
          if (logs.length > 0) {
            logs = logs.filter(function (log) {
              return log[0] !== id;
            });
            console.log(logs)
          }

          // 如果超过指定数量
          if (logs.length > 19) {
            logs.pop(); //去除最后一个
          }
          logs.unshift([id, response.data.title.rendered]);
          wx.setStorageSync('readLogs' + self.data.cnt_tp, logs);
          //end 
          var openAdLogs = wx.getStorageSync('openAdLogs') || [];
          var openAded = res.data.book_openvideoads[0] == '1' ? false : true;
          if (openAdLogs.length > 19) {
            openAded = true;
          } else if (openAdLogs.length > 0 && res.data.book_openvideoads[0] == '1') {
            for (var i = 0; i < openAdLogs.length; i++) {
              if (openAdLogs[i].id == res.data.id) {
                openAded = true;
                break;
              }
            }
          }
          if (res.data.book_openvideoads[0] == '1') {
            self.loadInterstitialAd(res.data.rewardedVideoAdId);
          }
          self.setData({
            detail: response.data,
            likeCount: _likeCount,
            postID: id,
            booktit: response.data.title.rendered,
            bookimg: response.data.post_medium_image,
            bookisbn: response.data.book_isbn,
            bookcost: response.data.book_rent,
            link: response.data.link,
            detailDate: util.cutstr(response.data.date, 10, 1),
            display: 'block',
            displayLike: _displayLike,
            total_comments: response.data.total_comments,
            postImageUrl: response.data.postImageUrl,
            videolook: openAded ? true : false
          });
          return response.data
        })
        .then(response => {
          self.setData({
            isTouch: true
          })
        })
        .then(response => {
          var tagsArr = [];
          tagsArr = res.data.tags
          if (!tagsArr) {
            return false;
          }
          var tags = "";
          for (var i = 0; i < tagsArr.length; i++) {
            if (i == 0) {
              tags += tagsArr[i];
            } else {
              tags += "," + tagsArr[i];
            }
          }
          if (tags != "") {
            var getPostTagsRequest = wxRequest.getRequest(Api.getPostsByTags(id, tags));
            getPostTagsRequest
              .then(response => {
                self.setData({
                  postList: response.data
                });
              })
          }
        }).then(response => { //获取点赞记录
          self.showLikeImg();
        }).then(resonse => {
          if (self.data.openid) {
            Auth.checkSession(self, 'isLoginLater');
          }
        }).then(response => { //获取是否已经点赞
          if (self.data.openid) {
            self.getIslike();
          }
        })
        .catch(function (error) {
          //console.log('error: ' + error);
        })
        .finally(function () {
          wx.hideLoading();
        })
    },

    //跳转至某分类下的文章列表
    redictIndex: function (e) {
      //console.log('查看某类别下的文章');  
      var id = e.currentTarget.dataset.id;
      var name = e.currentTarget.dataset.item;
      var url = '../list/list?categories=' + id + '&cnt_tp=' + this.data.cnt_tp;
      wx.navigateTo({
        url: url
      });
    },
    //监听页面高度
    onPageScroll(res) {
      if (res.scrollTop < 88) {
        if (this.data.isActive) {
          this.setData({
            isActive: false
          })
        }
      } else {
        if (!this.data.isActive) {
          this.setData({
            isActive: true
          })
        }
      }
    },
    onPosterSuccess(e) {
      const {
        detail
      } = e;
      this.showModal(detail);
    },
    onPosterFail(err) {
      wx.showToast({
        title: err,
        mask: true,
        duration: 2000
      });
    },
    onCreatePoster: function () {
      var self = this;
      if (self.data.openid) {
        self.creatArticlePoster(self, Api, util, self.modalView, Poster);
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    showModal: function (posterPath) {
      this.modalView.showModal({
        title: '保存至相册可以分享给好友',
        confirmation: false,
        confirmationText: '',
        inputFields: [{
          fieldName: 'posterImage',
          fieldType: 'Image',
          fieldPlaceHolder: '',
          fieldDatasource: posterPath,
          isRequired: false,
        }],
        confirm: function (res) {
          //console.log(res)
        }
      })
    },
    creatArticlePoster: function (appPage, api, util, modalView, poster) {
      var postId = appPage.data.detail.id;
      var title = appPage.data.detail.title.rendered;
      var posterbgcolor = appPage.data.detail.book_foreground;
      var posterpagestyle = appPage.data.detail.book_pagestyle[0];
      var postertxtcolor;
      if (posterpagestyle == "whitebg") {
        postertxtcolor = '#000000'
      } else if (posterpagestyle == "blackbg") {
        postertxtcolor = '#ffffff'
      }
      var excerpt = appPage.data.detail.excerpt.rendered ? appPage.data.detail.excerpt.rendered : '';
      if (excerpt && excerpt.length != 0 && excerpt != '') {
        excerpt = util.removeHTML(excerpt);
      }
      var postImageUrl = ""; //海报图片地址
      var posterImagePath = "";
      var qrcodeImagePath = ""; //二维码图片的地址
      var flag = false;
      var imageInlocalFlag = false;
      var downloadFileDomain = appPage.data.downloadFileDomain;
      var logo = appPage.data.logo;
      var defaultPostImageUrl = appPage.data.detail.postImageUrl;
      var postImageUrl = appPage.data.detail.post_full_image;
      //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
      if (postImageUrl) {
        var n = 0;
        for (var i = 0; i < downloadFileDomain.length; i++) {
          if (postImageUrl.indexOf(downloadFileDomain[i].domain) != -1) {
            n++;
            break;
          }
        }
        if (n == 0) {
          imageInlocalFlag = true;
          postImageUrl = defaultPostImageUrl;
        }
      } else {
        postImageUrl = defaultPostImageUrl;
      }
      var posterConfig = {
        width: 750,
        height: 1200,
        backgroundColor: '#FFFFFF',
        debug: false
      }
      var blocks = [{
        width: 750,
        height: 800,
        x: 0,
        y: 0,
        backgroundColor: posterbgcolor,
        //borderRadius: 20,
      },
      {
        width: 330,
        height: 60,
        x: 350,
        y: 1000,
        backgroundColor: '#000000',
        opacity: 0.5,
        zIndex: 100,
      }
      ]
      var texts = [];
      texts = [{
        x: 350,
        y: 860,
        baseLine: 'top',
        text: '好友 ' + appPage.data.userInfo.nickName,
        fontSize: 40,
        color: '#000000',
        width: 570,
        lineNum: 1
      },
      {
        x: 350,
        y: 920,
        baseLine: 'top',
        text: '向你推荐了这本书',
        fontSize: 32,
        color: '#080808',
      },
      {
        x: 375,
        y: 555,
        baseLine: 'top',
        text: title,
        textAlign: 'center',
        fontSize: 50,
        color: postertxtcolor,
        marginLeft: 0,
        width: 650,
        lineNum: 2,
        lineHeight: 50,
        zIndex: 110,
      },
      {
        x: 375,
        y: 645,
        baseLine: 'top',
        text: excerpt,
        textAlign: 'center',
        fontSize: 28,
        color: postertxtcolor,
        width: 550,
        lineNum: 2,
        lineHeight: 38,
        opacity: 0.8,
        zIndex: 110,
      },
      {
        x: 360,
        y: 1010,
        baseLine: 'top',
        text: '← 长按识别小程序码',
        fontSize: 32,
        color: '#ffffff',
        zIndex: 110,
      }
      ];
      posterConfig.blocks = blocks; //海报内图片的外框
      posterConfig.texts = texts; //海报的文字
      var url = Api.creatPoster();
      var path = "pages/detail/detail?id=" + postId + '&isshare=1';
      var data = {
        postid: postId,
        path: path
      };
      var creatPosterRequest = wxRequest.postRequest(url, data);
      creatPosterRequest.then(res => {
        if (res.data.code == 'success') {
          qrcodeImagePath = res.data.qrcodeimgUrl;
          var images = [
            // {
            //   width: 62,
            //   height: 62,
            //   x: 32,
            //   y: 30,
            //   borderRadius: 62,
            //   url: appPage.data.userInfo.avatarUrl, //用户头像
            // },
            {
              width: 300,
              height: 415,
              x: 225,
              y: 100,
              url: postImageUrl, //海报主图
              zIndex: 110,
            },
            {
              width: 250,
              height: 250,
              x: 50,
              y: 830,
              url: qrcodeImagePath, //二维码的图
            }
          ];
          posterConfig.images = images; //海报内的图片
          appPage.setData({
            posterConfig: posterConfig
          }, () => {
            poster.create(true); //生成海报图片
          });
        } else {
          wx.showToast({
            title: res.message,
            mask: true,
            duration: 2000
          });
        }
      });
    },
    loadInterstitialAd: function (excitationAdId) {
      var self = this;
      if (wx.createRewardedVideoAd) {
        rewardedVideoAd = wx.createRewardedVideoAd({
          adUnitId: excitationAdId
        })
        rewardedVideoAd.onLoad(() => {
          console.log('onLoad event emit')
        })
        rewardedVideoAd.onError((err) => {
          console.log(err);
          this.setData({
            videolook: true
          })
        })
        rewardedVideoAd.onClose((res) => {
          var id = self.data.detail.id;
          if (res && res.isEnded) {
            var nowDate = new Date();
            nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            var openAdLogs = wx.getStorageSync('openAdLogs') || [];
            // 过滤重复值
            if (openAdLogs.length > 0) {
              openAdLogs = openAdLogs.filter(function (log) {
                return log["id"] !== id;
              });
            }
            // 如果超过指定数量不再记录
            if (openAdLogs.length < 21) {
              var log = {
                "id": id,
                "date": nowDate
              }
              openAdLogs.unshift(log);
              wx.setStorageSync('openAdLogs', openAdLogs);
              console.log(openAdLogs);
            }
            this.setData({
              videolook: true
            })
          } else {
            wx.showToast({
              title: "你中途关闭了视频",
              icon: "none",
              duration: 3000
            });
          }
        })
      }
    },
    //阅读更多
    readMore: function () {
      var self = this;
      var platform = self.data.platform
      if (platform == 'devtools') {
        wx.showToast({
          title: "开发工具无法显示激励视频",
          icon: "none",
          duration: 2000
        });
        self.setData({
          videolook: true
        })
      } else {
        rewardedVideoAd.show()
          .catch(() => {
            rewardedVideoAd.load()
              .then(() => rewardedVideoAd.show())
              .catch(err => {
                console.log('激励视频 广告显示失败');
                self.setData({
                  videolook: true
                })
              })
          })
      }
    },
    fetchTopFivePosts: function () {
      var self = this;
      //获取滑动图片的文章
      var getPostsRequest = wxRequest.getRequest(Api.getSwiperPosts());
      getPostsRequest.then(response => {
        if (response.data.status == '200' && response.data.posts.length > 0) {
          self.setData({
            // postsShowSwiperList: response.data.posts,
            postsShowSwiperList: self.data.postsShowSwiperList.concat(response.data.posts.map(function (item) {
              return item;
            }))
          });
        }
      }).catch(function (response) { })
        .finally(function () { });
    },
    // 跳转至预定
    redictContact: function () {
      var self = this;
      if (self.data.openid) {
        var url = '../contact/contact?auth=' + this.data.userInfo.nickName + '&openid=' + this.data.openid + '&level=' + this.data.userLevel.levelName + '&booktit=' + this.data.booktit + '&bookimg=' + this.data.bookimg + '&bookisbn=' + this.data.bookisbn + '&bookcost=' + this.data.bookcost;
        wx.navigateTo({
          url: url
        })
      } else {
        Auth.checkSession(self, 'isLoginNow');
      }
    },
    // 跳转至活动
    redictAct: function () {
      var self = this;
      var url = '../act/act';
      wx.navigateTo({
        url: url
      })
    },
    agreeGetUser: function (e) {
      let self = this;
      Auth.checkAgreeGetUser(e, app, self, '0');;
    },
    exit: function (e) {
      Auth.logout(this);
      wx.reLaunch({
        url: '../detail/detail?id=' + this.data.postID + '&isshare=1'
      })
    },

  }
})