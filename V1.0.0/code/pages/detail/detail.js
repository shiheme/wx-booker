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


Page({
  data: {
    title: '',
    detail: {},
    //commentsList: [],
    //pageCount: 10,
    //ChildrenCommentsList: [],
    //commentCount: '',
    detailDate: '',
    //commentValue: '',
    wxParseData: {},
    display: 'none',
    showerror: 'none',
    //page: 1,
    //textNum: 0,
    //flagde: false,
    //isLastPage: false,
    //parentID: "0",
    //focus: false,
    //placeholder: "输入评论",

    //scrollHeight: 0,
    postList: [],
    link: '',
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    content: '',
    //isShow: false,//控制menubox是否显示
    //isLoad: true,//解决menubox执行一次  
    //menuBackgroup: false,
    likeImag: "whitebg/like.svg",
    //likeText: "喜欢",
    //likeCss: "",
    likeList: [],
    likeCount: 0,
    displayLike: 'none',
    //replayTemplateId: config.getReplayTemplateId,
    userid: "",
    //toFromId: "",
    //commentdate: "",
    flag: 1,
    logo: config.getLogo,
    //enableComment: true,
    isLoading: false,
    //total_comments: 0,
    isLoginPopup: false,
    openid: "",
    booktit: "",
    bookimg: "",
    bookisbn: "",
    bookcost: "",
    userInfo: {},
    userLevel: {},
    system: '',
    downloadFileDomain: config.getDownloadFileDomain,

    postID: null,

    postsShowSwiperList: [],

    // isPlayAudio: false,
    // audioSeek: 0,
    // audioDuration: 0,
    // showTime1: '00:00',
    // showTime2: '00:00',
    // audioTime: 0,
    // displayAudio: 'none',
    // shareImagePath: '',
    // detailSummaryHeight: '',
    // detailAdsuccess: true,
    // fristOpen: false,
    // domain: domain,
    // platform: '',

    isActive: false, //定义头部导航是否显示背景
    isGoback: true, //定义头部导航是否存在返回上一页/返回首页
    isSearch: false, //定义头部导航是否显示索索
    isScancode: false, //定义头部导航是否显示扫码
    istoHelp: false, //定义头部导航是否显示帮助
    isshare: "0",

    pageStyle: app.globalData.pageStyle,
    navBarHeight: app.globalData.navBarHeight,
    customBarHeight: app.globalData.customBarHeight,
    titleBarHeight: app.globalData.titleBarHeight

  },
  reload: function(e) {
    var self = this;
    self.fetchTopFivePosts();
    self.fetchDetailData(options.id);
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);

    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
          platform: t.platform
        });
      }
    })
    new ModalView;
  },
  onLoad: function(options) {
    //console.log(options.scene);
    var self = this;
    //self.getEnableComment();
    self.fetchTopFivePosts();
    self.fetchDetailData(options.id);
    Auth.setUserInfoData(self);
    Auth.checkLogin(self);

    if (options.isshare == 1) {
      //console.log('是分享进入');
      this.setData({
        'isshare': '1'
      })
    }

    wx.getSystemInfo({
      success: function(t) {
        var system = t.system.indexOf('iOS') != -1 ? 'iOS' : 'Android';
        self.setData({
          system: system,
          isIphoneX: t.model.match(/iPhone X/gi),
          platform: t.platform
        });
      }
    })
    new ModalView;
  },
  onUnload: function() {
    //卸载页面，清除计步器
    clearInterval(this.data.durationIntval);
    if (rewardedVideoAd && rewardedVideoAd.destroy) {
      rewardedVideoAd.destroy()
    }
    innerAudioContext.destroy()
    ctx = null;


  },

  // tapcomment: function (e) {
  //   var self = this;
  //   let id = e.currentTarget.id;
  //   if (id) {
  //     this.setData({
  //       id: id,
  //       showTextarea: true,
  //     })
  //   } else {
  //     this.setData({
  //       showTextarea: true,
  //     })
  //   }

  //   setTimeout(function () {
  //     self.setData({
  //       focus: true
  //     });
  //   }, 100);
  // },
  // closeCommentary: function () {
  //   this.setData({
  //     showTextarea: false
  //   });
  // },
  // bindWordLimit: function (e) {
  //   if (e.detail.value.length > 0) {
  //     this.setData({
  //       textNum: e.detail.value.length,
  //       iscanpublish: true,
  //     })
  //   } else {
  //     this.setData({
  //       iscanpublish: false,
  //     })
  //   }

  // },
  showLikeImg: function() {
    var self = this;
    var flag = false;
    var _likes = self.data.detail.avatarurls;
    if (!_likes) {
      return;
    }

    var likes = [];
    for (var i = 0; i < _likes.length; i++) {
      var avatarurl = "../../images/gravatar.png";
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
  // onReachBottom: function () {
  //   var self = this;
  //   if (!self.data.isLastPage) {
  //     console.log('当前页' + self.data.page);
  //     self.fetchCommentData();
  //     self.setData({
  //       page: self.data.page + 1,
  //     });
  //   }
  //   else {
  //     console.log('评论已经是最后一页了');
  //   }

  // },
  onShareAppMessage: function(res) {
    //console.log(res);
    return {
      title: '分享一本好书《' + this.data.detail.title.rendered + '》给你',
      path: 'pages/detail/detail?id=' + this.data.detail.id + '&isshare=1',
      success: function(res) {
        // 转发成功
        //console.log(res);
      },
      fail: function(res) {
        //console.log(res);
        // 转发失败
      }
    }
  },
  gotowebpage: function() {
    var self = this;
    var enterpriseMinapp = self.data.detail.enterpriseMinapp;
    var url = '';
    if (enterpriseMinapp == "1") {
      var url = '../webpage/webpage';
      wx.navigateTo({
        url: url + '?url=' + self.data.link
      })
    } else {
      self.copyLink(self.data.link);
    }

  },
  copyLink: function(url) {
    wx.setClipboardData({
      data: url,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '链接已复制',
              image: '../../images/link.png',
              duration: 2000
            })
          }
        })
      }
    })
  },
  clickLike: function(e) {
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
              success: function() {}
            })
          } else if (response.data.status == '501') {
            //console.log(response.data.message);
            wx.showToast({
              title: '已喜欢',
              icon: 'success',
              duration: 900,
              success: function() {}
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
  getIslike: function() { //判断当前用户是否点赞
    var self = this;
    if (self.data.openid) {
      var data = {
        openid: self.data.openid,
        postid: self.data.postID
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

  // goHome: function () {
  //   wx.switchTab({
  //     url: '../index/index'
  //   })
  // },
  //赞赏功能
  praise: function () {
    var self = this;
    var enterpriseMinapp = self.data.detail.enterpriseMinapp;
    var system = self.data.system;
    if(system=='iOS'){
      var src = config.getZanImageUrl;
      wx.previewImage({
        urls: [src],
      });
    } else {
      wx.showModal({
        title: '打赏失败',
        content: '暂时仅支持苹果手机进行打赏',
        showCancel: false,
      });
    }
  },

  //获取是否开启评论设置
  // getEnableComment: function (id) {
  //   var self = this;
  //   var getEnableCommentRequest = wxRequest.getRequest(Api.getEnableComment());
  //   getEnableCommentRequest
  //     .then(response => {
  //       if (response.data.enableComment != null && response.data.enableComment != '') {
  //         if (response.data.enableComment === "1") {
  //           self.setData({
  //             enableComment: true
  //           });
  //         }
  //         else {
  //           self.setData({
  //             enableComment: false
  //           });
  //         }

  //       };

  //     });
  // },
  //获取文章内容
  fetchDetailData: function(id) {
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    var res;
    var _displayLike = 'none';
    getPostDetailRequest
      .then(response => {
        res = response;
        if (response.data.code && (response.data.data.status == "404")) {
          self.setData({
            showerror: 'block',
            display: 'none',
            detailAdsuccess: true,
            errMessage: response.data.message
          });

          return false;

        }
        // wx.setNavigationBarTitle({
        //   title: res.data.title.rendered
        // });

        if (res.data.format_embed_aspect_ration == "blackbg") {
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#ff0000',
            animation: {
              duration: 400,
              timingFunc: 'easeIn'
            }
          });
          self.setData({
            pageStyle: 'blackbg'
          });


        } else {
          wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#ff0000',
            animation: {
              duration: 400,
              timingFunc: 'easeIn'
            }
          });
          self.setData({
            pageStyle: 'whitebg'
          });
        }

        WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
        WxParse.wxParse('gallery', 'html', response.data.format_gallery, self, 5);
        // if (response.data.total_comments != null && response.data.total_comments != '') {
        //   self.setData({
        //     commentCount: "有" + response.data.total_comments + "条评论"
        //   });
        // };
        var _likeCount = response.data.like_count;
        if (response.data.like_count != '0') {
          _displayLike = "block"
        }



        self.setData({
          detail: response.data,
          likeCount: _likeCount,
          postID: id,
          booktit: response.data.title.rendered,
          bookimg: response.data.post_medium_image,
          bookisbn: response.data.format_video_url,
          bookcost: response.data.custom_author,
          link: response.data.link,
          detailDate: util.cutstr(response.data.date, 10, 1),
          //wxParseData: WxParse('md',response.data.content.rendered)
          //wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5),
          display: 'block',
          displayLike: _displayLike,
          total_comments: response.data.total_comments,
          postImageUrl: response.data.postImageUrl

        });
        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || [];
        // 过滤重复值
        if (logs.length > 0) {
          logs = logs.filter(function(log) {
            return log[0] !== id;
          });
        }
        // 如果超过指定数量
        if (logs.length > 19) {
          logs.pop(); //去除最后一个
        }
        logs.unshift([id, response.data.title.rendered]);
        wx.setStorageSync('readLogs', logs);
        //end 

        var openAdLogs = wx.getStorageSync('openAdLogs') || [];
        var openAded = res.data.excitationAd == '1' ? false : true;
        if (openAdLogs.length > 19) {
          openAded = true;
        } else if (openAdLogs.length > 0 && res.data.excitationAd == '1') {
          for (var i = 0; i < openAdLogs.length; i++) {
            if (openAdLogs[i].id == res.data.id) {
              openAded = true;
              break;
            }


          }
        }

        // if (res.data.excitationAd == '1') {
        //   self.loadInterstitialAd(res.data.rewardedVideoAdId);
        // }

        self.setData({
          detail: response.data,
          likeCount: _likeCount,
          postID: id,
          link: response.data.link,
          detailDate: util.cutstr(response.data.date, 10, 1),
          display: 'block',
          displayLike: _displayLike,
          total_comments: response.data.total_comments,
          postImageUrl: response.data.postImageUrl,
          detailSummaryHeight: openAded ? '' : '400rpx'

        });

        return response.data
      })
      .then(response => {

        // if (response.audios.length > 0 && response.audios[0].src != '') {
        //   self.InitializationAudio(response.audios[0].src);
        //   self.loadAudio();
        //   self.setData({
        //     displayAudio: "block"
        //   });
        // }

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
      .catch(function(error) {
        //console.log('error: ' + error);
      })
  },
  //拖动进度条事件
  // sliderChange: function(e) {
  //   var that = this;
  //   innerAudioContext.src = this.data.detail.audios[0].src;
  //   //获取进度条百分比
  //   var value = e.detail.value;
  //   this.setData({
  //     audioTime: value
  //   });
  //   var duration = this.data.audioDuration;
  //   //根据进度条百分比及歌曲总时间，计算拖动位置的时间
  //   value = parseInt(value * duration / 100);
  //   //更改状态
  //   this.setData({
  //     audioSeek: value,
  //     isPlayAudio: true
  //   });
  //   //调用seek方法跳转歌曲时间
  //   innerAudioContext.seek(value);
  //   //播放歌曲
  //   innerAudioContext.play();
  // },
  //初始化播放器，获取duration
  // InitializationAudio: function(audiosrc) {
  //   var self = this;
  //   //设置src
  //   innerAudioContext.src = audiosrc;
  //   //运行一次
  //   //innerAudioContext.play();
  //   innerAudioContext.autoplay = false;
  //   innerAudioContext.pause();
  //   innerAudioContext.onCanplay(() => {
  //     //初始化duration
  //     innerAudioContext.duration
  //     setTimeout(function() {
  //       //延时获取音频真正的duration
  //       var duration = innerAudioContext.duration;
  //       var min = parseInt(duration / 60);
  //       var sec = parseInt(duration % 60);
  //       if (min.toString().length == 1) {
  //         min = `0${min}`;
  //       }
  //       if (sec.toString().length == 1) {
  //         sec = `0${sec}`;
  //       }
  //       self.setData({
  //         audioDuration: innerAudioContext.duration,
  //         showTime2: `${min}:${sec}`
  //       });
  //     }, 1000)
  //   })

  // },
  // loadAudio: function() {
  //   var that = this;
  //   //设置一个计步器
  //   that.data.durationIntval = setInterval(function() {
  //     //当歌曲在播放时执行
  //     if (that.data.isPlayAudio == true) {
  //       //获取歌曲的播放时间，进度百分比
  //       var seek = that.data.audioSeek;
  //       var duration = innerAudioContext.duration;
  //       var time = that.data.audioTime;
  //       time = parseInt(100 * seek / duration);
  //       //当歌曲在播放时，每隔一秒歌曲播放时间+1，并计算分钟数与秒数
  //       var min = parseInt((seek + 1) / 60);
  //       var sec = parseInt((seek + 1) % 60);
  //       //填充字符串，使3:1这种呈现出 03：01 的样式
  //       if (min.toString().length == 1) {
  //         min = `0${min}`;
  //       }
  //       if (sec.toString().length == 1) {
  //         sec = `0${sec}`;
  //       }
  //       var min1 = parseInt(duration / 60);
  //       var sec1 = parseInt(duration % 60);
  //       if (min1.toString().length == 1) {
  //         min1 = `0${min1}`;
  //       }
  //       if (sec1.toString().length == 1) {
  //         sec1 = `0${sec1}`;
  //       }
  //       //当进度条完成，停止播放，并重设播放时间和进度条
  //       if (time >= 100) {
  //         innerAudioContext.stop();
  //         that.setData({
  //           audioSeek: 0,
  //           audioTime: 0,
  //           audioDuration: duration,
  //           isPlayAudio: false,
  //           showTime1: `00:00`
  //         });
  //         return false;
  //       }
  //       //正常播放，更改进度信息，更改播放时间信息
  //       that.setData({
  //         audioSeek: seek + 1,
  //         audioTime: time,
  //         audioDuration: duration,
  //         showTime1: `${min}:${sec}`,
  //         showTime2: `${min1}:${sec1}`
  //       });
  //     }
  //   }, 1000);
  // },
  // playAudio: function() {
  //   //获取播放状态和当前播放时间  
  //   var self = this;
  //   var isPlayAudio = self.data.isPlayAudio;
  //   var seek = self.data.audioSeek;
  //   innerAudioContext.pause();
  //   //更改播放状态
  //   self.setData({
  //     isPlayAudio: !isPlayAudio
  //   })
  //   if (isPlayAudio) {
  //     //如果在播放则记录播放的时间seek，暂停
  //     self.setData({
  //       audioSeek: innerAudioContext.currentTime
  //     });
  //   } else {
  //     //如果在暂停，获取播放时间并继续播放
  //     innerAudioContext.src = self.data.detail.audios[0].src;
  //     if (innerAudioContext.duration != 0) {
  //       self.setData({
  //         audioDuration: innerAudioContext.duration
  //       });
  //     }
  //     //跳转到指定时间播放
  //     innerAudioContext.seek(seek);
  //     innerAudioContext.play();
  //   }
  // },
  //给a标签添加跳转和复制链接事件
  wxParseTagATap: function(e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    //console.log(href);
    var domain = config.getDomain;
    //可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {
      wx.setClipboardData({
        data: href,
        success: function(res) {
          wx.getClipboardData({
            success: function(res) {
              wx.showToast({
                title: '链接已复制',
                //icon: 'success',
                image: '../../images/blackbg/copyurl.svg',
                duration: 2000
              })
            }
          })
        }
      })
    } else {
      var slug = util.GetUrlFileName(href, domain);
      if (slug == 'index') {
        wx.switchTab({
          url: '../index/index'
        })
      } else {
        var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
        getPostSlugRequest
          .then(res => {
            if (res.statusCode == 200) {
              if (res.data.length != 0) {
                var postID = res.data[0].id;
                var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
                if (openLinkCount > 4) {
                  wx.redirectTo({
                    url: '../detail/detail?id=' + postID
                  })
                } else {
                  wx.navigateTo({
                    url: '../detail/detail?id=' + postID
                  })
                  openLinkCount++;
                  wx.setStorageSync('openLinkCount', openLinkCount);
                }
              } else {
                var enterpriseMinapp = self.data.detail.enterpriseMinapp;
                var url = '../webpage/webpage'
                if (enterpriseMinapp == "1") {
                  url = '../webpage/webpage';
                  wx.navigateTo({
                    url: url + '?url=' + href
                  })
                } else {
                  self.copyLink(href);
                }


              }

            }

          }).catch(res => {
            //console.log(response.data.message);
          })
      }
    }

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
  //获取评论
  // fetchCommentData: function () {
  //   var self = this;
  //   let args = {};
  //   args.postId = self.data.postID;
  //   args.limit = self.data.pageCount;
  //   args.page = self.data.page;
  //   self.setData({ isLoading: true })
  //   var getCommentsRequest = wxRequest.getRequest(Api.getCommentsReplay(args));
  //   getCommentsRequest
  //     .then(response => {
  //       if (response.statusCode == 200) {
  //         if (response.data.data.length < self.data.pageCount) {
  //           self.setData({
  //             isLastPage: true
  //           });
  //         }
  //         if (response.data) {
  //           self.setData({
  //             commentsList: [].concat(self.data.commentsList, response.data.data)
  //           });
  //         }

  //       }

  //     })
  //     .catch(response => {
  //       console.log(response.data.message);

  //     }).finally(function () {

  //       self.setData({
  //         isLoading: false
  //       });

  //     });
  // },
  //显示或隐藏功能菜单
  // ShowHideMenu: function () {
  //   this.setData({
  //     isShow: !this.data.isShow,
  //     isLoad: false,
  //     menuBackgroup: !this.data.false
  //   })
  // },
  //点击非评论区隐藏功能菜单
  // hiddenMenubox: function () {
  //   this.setData({
  //     isShow: false,
  //     menuBackgroup: false
  //   })
  // },
  //底部刷新
  // loadMore: function (e) {
  //   var self = this;
  //   if (!self.data.isLastPage) {
  //     self.setData({
  //       page: self.data.page + 1
  //     });
  //     console.log('当前页' + self.data.page);
  //     this.fetchCommentData();
  //   }
  //   else {
  //     wx.showToast({
  //       title: '没有更多内容',
  //       mask: false,
  //       duration: 1000
  //     });
  //   }
  // },
  // replay: function (e) {
  //   var self = this;
  //   var id = e.target.dataset.id;
  //   var name = e.target.dataset.name;
  //   var userid = e.target.dataset.userid;
  //   var toFromId = e.target.dataset.formid;
  //   var commentdate = e.target.dataset.commentdate;
  //   isFocusing = true;
  //   if (self.data.enableComment == "1") {
  //     self.setData({
  //       parentID: id,
  //       placeholder: "回复" + name + ":",
  //       focus: true,
  //       userid: userid,
  //       toFromId: toFromId,
  //       showTextarea: true,
  //       commentdate: commentdate
  //     });

  //   }
  //   // console.log('toFromId', toFromId);
  //   // console.log('replay', isFocusing);
  // },
  // onReplyBlur: function (e) {
  //   var self = this;
  //   // console.log('onReplyBlur', isFocusing);
  //   if (!isFocusing) {
  //     {
  //       const text = e.detail.value.trim();
  //       if (text === '') {
  //         self.setData({
  //           parentID: "0",
  //           placeholder: "发表评论",
  //           focus: false,
  //           userid: "",
  //           toFromId: "",
  //           commentdate: ""
  //         });
  //       }

  //     }
  //   }
  //   // console.log(isFocusing);
  // },
  // onRepleyFocus: function (e) {
  //   var self = this;
  //   isFocusing = false;
  //   //console.log('onRepleyFocus', isFocusing);
  //   if (!self.data.focus) {
  //     self.setData({ focus: true })
  //   }


  // },
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
  //提交评论
  // formSubmit: function (e) {
  //   var self = this;
  //   var comment = e.detail.value.inputComment;
  //   var parent = self.data.parentID;
  //   var postID = e.detail.value.inputPostID;
  //   var formId = e.detail.formId;
  //   if (formId == "the formId is a mock one") {
  //     formId = "";

  //   }
  //   var userid = self.data.userid;
  //   var toFromId = self.data.toFromId;
  //   var commentdate = self.data.commentdate;
  //   if (comment.length === 0) {
  //     self.setData({
  //       'dialog.hidden': false,
  //       'dialog.title': '提示',
  //       'dialog.content': '没有填写评论内容。'

  //     });
  //   }
  //   else {
  //     if (self.data.openid) {
  //       var name = self.data.userInfo.nickName;
  //       var author_url = self.data.userInfo.avatarUrl;
  //       var email = self.data.openid + "@qq.com";
  //       var openid = self.data.openid;
  //       var fromUser = self.data.userInfo.nickName;
  //       var data = {
  //         post: postID,
  //         author_name: name,
  //         author_email: email,
  //         content: comment,
  //         author_url: author_url,
  //         parent: parent,
  //         openid: openid,
  //         userid: userid,
  //         formId: formId
  //       };
  //       var url = Api.postWeixinComment();
  //       var postCommentRequest = wxRequest.postRequest(url, data);
  //       var postCommentMessage = "";
  //       postCommentRequest
  //         .then(res => {
  //           console.log(res)
  //           if (res.statusCode == 200) {
  //             if (res.data.status == '200') {
  //               self.setData({
  //                 content: '',
  //                 showTextarea: false,
  //                 parentID: "0",
  //                 userid: 0,
  //                 placeholder: "发布评论",
  //                 focus: false,
  //                 commentsList: []

  //               });
  //               postCommentMessage = res.data.message;
  //               if (parent != "0" && !util.getDateOut(commentdate) && toFromId != "") {
  //                 var useropenid = res.data.useropenid;
  //                 var data =
  //                 {
  //                   openid: useropenid,
  //                   postid: postID,
  //                   template_id: self.data.replayTemplateId,
  //                   form_id: toFromId,
  //                   total_fee: comment,
  //                   fromUser: fromUser,
  //                   flag: 3,
  //                   parent: parent
  //                 };

  //                 url = Api.sendMessagesUrl();
  //                 var sendMessageRequest = wxRequest.postRequest(url, data);
  //                 sendMessageRequest.then(response => {
  //                   if (response.data.status == '200') {
  //                     //console.log(response.data.message);
  //                   }
  //                   else {
  //                     console.log(response.data.message);

  //                   }

  //                 });

  //               }
  //               var commentCounts = parseInt(self.data.total_comments) + 1;
  //               self.setData({
  //                 total_comments: commentCounts,
  //                 commentCount: "有" + commentCounts + "条评论"

  //               });
  //             }
  //             else if (res.data.status == '500') {
  //               self.setData({
  //                 'dialog.hidden': false,
  //                 'dialog.title': '提示',
  //                 'dialog.content': '评论失败，请稍后重试。'

  //               });
  //             }
  //           }
  //           else {

  //             if (res.data.code == 'rest_comment_login_required') {
  //               self.setData({
  //                 'dialog.hidden': false,
  //                 'dialog.title': '提示',
  //                 'dialog.content': '需要开启在WordPress rest api 的匿名评论功能！'

  //               });
  //             }
  //             else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
  //               self.setData({
  //                 'dialog.hidden': false,
  //                 'dialog.title': '提示',
  //                 'dialog.content': 'email填写错误！'

  //               });
  //             }
  //             else {
  //               console.log(res)
  //               self.setData({
  //                 'dialog.hidden': false,
  //                 'dialog.title': '提示',
  //                 'dialog.content': '评论失败,' + res.data.message

  //               });
  //             }
  //           }
  //         }).then(response => {
  //           //self.fetchCommentData(self.data); 
  //           self.setData(
  //             {
  //               page: 1,
  //               commentsList: [],
  //               isLastPage: false

  //             }
  //           )
  //           self.onReachBottom();
  //           //self.fetchCommentData();
  //           setTimeout(function () {
  //             wx.showToast({
  //               title: postCommentMessage,
  //               icon: 'none',
  //               duration: 900,
  //               success: function () {
  //               }
  //             })
  //           }, 900);
  //         }).catch(response => {
  //           console.log(response)
  //           self.setData({
  //             'dialog.hidden': false,
  //             'dialog.title': '提示',
  //             'dialog.content': '评论失败,' + response

  //           });
  //         })
  //     }
  //     else {
  //       Auth.checkSession(self, 'isLoginNow');

  //     }

  //   }

  // },
  agreeGetUser: function(e) {
    let self = this;
    Auth.checkAgreeGetUser(e, app, self, '0');;

  },
  closeLoginPopup() {
    this.setData({
      isLoginPopup: false
    });
  },
  openLoginPopup() {
    this.setData({
      isLoginPopup: true
    });
  },
  confirm: function() {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
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

  onCreatePoster: function() {
    var self = this;
    if (self.data.openid) {
      self.creatArticlePoster(self, Api, util, self.modalView, Poster);
    } else {
      Auth.checkSession(self, 'isLoginNow');
    }
  },

  showModal: function(posterPath) {
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
      confirm: function(res) {
        //console.log(res)
      }
    })
  },

  creatArticlePoster: function(appPage, api, util, modalView, poster) {

    var postId = appPage.data.detail.id;
    var title = appPage.data.detail.title.rendered;
    var posterbgcolor = appPage.data.detail.format_quote_background;
    var posterpagestyle = appPage.data.detail.format_embed_aspect_ration;
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
  // detailAdbinderror: function(e) {
  //   var self = this;
  //   if (e.errCode) {
  //     self.setData({
  //       detailAdsuccess: false
  //     })

  //   }
  // },
  // loadInterstitialAd: function(excitationAdId) {
  //   var self = this;
  //   if (wx.createRewardedVideoAd) {
  //     rewardedVideoAd = wx.createRewardedVideoAd({
  //       adUnitId: excitationAdId
  //     })
  //     rewardedVideoAd.onLoad(() => {
  //       console.log('onLoad event emit')
  //     })
  //     rewardedVideoAd.onError((err) => {
  //       console.log(err);
  //       this.setData({
  //         detailSummaryHeight: ''
  //       })
  //     })
  //     rewardedVideoAd.onClose((res) => {

  //       var id = self.data.detail.id;
  //       if (res && res.isEnded) {

  //         var nowDate = new Date();
  //         nowDate = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

  //         var openAdLogs = wx.getStorageSync('openAdLogs') || [];
  //         // 过滤重复值
  //         if (openAdLogs.length > 0) {
  //           openAdLogs = openAdLogs.filter(function(log) {
  //             return log["id"] !== id;
  //           });
  //         }
  //         // 如果超过指定数量不再记录
  //         if (openAdLogs.length < 21) {
  //           var log = {
  //             "id": id,
  //             "date": nowDate
  //           }
  //           openAdLogs.unshift(log);
  //           wx.setStorageSync('openAdLogs', openAdLogs);
  //           console.log(openAdLogs);

  //         }
  //         this.setData({
  //           detailSummaryHeight: ''
  //         })
  //       } else {

  //         wx.showToast({
  //           title: "你中途关闭了视频",
  //           icon: "none",
  //           duration: 3000
  //         });


  //       }
  //     })
  //   }
  // },
  // 阅读更多
  // readMore: function() {
  //   var self = this;

  //   var platform = self.data.platform
  //   if (platform == 'devtools') {

  //     wx.showToast({
  //       title: "开发工具无法显示激励视频",
  //       icon: "none",
  //       duration: 2000
  //     });

  //     self.setData({
  //       detailSummaryHeight: ''
  //     })
  //   } else {

  //     rewardedVideoAd.show()
  //       .catch(() => {
  //         rewardedVideoAd.load()
  //           .then(() => rewardedVideoAd.show())
  //           .catch(err => {
  //             console.log('激励视频 广告显示失败');
  //             self.setData({
  //               detailSummaryHeight: ''
  //             })
  //           })
  //       })
  //   }
  // },
  exit: function(e) {
    Auth.logout(this);
    wx.reLaunch({
      url: '../detail/detail?id=' + this.data.postID + '&isshare=1'
    })
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
})