<?php
/*
Plugin Name: REST API TO MiniProgram
Plugin URI: http://www.watch-life.net
Description: 为微信小程序、app提供定制WordPress REST API 输出.支持微信支付、微信小程序模板消息.
Version: 1.6.0
Author: jianbo
Author URI: http://www.minapper.com
License: GPL v3
WordPress requires at least: 4.7.1
*/


define('REST_API_TO_MINIPROGRAM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('REST_API_TO_MINIPROGRAM_PLUGIN_FILE',__FILE__);
define('XY_PLUGIN_NAME', trim(dirname(plugin_basename(__FILE__)), '/'));
define('XY_PLUGIN_URL', plugins_url() . '/' . XY_PLUGIN_NAME);
const REST_API_TO_MINIPROGRAM_PLUGIN_NAME='rest-api-to-miniprogram';

include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/ram-util.php' );
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/ram-api.php' );
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/ram-weixin-api.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/settings/wp-wechat-config.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/settings/wp-post-config.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/filter/ram-custom-comment-fields.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/filter/ram-custom-content.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/filter/ram-custom-post-fields.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/filter/ram-custom-category.php');
include(REST_API_TO_MINIPROGRAM_PLUGIN_DIR . 'includes/filter/ram-custom-users-columns.php');

if ( ! class_exists( 'RestAPIMiniProgram' ) ) {

    class RestAPIMiniProgram {
        public $wxapi = null;
        public function __construct() {
            //定制化内容输出，对pc端和api都生效
            add_filter( 'the_content', 'custocm_content_filter' );
            //对文章的自定义输出
            add_filter( 'rest_prepare_post', 'custom_post_fields', 10, 3 ); 
            //对页面的自定义输出
			add_filter( 'rest_prepare_page', 'custom_post_fields', 10, 3 );           
            //对评论的自定义输出
            add_filter( 'rest_prepare_comment', 'custom_comment_fields', 10, 3 );
            add_filter( 'rest_prepare_category', 'custom_fields_rest_prepare_category', 10, 3 ); //获取分类的封面图片

            //**小鱼哥**开始 增加分类下显示10篇文章的钩子 */
            //对书目的自定义输出
			add_filter( 'rest_prepare_library', 'custom_post_fields', 10, 3 );       
            //对活动的自定义输出
            add_filter( 'rest_prepare_act', 'custom_post_fields', 10, 3 ); 
            //对帮助的自定义输出
            add_filter( 'rest_prepare_faq', 'custom_post_fields', 10, 3 );  
            
            add_filter( 'rest_prepare_category', 'custom_fields_rest_prepare_post', 10, 3 );
            add_filter( 'rest_prepare_library_cats', 'custom_fields_rest_prepare_post', 10, 3 );
            //**小鱼哥**结束 增加分类下显示10篇文章的钩子 */

            add_filter( 'manage_users_columns', 'users_columns' );
			add_action( 'manage_users_custom_column', 'output_users_columns', 10, 3 );
			


            //更新浏览次数（pc）
            add_action('wp_head', 'addPostPageviews');

            //获取浏览次数（pc）
            //add_filter('raw_post_views', 'post_views');

            
            // 管理配置 
            if ( is_admin() ) {             
                //小鱼哥 开始 注册脚本
                add_action( 'admin_enqueue_scripts', 'xy_register_plugin_scripts_and_styles'); //给后台发布文章增加antomsg脚本
                //小鱼哥 结束 注册脚本
                //new WP_Category_Config();
               add_action('admin_menu', 'weixinapp_create_menu');
               add_filter( 'plugin_action_links', 'ram_plugin_action_links', 10, 2 );
               wp_post_config();
                 
            }

            new RAM_API();//api
            $this->wxapi = new RAW_Weixin_API();


        }

        

    }


    // 实例化并加入全局变量
    $GLOBALS['RestAPIMiniProgram'] = new RestAPIMiniProgram();
    
    function RAW() {
        
        if( ! isset( $GLOBALS['RestAPIMiniProgram'] ) ) {
            $GLOBALS['RestAPIMiniProgram'] = new RestAPIMiniProgram();
        }
        
        return $GLOBALS['RestAPIMiniProgram'];
    }
    //小鱼哥开始 注册脚本
    function xy_register_plugin_scripts_and_styles() {
		wp_register_script( 'automsg',XY_PLUGIN_URL . '/xy_custom/automsg.js');
		wp_enqueue_script('automsg');
    }
    //小鱼哥结束 注册脚本
    //小鱼哥 开始增加自动获取豆瓣书影音脚本
    add_action('wp_ajax_nopriv_automsglibrary', 'automsglibrary_callback');
    add_action('wp_ajax_automsglibrary', 'automsglibrary_callback');

    //剪切
    function cut($content,$start,$end) {
    $r = explode($start, $content);
    if (isset($r[1])) {
    $r = explode($end, $r[1]);
    return $r[0];
    }
    return '';
    }
    //模拟get请求
    function get($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/536.7 (KHTML, like Gecko) Chrome/20.0.1099.0 Safari/536.7 QQBrowser/6.14.15493.201');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
    }
    

    function automsglibrary_callback() {
        $isbn=$_POST['isbn'];
        $surl = 'https://book.douban.com/isbn/'.$isbn.'/';
        $headers = json_encode(get_headers($surl),true);
        $headers = json_encode($headers,true);
        $surl  = cut($headers,'Location: ','"');
        $surl  = str_replace('\\','' ,$surl);//302地址
        $search = array(" ","　","\n","\r","\t");
        $replace = array("","","","","");
        $data = get($surl);
        $data_1=cut($data,'application/ld+json">','</script>');
        $data_1 = json_decode($data_1,true);
        $res['isbn'] = $isbn;
        $res['title'] = $data_1['name'];//书名
        
        $authors = $data_1['author'];
        if(!empty($authors)){
        $__authors = '';
        foreach($authors as $author){
            $__authors .= sprintf('%1$s ',
            $author['name']
            );
        }
        $res['author'] = $__authors; //作者
        }
        
        $res['url'] = $data_1['url'];//书名
        
        $res['id'] = cut($res['url'],'subject/','/');
        
        $res['logo'] = cut($data,'data-pic="','"');//图标
        
        $publisher_txt = cut($data,'出版社:</span>','<br/>');
        $publisher = str_replace($search, $replace, $publisher_txt);
        $res['publisher'] =$publisher;//出版社
        
        $published_txt = cut($data,'出版年:</span>','<br/>');
        $published = str_replace($search, $replace, $published_txt);
        $res['published'] =$published;//出版年
        
        $page_txt = cut($data,'页数:</span>','<br/>');
        $page = str_replace($search, $replace, $page_txt);
        $res['page'] =$page;//页数
        
        $translator_html = cut($data,'译者</span>:','</span><br/>');
        $translator_txt = strip_tags($translator_html);
        $translator = str_replace($search, $replace, $translator_txt);
        $res['translator'] =$translator;//译者
        
        $price_txt = cut($data,'定价:</span>','<br/>');
        $price = str_replace($search, $replace, $price_txt);
        if($price==''){
        $price ='未知';
        }
        $res['price'] =$price;//定价
        
        $designed_txt = cut($data,'装帧:</span>','<br/>');
        $designed = str_replace($search, $replace, $designed_txt);
        $res['designed'] =$designed;//装帧
        
        // $description = cut($data,'class="intro">','</p>');
        // $description = explode('<p>',$description)[1];
        // if($description==''){
        //   $description ='未知';
        // }
        // $res['description'] =$description;//简介
        
        
        $res = json_encode($res,true);
        echo $res;

        exit;
    }
    //小鱼哥 结束增加自动获取豆瓣书影音脚本
    //小鱼哥 开始增加短代码
    function wp_book_videoadscnt_shortcode(){
        global $post;
        $id = $post->ID;

        if(implode("", get_post_meta( $id, 'book_videoadslol')) != '2' ){
            $info="[book_videoadscnt]未设置！";
        } else {
            $info="<videolook name='".implode("", get_post_meta( $id, 'book_videoadstit'))."'>";
            $info .=implode("", get_post_meta( $id, 'book_videoadscnt'));
            $info .="</videolook>";
        }
        return $info;
     }
    add_shortcode('book_videoadscnt', 'wp_book_videoadscnt_shortcode');
    //小鱼哥 结束增加短代码

    function ram_plugin_action_links( $links, $file ) {
        if ( plugin_basename( __FILE__ ) !== $file ) {
            return $links;
        }

        $settings_link = '<a href="https://www.minapper.com/" target="_blank"> <span style="color:#d54e21; font-weight:bold;">' . esc_html__( '升级增强版', 'REST API TO MiniProgram' ) . '</span></a>';

        array_unshift( $links, $settings_link );

        $settings_link = '<a href="https://www.minapper.com/" target="_blank"> <span style="color:#d54e21; font-weight:bold;">' . esc_html__( '升级专业版', 'REST API TO MiniProgram' ) . '</span></a>';

        array_unshift( $links, $settings_link );


        $settings_link = '<a href="https://www.watch-life.net/" target="_blank"> <span style="color:green; font-weight:bold;">' . esc_html__( '技术支持', 'REST API TO MiniProgram' ) . '</span></a>';

        array_unshift( $links, $settings_link );

        $settings_link = '<a href="admin.php?page=weixinapp_slug">' . esc_html__( '设置', 'REST API TO MiniProgram' ) . '</a>';

        array_unshift( $links, $settings_link );

        return $links;
    }

}
