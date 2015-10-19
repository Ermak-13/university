$(document).ready(function() {
    $('a[href^=#day]').click(function() {
        var o = $(this);
        $('a[href^=#day]').attr('class', 'pseudo');
        $('a[href='+o.attr('href')+']').attr('class', 'act');
        $('div[id^=day]').hide();
        $(o.attr('href')).show();
        return false;
    });


        $('div.sprogramm div.report').hover(
            function() {$(this).addClass('h');},
            function() {$(this).removeClass('h');}
        );
        $('div.sprogramm div.report, div.sprogramm div.report a[href^=#more]').click(function() {
            var o = $(this);
            if(o.is('a')) o = o.parents('div.report');
            
            if(o.hasClass('h')) o.removeClass('h');
            else {
                $('div.sprogramm div.report').removeClass('h');
                o.addClass('h');
            }
            
            if($(this).is('a')) return false;
        });

    $('#reg_link > a').click(
        function() {
            toggler.exec('form_registration');
            return false;
        }
    );
    
    // авторизация
    function beforeSubmit() {
			$('.error').hide();
            $('#enter_btn').hide();
            $('#login_loading').show();
		}
		
    function errorSubmit(data) {
        $("#error").html(data.responseText).fadeIn();
        $('#enter_btn').show();
        $('#login_loading').hide();
    }
    
    function successSubmit(data) {
        $('#enter_btn').show();
        $('#login_loading').hide();
        if (data.status=='success') {
            document.location.href = data.href;
        } else {
            for (i=0; i<data.errors.length; i++) {
                $('#error_'+data.errors[i]).fadeIn();
            }
        }
    }
    
    $("#login_form").submit(function() {
        $(this).prepend('<input type="hidden" name="ajax_flag" value="1" />');
        
        var options = {
            beforeSubmit:	beforeSubmit,
            success:		successSubmit,
            error:			errorSubmit,
            timeout:		3000,
            dataType:		'json'
        }		

        $(this).ajaxSubmit(options);
        return false;
    });
    
    $('#openid_form').submit(function() {
        var v = $('input[name=openid_account]').val();
        if (!v) {
            $('#openid_account_error').show();
            return false;
        }
    });
    
    $('#lj_form').submit(function() {
        var v = $('input[name=lj_account]').val();
        if (!v) {
            $('#lj_account_error').show();
            return false;
        }
    });
	
	twitter.init();
});

toggler = {
    prev: '',
    expect: 'form_registration',
    
    exec: function(id) {
        var obj = $('#'+id);
        if (toggler.prev && toggler.prev != toggler.expect) {
            $('#'+toggler.prev).animate({height: "hide"});
        }
        if (obj.css('display').toLowerCase() == 'none') {
            obj.animate({height: "show"});
        } else {
            obj.animate({height: "hide"});
        }
        toggler.prev = id;
        return false;
    }
}
    
report_vote = function(obj, mode, interesting) {
    var $obj = $(obj);
    var link = $obj.attr('href');
    var args = link.split('/');
    var id = args[args.length-2];

    $.getJSON(link, function(data) {
        if (!data.can_vote) {
            $obj.parent().html('<a href="/members/register/">Зарегистрируйтесь</a>, чтобы голосовать');
            return false
        }
        
        if (data.can_go) {
            var text = 'Мне интересно';
        } else {
            var text = 'Я передумал';
        }
        $('#main_vote_link_'+id).html(text);
		
        if (mode == 'inner') {
            $obj.html(text).parent().prev().find('span').html(data.count);
        } else {
            $('#ivote_'+id).html(data.count);
            $('#fvote_'+id).html(data.count);
            $('#vote_'+id).html(data.count);
			if (interesting && interesting !== undefined) {
				var parent = $obj.parent();
				parent.prev().prev().remove();
				parent.prev().remove();
				parent.next().remove();
				parent.remove();
			} else {
				$obj.html(text).next().find('span').html(data.count);
			}
        }
    });
    return false;
}

report_like = function(obj, mode, interesting) {
    var $obj = $(obj);
    var link = $obj.attr('href');
    $.getJSON(link, function(data) {
        if (data.can_like) {
            var text = 'Мне интересно';
        } else {
            var text = 'Я передумал';
        }
        if (mode == 'inner') {
            $obj.html(text).parent().prev().find('span').html(data.count);
        } else {
			if (interesting && interesting !== undefined) {
				var parent = $obj.parent();
				parent.prev().prev().remove();
				parent.prev().remove();
				parent.next().remove();
				parent.remove();
			} else {
				$obj.html(text).next().find('span').html(data.count);
			}
        }
    });
    return false;
}

