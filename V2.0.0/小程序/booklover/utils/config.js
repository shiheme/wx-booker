//配置域名,域名只修改此处。
var DOMAIN = "www.mzter.com";
var WEBSITENAME = "建始同城共享书"; //网站名称
var PAYTEMPPLATEID = 'yleZT29M7X2DPkIW0GGaNRD53v6Lke-oVPz7GKnB5SI';//鼓励消息模版id
var REPLAYTEMPPLATEID = 'IiAVoBWP34u1uwt801rI_Crgen7Xl2lvAGP67ofJLo8';//回复评论消息模版id
var LOGO = ""; // 网站的logo图片
//设置downloadFile合法域名,不带https ,在中括号([])里增加域名，格式：{id=**,domain:'www.**.com'}，用英文逗号分隔。
//此处设置的域名和小程序与小程序后台设置的downloadFile合法域名要一致。
var DOWNLOADFILEDOMAIN = [
  { id: 1, domain: 'www.mzter.com' },
  { id: 2, domain: 'wx.qlogo.cn' }

];

export default {
  getDomain: DOMAIN,
  getWebsiteName: WEBSITENAME,
  getPayTemplateId: PAYTEMPPLATEID,
  getReplayTemplateId: REPLAYTEMPPLATEID,
  getLogo: LOGO,
  getDownloadFileDomain: DOWNLOADFILEDOMAIN
}