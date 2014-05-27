/* Sliding Sections for The Harker School | Joe Banks */
(function ( $, window, document, undefined ) {

    var pluginName = "slidingSections",
        defaults = {
            cover: false, // fit height of screen
            offset: 0, // offset height
            slidingExclude: '', // exclude panel from sliding
            coverExclude: '', // exclude panel from cover sizing
            duration: 500,
            mousewheelSelector: '',
            init: function(){},
            beforeSlide: function(){}
        },
        isAnimating = false,
        $window = $(window);

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.$sections = element;
        this.$active = $();
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var plugin = this;

            plugin.$sections = $(this.element).add('html');

            // go to active section
            var $active = plugin.$sections.filter(location.hash);
            if ( $active.length ) {
                $active.addClass('ss-active');
            } else {
                plugin.$sections.first().addClass('ss-active');
            }

            if ( Modernizr && ! Modernizr.touch ) {
                // resize panels
                if ( plugin.settings.cover ) {
                    plugin.resize();

                    $window.resize( function() {
                        plugin.resize();
                    });
                }

                // mousewheel behavior
                $(plugin.settings.mousewheelSelector).on('mousewheel', function(e) {
                    if ( e.deltaY === 0 ) {
                        return;
                    }

                    if ( isAnimating ) {
                        e.preventDefault();
                        return;
                    }

                    var $active = $('.ss-active'),
                        windowTop = $window.scrollTop(),
                        activeTop = $active.offset().top,
                        windowBottom = windowTop + $window.height(), 
                        activeBottom = activeTop + $active.outerHeight();
                    
                    if ( e.deltaY < 0 ) {
                        if (windowBottom < activeBottom) {
                            return;
                        }
                        e.preventDefault();
                        plugin.slideTo('next');
                    } else if ( e.deltaY > 0 ) {
                        if (windowTop > activeTop) {
                            return;
                        }
                        e.preventDefault();
                        plugin.slideTo('prev');
                    }
                });
            }

            // keyboard behavior
            $(document).on('keydown', function(e) {
                if ( !(e.which === 40 || e.which === 38) ) {
                    return;
                }
                
                e.preventDefault();
                if ( $('html,body').is(':animated') ) {
                    return;   
                }
                
                if ( e.which === 40 ) {
                    plugin.slideTo('next');
                } else if ( e.which === 38 ) {
                    plugin.slideTo('prev');
                }
            });

            // links
            $(document).on('click', 'a', function(e) {
                var anchor = $(this).attr('href');

                if ( undefined === anchor || '#' === anchor || '#top' === anchor ) {
                    e.preventDefault();
                    plugin.slideTo('html');
                }

                var $target = plugin.$sections.filter(anchor);

                if ( $target.length ) {
                    e.preventDefault();
                    plugin.slideTo(anchor);
                }
            });

            // custom code
            plugin.settings.init();
        },

        slideTo: function( target ) {
            var plugin = this,
                $sections = plugin.$sections,
                $active = $('.ss-active'),
                activeIndex = 0,
                targetIndex = 0,
                delay = 600;

            if ( plugin.settings.slidingExclude && ! $active.is(plugin.settings.slidingExclude) ) {
                $active.not(plugin.settings.slidingExclude);
            }
            
            if ( target === 'next' ) {
                if ( plugin.settings.slidingNextExclude && ! $active.is(plugin.settings.slidingNextExclude) ) {
                    $sections = $sections.not(plugin.settings.slidingNextExclude);
                }
                
                activeIndex = $sections.index( $active );
                
                targetIndex = ( activeIndex + 1 < $sections.length ) ? activeIndex + 1 : $sections.length - 1;
                $target = $sections.eq( targetIndex ); // next panel
            } else if ( target === 'prev' ) {
                if ( plugin.settings.slidingPrevExclude && ! $active.is(plugin.settings.slidingPrevExclude) ) {
                    $sections = $sections.not(plugin.settings.slidingPrevExclude);
                }

                activeIndex = $sections.index( $active );
                
                targetIndex = ( activeIndex - 1 >= 0 ) ? activeIndex - 1 : 0;
                $target = $sections.eq( targetIndex ); // previous panel
            } else {
                $target = $sections.filter(target);
                targetIndex = $sections.index( $target );
            }

            if ( ! $target.length ) {
                return;
            }

            // custom code
            plugin.settings.beforeSlide( $target );

            isAnimating = true;
            setTimeout( function() {
                isAnimating = false;
            }, plugin.settings.duration + delay );
            
            // tage active section
            $active.removeClass('ss-active');
            $target.addClass('ss-active');

            // tag active link
            $('.ss-active-link').removeClass('ss-active-link');
            $( 'a[href="#' + $target.attr('id') + '"]' ).addClass('ss-active-link');

            $('html,body').animate({
                scrollTop: $target.offset().top + plugin.settings.offset
            }, plugin.settings.duration, function() {
                if ( $target.attr('id') === undefined ) {
                    location.hash = 'top';
                } else {
                    location.hash = $target.attr('id');
                }
            });
        },

        resize: function() {
            var plugin = this,
                windowHeight = $window.height(),
                newHeight = windowHeight + plugin.settings.offset,
                originalHeight;

            $(plugin.element).not(plugin.settings.coverExclude + ', html').each( function() {
                var $section = $(this);

                // get original height
                $section.height('');
                originalHeight = $section.outerHeight();

                if ( originalHeight < windowHeight ) {
                    $section.height(newHeight);
                } 
            });
            $('html,body').scrollTop( $('.ss-active').offset().top + plugin.settings.offset );
        }
    };

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        if ( !$.data( this, "plugin_" + pluginName ) ) {
            $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
        }
        return this;
    };

})( jQuery, window, document );

