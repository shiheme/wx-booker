

(function ($) {

	$(document).ready(function () {

		//小鱼哥 给发布文章加自定从豆瓣抓取图书信息
		$("#bookautomsg a").click(function () {

			// loading
			//this.showLoading();
			var isbn = $("input[name='pods_meta_book_isbn']").attr('value');
			if(!isbn) {
				$("#bookautomsg span").text('请先输入ISBN');
			} else {
				// query
				$.ajax({
					url: ajaxurl,
					type: 'post',
					dataType: 'json',
					async: false,
					data: {
						action: 'automsglibrary',
						isbn: isbn
					},
					timeout:15000,
					beforeSend:function(){
						$("#bookautomsg a").hide();
						$("#bookautomsg span").text('正在抓取，请稍等...');
					},
					success: function (json) {
						console.log(json);
						
						if (!json.title) {
							$("#bookautomsg a").show();
							$("#bookautomsg span").css('color','red').text('没有输出内容，请检查ISBN是否输出正确')
						}
						if (json.translator) {
							var translator = ' / ' + json.translator
						}
						if (json.publisher) {
							var publisher = ' / ' + json.publisher
						}
						if (json.published) {
							var published = ' / ' + json.published
						}


						// update vars
						$("input[name='pods_meta_book_dbid']").val(json.id);
						$("input[name='pods_meta_book_title']").val(json.title);
						$("input[name='pods_meta_book_price']").val(json.price);

						$("input[name='pods_meta_book_author']").val(json.author[0].name);
						$("input[name='pods_meta_book_translator']").val(json.translator);
						$("input[name='pods_meta_book_publisher']").val(json.publisher);
						$("input[name='pods_meta_book_published']").val(json.published);
						$("input[name='pods_meta_book_page']").val(json.page);
						$("input[name='pods_meta_book_designed']").val(json.designed);

						$("a#todoubanlink").attr('href', json.url).css('display', 'inline');
						$("a#todoubanlogo").attr('href', json.logo).css('display', 'inline');

						$("div.editor-post-excerpt textarea").val(json.author[0].name + translator + publisher + published);

					},
					complete: function () {
						//this.hideLoading();
						$("#bookautomsg a").show();
						$("#bookautomsg span").css('color','green').text('抓取完成～');
					}
				});
			}

		});



		//小鱼哥 开始增加一键将内容插入到隐藏区
		

		// 	var panlink = $("input[name='pods_meta_book_panlink']").val();
		// var pancode = $("input[name='pods_meta_book_pancode']").val();
		// var panmarks = $("textarea[name='pods_meta_book_panmarks']").val();

		// var cnt = '<ul>\n  <li>资源盘：</li>\n  <li><a href="'+panlink+'">点击获取</a></li>\n</ul>\n';
		// 	cnt += '<ul>\n  <li>提取码：</li>\n  <li><a href="'+pancode+'">点击获取</a></li>\n</ul>\n';
		// 	cnt += '<ul>\n  <li>资源盘备注：</li>\n  <li>\n    <p>'+panmarks+'</p>\n  </li>\n</ul>\n';


		$("#panlinktohidearea a").click(function () {
			var panlink = $("input[name='pods_meta_book_panlink']").val()?'<ul>\n  <li>资源盘：</li>\n  <li><a href="'+$("input[name='pods_meta_book_panlink']").val()+'">'+$("input[name='pods_meta_book_panlink']").val()+'(点击复制)</a></li>\n</ul>\n':'';
			var pancode = $("input[name='pods_meta_book_pancode']").val()?'<ul>\n  <li>提取码：</li>\n  <li><a href="'+$("input[name='pods_meta_book_pancode']").val()+'">'+$("input[name='pods_meta_book_pancode']").val()+'(点击复制)</a></li>\n</ul>\n':'';
			var panmarks = $("textarea[name='pods_meta_book_panmarks']").val()?'<ul>\n  <li>资源盘备注：</li>\n  <li>\n    <p>'+$("textarea[name='pods_meta_book_panmarks']").val()+'</p>\n  </li>\n</ul>\n':'';

			var panlinkcnt = panlink + pancode + panmarks;

			var text = $("textarea[name='pods_meta_book_videoadscnt']").val()+ panlinkcnt;
			$("textarea[name='pods_meta_book_videoadscnt']").val(text);

		});
		$("#panlink2tohidearea a").click(function () {
			var panlink = $("input[name='pods_meta_book_panlink2']").val()?'<ul>\n  <li>备用盘：</li>\n  <li><a href="'+$("input[name='pods_meta_book_panlink2']").val()+'">'+$("input[name='pods_meta_book_panlink2']").val()+'(点击复制)</a></li>\n</ul>\n':'';
			var pancode = $("input[name='pods_meta_book_pancode2']").val()?'<ul>\n  <li>提取码：</li>\n  <li><a href="'+$("input[name='pods_meta_book_pancode2']").val()+'">'+$("input[name='pods_meta_book_pancode2']").val()+'(点击复制)</a></li>\n</ul>\n':'';
			var panmarks = $("textarea[name='pods_meta_book_panmarks2']").val()?'<ul>\n  <li>备用盘备注：</li>\n  <li>\n    <p>'+$("textarea[name='pods_meta_book_panmarks2']").val()+'</p>\n  </li>\n</ul>\n':'';

			var panlinkcnt = panlink + pancode + panmarks;

			var text = $("textarea[name='pods_meta_book_videoadscnt']").val()+ panlinkcnt;
			$("textarea[name='pods_meta_book_videoadscnt']").val(text);

		});
		$("#fileopentohidearea a").click(function () {
			var fileopen = $("input.pods-form-ui-field-name-pods-meta-book-fileopen").val()?'<fileopen class="'+$("input.pods-form-ui-field-name-pods-meta-book-fileopen").val()+'" name="'+$("input.pods-form-ui-field-name-pods-meta-book-fileopen-title").val()+'">查看文件</fileopen>\n':'';
			
			var fileopencnt = fileopen;

			var text = $("textarea[name='pods_meta_book_videoadscnt']").val()+ fileopencnt;
			$("textarea[name='pods_meta_book_videoadscnt']").val(text);

		});

    	//小鱼哥 结束增加一键将内容插入到隐藏区

	});

})(jQuery);
