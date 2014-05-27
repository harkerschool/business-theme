(function($) {

    $(document).ready( function() { 
        
        // awesome bar
        $('body').hkrAwesomeBar({
            grayscale: true,
            templateURL: '//www.harker.org/uploaded/plugins/awesome-bar/awesome-bar.tpl.html', 
            success: function() {
                $('#topcontainer').stick();
            }
        });

    });

    $(window).load( function() {
        var $nav = $(), 
            $sections = $();

        $nav = $('.primary-nav > ul').lavalamp({
            duration: 800,
            offsetWidth: -16,
            exclude: '.back-to-top'
        });

        $sections = $('.panel, #bottomcontainer').slidingSections({
            duration: 800,
            cover: true,
            coverExclude: '#bottomcontainer',
            slidingNextExclude: '.panel:first-child',
            mousewheelSelector: '#bodydiv',
            beforeSlide: function( $target ) {
                var lavalamp = $nav.data('plugin_lavalamp');
                
                lavalamp.activateItem( 
                    $('a[href="#' + $target.attr('id') + '"]', lavalamp.$nav ).parent('li') 
                );

                $('.primary-nav select').val( '#' + $target.attr('id') );
            }
        });

        // dropdown menu
        $('.primary-nav').selectnav({
            onchange: function(nav) {
                var slidingSections = $.data( $sections, 'plugin_slidingSections' ),
                    target = $(nav).find("option:selected").val();

                if ( slidingSections ) {
                    target = ( target === '#top' ) ? 'html' : target;

                    slidingSections.slideTo( target );
                } else {
                    location.hash = target;
                }
            }
        });

    });

})(jQuery);
