    last_comment_id = 0;

    $(document).ready(function() {
        $('a[href^=#answer-]').live('click', function() {
            var rf = $('#reply_form_div');
            var o = $(this);
            var id = o.attr('href').replace('#answer-', '');
            
            cancel_comment();

            if(last_comment_id != id) {
                $('#comment-'+id+' > .rc_children').append(rf);
            }
            $('#comment-'+id).addClass('active').find('div.overlay_plate:first').show();
            rf.find('input[name=parent_id]').val(id);
            rf.show();
            $('#comment_fld').focus();
            last_comment_id = id;

            o.hide();
        });
        
        $('a[href=#send]').live('click', function() {
            $(this).parents('form').submit();
            return false;
        });
        
        $('a[href=#cancel]').live('click', function() {
            cancel_comment();
            return false;
        });

        $('#comment_form').submit(function() {
            var f = $(this);
            var options = {
                success: function(data) {
                    if(data == 'error') {
                        
                    } else if(data == 'notext') {
                        
                    } else {
                        $('#comment_list').append(data);
                        var a = $('#comment_list').find('a[name^=comment]:last');
                        init_answers();
                        $('#nocomments').remove();
                        slide_to(a.offset().top, true);
                        f.clearForm();
                    }
                }
            }

            f.ajaxSubmit(options);
            return false;
        });

        $('#reply_form').submit(function() {
            var f = $(this);
            var options = {
                success: function(data) {
                    if(data == 'error') {
                        
                    } else if(data == 'notext') {
                        
                    } else {
                        $('#reply_form_div').before(data).hide();
                        cancel_comment();
                        init_answers();
                        f.clearForm();
                    }
                }
            }

            f.ajaxSubmit(options);
            return false;
        });
        
        init_answers();
        
        $('#comment_fld_static, #comment_fld').focus(function() {
            $(this).prev().hide();
        }).blur(function() {
            var o = $(this);
            if(!o.val().replace(/\s*/, '')) o.prev().show();
        }).keydown(function(e) {
            if(e.keyCode == 13) {
                $(this).parents('form').submit();
                return false;
            }
        });
        
        $(document).keydown(function(e) {
            if($('div.report_comment.active').length) {
                if(e.keyCode == 27) {
                    cancel_comment();
                    return false;
                }
            }
        })
    });


    function init_answers() {
        $('div.comment_cnt').hover(function() {
            if(!$(this).parent().hasClass('active')) {
                $('div.overlay_plate', this).show();
                $('a.answer', this).show();
            }
        }, function() {
            if(!$(this).parent().hasClass('active')) {
                $('div.overlay_plate', this).hide();
                $('a.answer', this).hide();
            }
        });
        
        $("p.button_container").hide();
        $("p.link_container").show();
        $('a.answer').hide();
    }
    
    function cancel_comment() {
        $('#reply_form_div').hide().find('form').clearForm();
        $('#answer-'+last_comment_id).show();
        $('#comment-'+last_comment_id).removeClass('active').find('div.overlay_plate').hide().end().find('a.answer').hide();
    }