twitter = {
	c: null,
	
	init:function() {
                    if(document.location.pathname == '/') {
                        $('div.twitter_block').height(560);
                    }
		this.c = $('#twitter-block-moving');
		if(this.c.children().length > 1) {
			setTimeout(twitter.move, 5000);
		}
	},
	
	move:function() {
		var $o = $($('p.twit', twitter.c)[0]);
		twitter.c.animate({'marginTop': -95}, 300, 'swing', function() {
			twitter.c.append($o).css({'marginTop': 0});
			setTimeout(twitter.move, 5000);
		});
	},
        
        progress: false, 
        page: 0, 
        max: 0, 
        load: function() {
            var loader = $('#loader');
            if(loader.length == 0) {
                loader = $('<div/>').attr('id', 'loader').html('<img src="/img/bullets/indicator.gif" alt="..." /> Подождите, идёт загрузка...').appendTo($('#programs'));
            }
            
            if(getScrollMaxY() - window.scrollY <= 250) {
                if(!twitter.progress && twitter.page <= twitter.max) {
                    twitter.progress = true;
                    loader.show();
                    $.get('/twitter/load/'+twitter.page+'/', function(res) {
                        if(!res.match(/\-end\-/)) {
                            loader.before(res);
                            twitter.page += 1; 
                            twitter.progress = false;
                        }
                        loader.hide();
                    });
                }
            }
        }
}

    
    function getScrollMaxY(){ 

        var innerh;

        if (window.innerHeight){
            innerh = window.innerHeight;
        }else{
            innerh = document.body.clientHeight;
        }

        if (window.innerHeight && window.scrollMaxY){
            // Firefox 
            yWithScroll = window.innerHeight + window.scrollMaxY; 
        } else if (document.body.scrollHeight > document.body.offsetHeight){ 
            // all but Explorer Mac 
            yWithScroll = document.body.scrollHeight; 
        } else { 
            // works in Explorer 6 Strict, Mozilla (not FF) and Safari 
            yWithScroll = document.body.offsetHeight; 
        } 
        return yWithScroll-innerh; 
    }
    
featured = {
    cash: {},
    speed: 5400,
    timer: null, 
    
    vote_for: function(obj) {
        var $obj = $(obj);
        var url = $obj.attr('href');
        var attrs = url.split('/');
        attrs.pop();
        var id = attrs.pop();
        
        this.cash[id] = null;
        
        $.getJSON(url, function(data) {
            if (!data.can_vote) {
                $obj.parent().html('<a href="/members/register/">Зарегистрируйтесь</a>, чтобы голосовать');
                return false
            }
            
            //$obj.next().find('span').html(data.count);
            $('#ivote_'+id).html(data.count);
            $('#vote_'+id).html(data.count);
            if(data.can_go) {
                $obj.html('Мне интересно');
                $('#vote_link_'+id).html('Мне интересно');
            } else {
                $obj.html('Я передумал');
                $('#vote_link_'+id).html('Я передумал');
            }
        });
        return false;
    },

    get_info: function(obj) {
        var $obj = $(obj);
        var id = $obj.attr('href').replace(/[^0-9]+/, '');
        
        $('li.active_man').find('span').hide().end().find('a').show().end().removeClass('active_man');
        $obj.parent().append('<span>'+$obj.html()+'</span>').addClass('active_man');
        $obj.hide();
        
        if (!this.cash[id]) {
            var that = this;
            var lang = document.location.pathname.replace(/\/+/g, '') == 'en' ? 'en' : 'ru';
            $('#active_featured .col_wrap').html('<p><img src="/img/bullets/indicator.gif" alt="Загрузка"/> Загрузка...</p>');
            $.get('/get_info/'+id+'/'+lang+'/', function(data) {
                that.cash[id] = data;
                $('#active_featured .col_wrap').html(data);
                featured.step();
            });
        } else {
            $('#active_featured .col_wrap').html(this.cash[id]);
            featured.step();
        }
        return false;
    },
    
    step: function() {
        if(featured.timer) clearTimeout(featured.timer);
        
        featured.timer = setTimeout(function() {
            var l = $('ul.featured_list');
            var a = $('li.active_man', l);
            var n = a.next();
            if(!n || n.length == 0) n = $('li:first-child', l);
            
            $('a', n).click();
        }, featured.speed);
    }
}

/*fresh = {
    speed: 10400,
    start: function() {
        setTimeout(fresh.rotate, fresh.speed);
    },
    rotate: function() {
        var fr = $('#fresh_reports');
        var obj = $(fr.find('.program')[0]);
        obj.animate({marginTop: '-245px'}, 'slow', function() {
            var n = obj.next();
            fr.append(obj);
            obj.css('margin-top', 0);
            setTimeout(fresh.rotate, fresh.speed);
        });
    }
}*/

