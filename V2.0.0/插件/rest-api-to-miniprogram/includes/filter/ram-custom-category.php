<?php 

function custom_fields_rest_prepare_category( $data, $item, $request ) {      
    $category_thumbnail_image='';
    $temp='';
    $openid= $request["openid"];
    $subscription =getSubscription($openid);
    $id =(string)$item->term_id;
    if(empty($subscription))
    {
        $data->data['subimg'] ="subscription.png"; 
        $data->data['subflag'] ="0"; 
    }
    else
    {
        if(array_search($id,$subscription ))
        {        
            $data->data['subimg'] ="subscription-on.png"; 
            $data->data['subflag'] ="1"; 
        }
        else
        {
            $data->data['subimg'] ="subscription.png"; 
            $data->data['subflag'] ="0"; 

        }
    }
    

    if($temp=get_term_meta($item->term_id,'catcover',true))
    {
        $category_thumbnail_image=$temp;
      
    }
    elseif($temp=get_term_meta($item->term_id,'thumbnail',true));
    {
        $category_thumbnail_image=$temp;
    }
    
    $data->data['category_thumbnail_image'] =$category_thumbnail_image;  
    return $data;
}

function getSubscription($openid)
    {
        global $wpdb;        
        $user_id =0;        
        $user = get_user_by('login', $openid);
        $subscription= array();
        if($user)
        {
            $user_id = $user->ID;
            $usermeta = get_user_meta($user_id);
            if (!empty($usermeta))
            {                        
                if(!empty($usermeta['wl_sub']))
                {
                    $subscription=$usermeta['wl_sub'];
                } 
            }
            
        } 
        return $subscription;

    }
//**小鱼哥**开始 根据分类ID增加10个按浏览量排序的文章
    function custom_fields_rest_prepare_post( $data, $item, $request ) {      

        $limit=10;
        $catid=$item->term_id;
            global $wpdb, $post, $tableposts, $tablecomments, $time_difference, $post;
            date_default_timezone_set('Asia/Shanghai');
    
            //根据分类id查找文章                
            $sql="
                SELECT DISTINCT  ".$wpdb->posts.".ID as ID, post_title,post_excerpt, post_name, post_content,post_date 
                FROM ".$wpdb->posts." LEFT JOIN ".$wpdb->postmeta." ON ".$wpdb->posts.".ID = ".$wpdb->postmeta.".post_id,".$wpdb->term_relationships.",".$wpdb->term_taxonomy." 
                WHERE ID=object_id 
                AND ".$wpdb->term_relationships.".term_taxonomy_id = ".$wpdb->term_taxonomy.".term_taxonomy_id 
                AND post_status = 'publish' 
                AND ".$wpdb->term_relationships.".term_taxonomy_id =".$catid."
                ORDER BY ID DESC 
                LIMIT ". $limit;
            $mostcommenteds = $wpdb->get_results($sql);
            $posts =array();  
            foreach ($mostcommenteds as $post) {
                    $post_id = (int) $post->ID; 
                    $post_title = stripslashes($post->post_title);
                    
                    $_data["book_foreground"] = get_post_meta( $post_id,'book_foreground'); //前景色
                    $_data["book_background"] = get_post_meta( $post_id,'book_background'); //背景色
                    $_data["book_pagestyle"] = get_post_meta( $post_id,'book_pagestyle'); //色系
                   
                    $_data["post_id"]  =$post_id;
                    $_data["post_title"] =$post_title;
  
                    $images =getPostImages($post->post_content,$post_id);         
                    
                    // $_data['post_thumbnail_image']=$images['post_thumbnail_image'];
                    // $_data['content_first_image']=$images['content_first_image'];
                    // $_data['post_medium_image_300']=$images['post_medium_image_300'];
                    // $_data['post_thumbnail_image_624']=$images['post_thumbnail_image_624']; 
                    // $_data['post_frist_image']=$images['post_frist_image'];
                    $_data['post_medium_image']=$images['post_medium_image'];
                    // $_data['post_large_image']=$images['post_large_image'];
                    // $_data['post_full_image']=$images['post_full_image'];
                    // $_data['post_all_images']=$images['post_all_images'];         
                                
                    $posts[] = $_data;    
                    
            }
    
    
        $data->data['posts'] =rest_ensure_response($posts);    
        return $data;
    }
 //**小鱼哥**结束


/*********   给分类添加微信小程序封面 *********/

add_action( 'category_add_form_fields', 'weixin_new_term_catcover_field' );
function weixin_new_term_catcover_field() {
    wp_nonce_field( basename( __FILE__ ), 'weixin_app_term_catcover_nonce' ); ?>

    <div class="form-field weixin-app-term-catcover-wrap">
        <label for="weixin-app-term-catcover">微信小程序封面</label>
        <input type="url" name="weixin_app_term_catcover" id="weixin-app-term-catcover"  class="type-image regular-text" data-default-catcover="" />
    </div>
<?php }
add_action( 'category_edit_form_fields', 'weixin_edit_term_catcover_field' );
function weixin_edit_term_catcover_field( $term ) {
    $default = '';
    $catcover   = get_term_meta( $term->term_id, 'catcover', true );

    if ( ! $catcover )
        $catcover = $default; ?>

    <tr class="form-field weixin-app-term-catcover-wrap">
        <th scope="row"><label for="weixin-app-term-catcover">微信小程序封面</label></th>
        <td>
            <?php echo wp_nonce_field( basename( __FILE__ ), 'weixin_app_term_catcover_nonce' ); ?>
            <input type="url" name="weixin_app_term_catcover" id="weixin-app-term-catcover" class="type-image regular-text" value="<?php echo esc_attr( $catcover ); ?>" data-default-catcover="<?php echo esc_attr( $default ); ?>" />
        </td>
    </tr>
<?php }

add_action( 'create_category', 'weixin_app_save_term_catcover' );
add_action( 'edit_category',   'weixin_app_save_term_catcover' );

function weixin_app_save_term_catcover( $term_id ) {
    if ( ! isset( $_POST['weixin_app_term_catcover_nonce'] ) || ! wp_verify_nonce( $_POST['weixin_app_term_catcover_nonce'], basename( __FILE__ ) ) )
        return;

    $catcover = isset( $_POST['weixin_app_term_catcover'] ) ? $_POST['weixin_app_term_catcover'] : '';

    if ( '' === $catcover ) {
        delete_term_meta( $term_id, 'catcover' );
    } else {
        update_term_meta( $term_id, 'catcover', $catcover );
    }
}

/*********  *********/