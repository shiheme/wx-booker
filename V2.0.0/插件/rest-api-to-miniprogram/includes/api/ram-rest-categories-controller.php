<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


class RAM_REST_Categories_Controller  extends WP_REST_Controller{

    public function __construct() {
        
        $this->namespace     = 'watch-life-net/v1';
        $this->resource_name = 'category';
    }

     public function register_routes() {
        register_rest_route( $this->namespace, '/' . $this->resource_name.'/getsubscription', array(
            // Here we register the readable endpoint for collections.
            array(
                'methods'   => 'GET',
                'callback'  => array( $this, 'getSubscription' ),
                'permission_callback' => array( $this, 'get_item_permissions_check' ),
                'args'               => array(              
                    'openid' => array(
                        'required' => true
                    )
                )
                 
            ),
            // Register our schema callback.
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->resource_name.'/postsubscription', array(
            // Here we register the readable endpoint for collections.
            array(
                'methods'   => 'POST',
                'callback'  => array( $this, 'postSubscription' ),
                'permission_callback' => array( $this, 'post_item_permissions_check' ),
                'args'               => array(              
                    'openid' => array(
                        'required' => true
                    ),
                    'categoryid' => array(
                        'required' => true
                    )
                )
                 
            ),
            // Register our schema callback.
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );

        register_rest_route( $this->namespace, '/' . $this->resource_name.'/ids', array(
            // Here we register the readable endpoint for collections.
            array(
                'methods'   => 'GET',
                'callback'  => array( $this, 'get_categories_ids' ),
                //'permission_callback' => array( $this, 'get_item_permissions_check' )
                 
            ),
            // Register our schema callback.
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );

        //**小鱼哥**开始 定义通过传值获取自定义设置字段
        register_rest_route( $this->namespace, '/' . $this->resource_name.'/customset_bycnttp', array(
            // Here we register the readable endpoint for collections.
            array(
                'methods'   => 'GET',
                'callback'  => array( $this, 'get_customset_bycnttp' ),
                // 'permission_callback' => array( $this, 'get_item_permissions_check' ),
                 
            ),
            // Register our schema callback.
            'schema' => array( $this, 'get_public_item_schema' ),
        ) );
        //**小鱼哥**结束 定义通过传值获取自定义设置字段
        

    }

    

    public function postSubscription($request)
    {
        global $wpdb;
        $openid= $request['openid'];
        $categoryid=$request['categoryid'];
        $user_id =0;
        $user = get_user_by( 'login', $openid);
        if($user)
        {
            $user_id = $user->ID;
            if(!empty($user_id))
            {
                $sql =$wpdb->prepare("SELECT *  FROM ".$wpdb->usermeta ." WHERE user_id=%d and meta_key='wl_sub' and meta_value=%s",$user_id,$categoryid);
                $usermetas = $wpdb->get_results($sql);
                $count =count($usermetas);
                if ($count==0)
                {
                    
                    if(add_user_meta($user_id, "wl_sub",$categoryid,false))
                    {
                        $result["code"]="success";
                        $result["message"]= "订阅成功";
                        $result["status"]="200";    
                        
                    
                    }
                    else
                    {
                        $result["code"]="success";
                        $result["message"]= "订阅失败";
                        $result["status"]="500";                   
                        
                    }
                    
                }
                else
                {
                        if (delete_user_meta($user_id,'wl_sub',$categoryid))
                        {
                            
                                $result["code"]="success";
                                $result["message"]= "取消订阅成功";
                                $result["status"]="201";
                            
                            
                        }
                        else
                        {
                                $result["code"]="success";
                                $result["message"]= "取消订阅失败";
                                $result["status"]="501";                   
                                
                            
                        }

                }
            }
            else
            {
                $result["code"]="success";
                $result["message"]= "用户参数错误";
                $result["status"]="500";

            }

        }
        else
        {

            $result["code"]="success";
            $result["message"]= "用户参数错误";
            $result["status"]="500";

        }

        $response = rest_ensure_response($result);
        return $response;

    }

    public function getSubscription($request)
    {
        global $wpdb;
        $openid= $request['openid'];
        $user_id =0;
        $user = get_user_by( 'login', $openid);
        if($user)
        {
            $user_id = $user->ID;
            $usermeta = get_user_meta($user_id);
            if (!empty($usermeta))
            {
                    //$usermetaList =$wpdb->get_results($sql);        
                    $result["code"]="success";
                    $result["message"]= "获取订阅成功";
                    $result["status"]="200";                    
                    if(!empty($usermeta['wl_sub']))
                    {
                        $result["subscription"]=$usermeta['wl_sub'];
                        $substr=implode(",",$usermeta['wl_sub']);
                        $result["substr"]=$substr; 
                        $sql="SELECT SQL_CALC_FOUND_ROWS  ".$wpdb->posts.".ID ,".$wpdb->posts.".post_title  FROM ".$wpdb->posts."  LEFT JOIN ".$wpdb->term_relationships." ON (".$wpdb->posts.".ID = ".$wpdb->term_relationships.".object_id) WHERE 1=1  AND ( ".$wpdb->term_relationships.".term_taxonomy_id IN (".$substr.")) AND ".$wpdb->posts.".post_type = 'post' AND (".$wpdb->posts.".post_status = 'publish') GROUP BY ".$wpdb->posts.".ID ORDER BY ".$wpdb->posts.".post_date DESC LIMIT 0, 20";
                        $usermetaList =$wpdb->get_results($sql); 
                        $result["usermetaList"]=$usermetaList;

                    } 
            }
            else
            {
                $result["code"]="success";
                $result["message"]= "没有订阅的专栏";
                $result["status"]="501";                   
                    
                
            }
            
        }
        else
        {
            $result["code"]="success";
            $result["message"]= "用户参数错误";
            $result["status"]="501";                   
        }

        $response = rest_ensure_response($result);
        return $response; 

    }

    public  function  get_categories_ids()
    {
        $categoriesId =get_option('wf_display_categories');
        $result['Ids'] =$categoriesId;
        
        $response = rest_ensure_response($result); 
        return $response;
    }

    //**小鱼哥**开始 通过传值获取自定义设置字段
    public  function  get_customset_bycnttp($request)
    {
        if($request['cnt_tp']){$cnt_tp= $request['cnt_tp'];} else {$cnt_tp= pods_field_display('custom_set','pods-settings-custom_set','cnt_tp');}
        $result['cnt_tp'] = $cnt_tp;
        $result['open_mine_weather'] = pods_field_display('custom_set','pods-settings-custom_set','open_mine_weather'); //开启个人中心天气插件(高德) 
        $result['open_act_location'] = pods_field_display('custom_set','pods-settings-custom_set','open_act_location'); //开启活动商家坐标地图(高德) 
        $result['amap_key'] = pods_field_display('custom_set','pods-settings-custom_set','amap_key'); //高德KEY
        $result['amap_city'] = pods_field_display('custom_set','pods-settings-custom_set','amap_city'); //天气所在城市编码
        $result['img_dashang'] = pods_field_display('custom_set','pods-settings-custom_set','img_dashang'); //打赏馆长图片
        $result['img_conaut'] = pods_field_display('custom_set','pods-settings-custom_set','img_conaut'); //联系馆长图片
        $custom_set_type = 'custom_set_'.$cnt_tp;
        $pods_settings_type = 'pods-settings-custom_set_'.$cnt_tp;
        $result['cats_list_parentid'] = pods_field_display($custom_set_type,$pods_settings_type,'cats_list_parentid'); //首页父分类ID
        $result['cnt_index_mintit'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_index_mintit'); //首页主标题
        $result['cnt_index_subtit'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_index_subtit'); //首页副标题
        $result['cnt_unit'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_unit'); //计量单位
        $result['open_imptbtn'] = pods_field_display($custom_set_type,$pods_settings_type,'open_imptbtn'); //
         $result['cnt_nostock'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_nostock'); //
        $result['cnt_yesstock'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_yesstock'); //
        $result['cnt_verytips'] = pods_field_display($custom_set_type,$pods_settings_type,'cnt_verytips'); //
        
        $result['faq_list_id'] = pods_field_display($custom_set_type,$pods_settings_type,'faq_list_id'); //
        $result['act_list_id'] = pods_field_display($custom_set_type,$pods_settings_type,'act_list_id'); //

        $result['open_floatads'] = pods_field_display($custom_set_type,$pods_settings_type,'open_floatads'); //
        $result['floatads_image'] = pods_field_display($custom_set_type,$pods_settings_type,'floatads_image'); //
        $result['floatads_url'] = pods_field_display($custom_set_type,$pods_settings_type,'floatads_url'); //
        $result['floatads_location'] = pods_field_display($custom_set_type,$pods_settings_type,'floatads_location'); //

        $result['open_dtnavads'] = pods_field_display($custom_set_type,$pods_settings_type,'open_dtnavads'); //
        $result['dtnavads_ids'] = pods_field_display($custom_set_type,$pods_settings_type,'dtnavads_ids'); //
        $result['dtnavads_urltp'] = pods_field_display($custom_set_type,$pods_settings_type,'dtnavads_urltp'); //

        $result['open_dtqcode'] = pods_field_display($custom_set_type,$pods_settings_type,'open_dtqcode'); //
        $result['qcode_tit'] = pods_field_display($custom_set_type,$pods_settings_type,'qcode_tit'); //
        $result['qcode_qq'] = pods_field_display($custom_set_type,$pods_settings_type,'qcode_qq'); //
        $result['qcode_wx'] = pods_field_display($custom_set_type,$pods_settings_type,'qcode_wx'); //

        $response = rest_ensure_response($result); 
        return $response;
    }
    //**小鱼哥**结束 通过传值获取自定义设置字段

    public function post_item_permissions_check($request)
    {
        $openid= $request['openid'];
        $categoryid=$request['categoryid'];
        if(empty($openid) || empty($categoryid) )
        {
            return new WP_Error( 'error', '参数错误', array( 'status' => 500 ) );
        }
        else{
            if(!username_exists($openid))
            {
                return new WP_Error( 'error', '不允许提交', array( 'status' => 500 ) );
            }

        }

        return true;
    }

    public function get_item_permissions_check($request ) {
        $openid= $request['openid'];
        if(empty($openid) )
        {
            return new WP_Error( 'error', '参数错误', array( 'status' => 500 ) );
        }    
    
        else
        { 
            if(!username_exists($openid))
            {
                return new WP_Error( 'error', '不允许提交', array( 'status' => 500 ) );
            }
        
        }
        return true;
    }

}