/* Sticky Element for The Harker School | Joe Banks */
(function ( $, window, document, undefined ) {

    var pluginName = "stick",
        defaults = {};

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var $el = $(this.element),
                $window = $(window),
                $html = $('html'),
                stickyTop = $el.offset().top,
                stick = function() {
                    var scrollTop = $window.scrollTop();

                    if (scrollTop > stickyTop) {
                        $html.addClass('stick');
                    } else {  
                        $html.removeClass('stick');
                    }
                };

            // stick it!
            stick();
            $window.scroll( stick );
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

/* Lava Lamp Style Nav for The Harker School | Joe Banks */
(function ( $, window, document, undefined ) {

    var pluginName = "lavalamp",
        defaults = {
            duration: 500,
            coverOuter: true,
            offsetWidth: 0,
            offsetHeight: 0,
            exclude: ''
        };

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;

        this.$nav = $(this.element);
        this.$activeItem = $();

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            // create blobs
            $('<li class="lavalamp-blob hide"></li>').appendTo( this.$nav ); // top level menu
            this.$nav.find('ul').append('<li class="lavalamp-blob lavalamp-sub-blob hide"></li>'); // sub-menus

            this.activateItem( $('a[href="' + location.hash + '"]', this.$nav ).parent('li') );

            var plugin = this;

            $('a', this.$nav ).on('click.lavalamp', function(e) {
                plugin.activateItem( $(this).parent('li') );
            });

            $(window).resize( function() {
                var $blobs = $('.lavalamp-blob', plugin.$nav ).not('.hide');

                $blobs.each( function() {
                    var $blob = $(this),
                        $item = $blob.siblings('.lavalamp-active, .lavalamp-parent'),
                        itemWidth = ( plugin.settings.coverOuter ) ? $item.outerWidth() : $item.width(),
                        itemHeight = ( plugin.settings.coverOuter ) ? $item.outerHeight() : $item.height();

                    if ( ! $item.length ) {
                        return;
                    }
                        
                    $blob.css({
                        width : itemWidth + plugin.settings.offsetWidth,
                        height : itemHeight + plugin.settings.offsetHeight,
                        left : $item.position().left - plugin.settings.offsetWidth / 2,
                        top : $item.position().top - plugin.settings.offsetHeight / 2
                    });
                });
            });
        },
        activateItem: function(el) {
            var $item;

            // get jQuery object
            if ( el instanceof jQuery ) {
                $item = el;
            } else {
                $item = $(el);
            }

            // if item is already active, quit
            if ( $item.is( this.$activeItem ) ) {
                return;
            }

            // if item is not in menu, quit
            $item = this.$nav.find( $item );
            if ( ! $item.length || $item.is(this.settings.exclude) ) {
                this.$activeItem = $();
                $('.lavalamp-active', this.$nav).removeClass('lavalamp-active');
                $('.lavalamp-blob', this.$nav).addClass('hide');  
                $('.lavalamp-parent', this.$nav).removeClass('lavalamp-parent');
                return;
            }

            // save active item
            this.$activeItem = $item;

            // label active item
            $('.lavalamp-active').removeClass('lavalamp-active');
            $item.addClass('lavalamp-active');

            // move blob
            this.moveBlob( $item );

            // hide sub-nav blobs
            $item.find('.lavalamp-sub-blob').addClass('hide');

            // remove parent label from siblings and descendants
            $item.siblings().removeClass('lavalamp-parent');
            $item.find('lavalamp-parent').removeClass('lavalamp-parent');

            // move parent blobs
            while( ! $item.parent().is( this.$nav ) ) {
                // select parent item
                $item = $item.parent().parent('li'); 

                if ( $item.hasClass('lavalamp-parent') ) {
                    // parent blobs already in place
                    break; 
                }

                // label parent item
                $item.siblings().removeClass('lavalamp-parent');
                $item.addClass('lavalamp-parent');
                
                // move blob to parent item
                this.moveBlob( $item );
            }
        },
        moveBlob: function( $item ) {
            var $blob = $item.siblings('.lavalamp-blob'),
                itemWidth = ( this.settings.coverOuter ) ? $item.outerWidth() : $item.width(),
                itemHeight = ( this.settings.coverOuter ) ? $item.outerHeight() : $item.height();
            
            // if blob doesn't exist, quit
            if ( ! $blob.length ) {
                return;
            }

            if ( $blob.hasClass('hide') ) {
                $blob.css({
                    width : itemWidth + this.settings.offsetWidth,
                    height : itemHeight + this.settings.offsetHeight,
                    left : $item.position().left - this.settings.offsetWidth / 2,
                    top : $item.position().top - this.settings.offsetHeight / 2
                }).removeClass('hide');
            } else {
                $blob.animate(
                    {
                        width : itemWidth + this.settings.offsetWidth,
                        left : $item.position().left - this.settings.offsetWidth / 2,
                        top : $item.position().top - this.settings.offsetHeight / 2
                    },
                    {
                        duration : this.settings.duration,
                        queue : false
                    }
                );
            }
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

/* SelectNav for The Harker School | Joe Banks */
(function ( $, window, document, undefined ) {

    var pluginName = "selectnav",
        defaults = {
            defaultText: 'Go to...',
            onchange: function(nav) {
                window.location = $(nav).find("option:selected").val();
            }
        };

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var plugin = this,
                $nav = $(plugin.element),
                $selectnav = $("<select />").appendTo($nav),
                $ul = $nav.children('ul');

            // create default option
            $("<option />", {
                "selected": "selected",
                "value"   : "",
                "text"    : plugin.settings.defaultText
            }).appendTo($selectnav);

            // populate dropdown with menu items
            plugin.walkNav( $ul, function( $link, level ) {
                level = level || 0;

                var dashes = '';

                for ( var i = 0; i < level; i++ ) {
                    dashes += '-';
                }

                $("<option />", {
                    "value"   : $link.attr("href"),
                    "text"    : dashes + ' ' + $link.text()
                }).appendTo($selectnav);
            });

            $selectnav.val( location.hash );

            $selectnav.change( function() {
                plugin.settings.onchange(this);
            });
        },
        walkNav: function( $ul, action, level ) {
            level = level || 0;

            var plugin = this;

            // process anchors
            $ul.children('li').children('a').each( function() {
                var $link = $(this),
                    $sub = $link.siblings('ul');

                // run action
                action( $link, level );

                if ( ! $sub.length ) {
                    return;
                }

                // process sub menus
                plugin.walkNav( $sub, action, level+1 );
            });
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.11
 *
 * Requires: jQuery 1.2.2+
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.11",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b)["offsetParent"in a.fn?"offsetParent":"parent"]();return c.length||(c=a("body")),parseInt(c.css("fontSize"),10)},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});