tabs = {
    cb: null, 
    
    show: function(n) {
        $('#jm-tab-'+n).parent().find('div.jm-tab-cnt').removeClass('at').end().end().addClass('at');
        $('a[href=#tabs\\/show\\/'+n+']').parents('li').parent().find('li.at').removeClass('at').end().end().addClass('at');
        
        if(tabs.cb !== undefined) {
            tabs.cb($('a[href=#tabs\\/show\\/'+n+']'));
        }
    },
    
    init:function(opts) {
        $('a[href^=#tabs]').live('click', function() {
            $(this).parents('li').click();
            return false;
        });
        
        if(opts.callback !== undefined) {
            tabs.cb = opts.callback;
        }
        
        $('li.jm-tab').live('click', function() {
            var attrs = $('a[href^=#tabs]', this).attr('href').replace('#', '').split('/');
            
            if(attrs.length == 0) return false;
        
            var o = attrs.shift();
            var a = attrs.shift();
            if(!a) return;
            var eo = eval(o);
            if(eo !== undefined && eo[a] !== undefined) eo[a].apply(o, attrs);
        });
        
        /*tabs.resize();
        $(window).resize(function() {
            setTimeout(function() {
                tabs.resize();
            }, 200);
        });*/
    },
    
    resize: function() {
        $('ul.jm-tabs').each(function() {
            var list = $('li', this).css({'height': 'auto'});
            var max_height = 0;
            var o = null;
            for(var i = 0; i< list.length; i++) {
                o = $(list[i]);
                if(o.height() > max_height) max_height = o.height();
            }
            list.each(function() {
                $(this).height(max_height);
            });
            $(this).height(max_height-5);
        });
    }
}

function slide_to(id, position) {
    if(position === undefined) position = false;
    var p = 0;
    if(position) {
        p = id;
    } else {
        var o = $('#'+id);
        if(!o.length) return false;
        
        p = o.position().top;
    }
    
    $('body,html').animate({'scrollTop': p}, 700, 'swing');
}

in_programm = {
    cash: {},
    speed: 5400,
    timer: null, 
    
    vote_for: function(obj) {
        var $obj = $(obj);
        var url = $obj.attr('href');
        var attrs = url.split('/');
        attrs.pop();
        var id = attrs.pop();
        
        this.cash[id] = null;
        
        $.getJSON(url, function(data) {
            if (!data.can_vote) {
                $obj.parent().html('<a href="/members/register/">Зарегистрируйтесь</a>, чтобы голосовать');
                return false
            }
            
            //$obj.next().find('span').html(data.count);
            $('#ivote_'+id).html(data.count);
            $('#vote_'+id).html(data.count);
            if(data.can_go) {
                $obj.html('Мне интересно');
                $('#vote_link_'+id).html('Мне интересно');
            } else {
                $obj.html('Я передумал');
                $('#vote_link_'+id).html('Я передумал');
            }
        });
        return false;
    },

    get_info: function(obj) {
        var $obj = $(obj);
        var id = $obj.attr('href').replace(/[^0-9]+/, '');
        
        $('li.active_man').find('span').hide().end().find('a').show().end().removeClass('active_man');
        $obj.parent().append('<span>'+$obj.html()+'</span>').addClass('active_man');
        $obj.hide();
        
        if (!this.cash[id]) {
            var that = this;
            var lang = document.location.pathname.replace(/\/+/g, '') == 'en' ? 'en' : 'ru';
            $('#active_featured .col_wrap').html('<p><img src="/img/bullets/indicator.gif" alt="Загрузка"/> Загрузка...</p>');
            $.get('/reports/get_report_data/'+id+'/'+lang+'/', function(data) {
                that.cash[id] = data;
                $('#active_featured .col_wrap').html(data);
                featured.step();
            });
        } else {
            $('#active_featured .col_wrap').html(this.cash[id]);
            featured.step();
        }
        return false;
    },
    
    step: function() {
        if(featured.timer) clearTimeout(featured.timer);
        
        featured.timer = setTimeout(function() {
            var l = $('ul.featured_list');
            var a = $('li.active_man', l);
            var n = a.next();
            if(!n || n.length == 0) n = $('li:first-child', l);
            
            $('a', n).click();
        }, featured.speed);
    },
    
    init: function() {
        $('a[href^=#report]').click(function() {
            in_programm.get_info(this);
            
            return false;
        })
    }
}

$(document).ready(function() {
    in_programm.init();
    in_programm.step();
});