/**
 * jQuery Window Plugin v.0.1
 *
 * Copyright (c) 2011 Zapp-East llc.
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * @copyright 2011 Zapp-East llc.
 * @author Julia Shilova <jul@inamerica.ru> main contributor and maintainer
 * @author Eugene Myazin <meniam@gmail.com>
 * @since 11 augest 2011
 */
(function($) {
/**
 * jqWindow constructor
 *
 * @param name
 * @param options
 */
$.jqWindow = function(name, options, parentWindow)
{
    this.settings    = $.extend(true, {}, $.jqWindow.defaults, options);
    this.name        = name;
    this.container   = this.settings.container ? $(this.settings.container) : null;
    this.parent      = null;
    this.childList   = [];


    this.init(parentWindow);
};

/**
 * Debug Levels
 *      5 - hook run messages
 *          
 *      6 - hook run params
 *
 */

$.extend($.jqWindow, {
    defaults : {
        type                     : 'jqwindow_normal jqwindow_padded', // window type [jqwindow_normal, jqwindow_basic, jqwindow_shadow, jqwindow_framed, jqwindow_masked, jqwindow_padded_basic, jqwindow_padded]
        debug                    : true,
        title                    : '&nbsp;',
        footerContent            : '',
        container                : null,
        width                    : 400,
        height                   : 400,
        minWidth                 : 100,
        minHeight                : 100,
        maxWidth                 : 0,
        maxHeight                : 0,
        left                     : -1,
        top                      : -1,
        scrollable               : true,
        closeable                : true,
        minimizable              : true,
        maximizable              : true,
        draggable                : true,
        resizeable               : true,
        overlayable              : false,
        modal                    : false,
        minimizeArea             : 'left',
        minimizeMaxPerLine       : 5, //Количество минимизированных окон в одной строке
        possiblySpadeNorth       : false, // Possible for the spade north container (or window) when dragg
        possiblySpadeEast        : false, // Possible for the spade east container (or window) when dragg
        possiblySpadeSouth       : false, // Possible for the spade south container (or window) when dragg
        possiblySpadeWest        : false, // Possible for the spade west container (or window) when dragg

        // css classes 
        windowClass                              : 'jqwindow',
        headerClass                              : 'jqwindow_header',
        headerTitleClass                         : 'jqwindow_title',
        footerClass                              : 'jqwindow_footer',
        bodyClass                                : 'jqwindow_body',
        contentClass                             : 'jqwindow_content',
        overlayClass                             : 'jqwindow_overlay',
        modalOverlayClass                        : 'jqwindow_modal_overlay',
        headerActionBarClass                     : 'jqwindow_action_bar',
        headerButtonClass                        : 'jqwindow_button',
        headerCloseButtonClass                   : 'jqwindow_close',
        scrollableClass                          : 'jqwindow_scrollable',
        headerMinimizeButtonClass                : 'jqwindow_minimize',
        headerMaximizeButtonClass                : 'jqwindow_maximize',
        headerCollapseButtonClass                : 'jqwindow_collapse',
        headerExpandButtonClass                  : 'jqwindow_expand',
        headerFoldingCollapseButtonClass         : 'jqwindow_folding_collapse',
        headerFoldingExpandButtonClass           : 'jqwindow_folding_expand',
        focusedClass                             : 'jqwindow_focus',

        /* debug start */
        // HOOK defaults
        onBeforeShow                             : function(jqWindow) { return true; },
        onAfterShow                              : function(jqWindow) { return true; },
        onBeforeCreate                           : function()         { return true; },
        onAfterCreate                            : function(jqWindow) { return true; },
        onBeforeClose                            : function(jqWindow) { return true; },
        onAfterClose                             : function()         { return true; },
        onBeforeOverlayClick                     : function(jqWindow, overlay, event)         { return true; },
        onAfterOverlayClick                      : function(jqWindow, overlay, event)         { return true; },
        onBeforeResize                           : function(jqWindow, event, currentSizeAndPos) { return true; },
        onResize                                 : function(jqWindow, event, currentSizeAndPos, originalSizeAndPos) { return true; },
        onAfterResize                            : function(jqWindow, event, currentSizeAndPos, originalSizeAndPos) { return true; },
        /* debug end */
    },

    prototype : {
        /**
         * Create window (@see create()),
         * and register it in the window manager
         */
        init : function(parentWindow)
        {
            if (this.settings.onBeforeShow() == this) {
                alert(true);
            }
            if (this.settings.onBeforeShow != this.settings.onAfterClose) {
                //alert(true);
            }
            if (this.create()) {
                this.setParent(parentWindow);
                if (!this.parent) {
                    this.setParent($.jqWindowManager().getFocusedWindow());
                }
                if ($.jqWindowManager().registryWindow(this)) {
                    this.window.attr('id', 'jqwindow_' + this.getId());
                }
                this.settings.onAfterCreate(this);
            }
        },

        addChild : function(jqWindow)
        {
            if (jqWindow && (typeof(jqWindow) == 'string' || typeof(jqWindow) == 'integer')) {
                jqWindow = $.jqWindowManager().getWindow(jqWindow);
            }
            if (jqWindow instanceof $.jqWindow) {
                this.childList.push(jqWindow);
            }
        },

        deleteChild : function(jqWindow)
        {
            jqWindow = $.jqWindowManager().getWindow(jqWindow);
            if (jqWindow instanceof $.jqWindow) {
                for (var key in this.childList) {
                    if (this.childList[key] == jqWindow) {
                        this.childList.splice(key, 1);
                    }
                }
            }
        },

        getChildCount : function()
        {
            return this.childList.length;
        },

        getParent : function()
        {
            return this.parent;
        },

        setParent : function(parentWindow)
        {
            if (parentWindow && (typeof(parentWindow) == 'string' || typeof(parentWindow) == 'integer')) {
                parentWindow = $.jqWindowManager().getWindow(parentWindow);
            }

            if (parentWindow instanceof $.jqWindow && this.parent != parentWindow) {
                if (this.parent) {
                    this.parent.deleteChild(this);
                }
                parentWindow.addChild(this);
                this.parent = parentWindow;
            }
        },

        /**
         * Close parent window
         *
         * @todo need close all parents or some defined value of parents :)
         *
         * @param itemsToClose How many parent need to close
         * @return boolean always true
         */
        closeParent : function(itemsToClose)
        {
            if (!itemsToClose) {
                itemsToClose = 1;
            }

            var closedCount = 0;
            var item = this;
            while (item = item.getParent()) {
                if (closedCount >= itemsToClose) {
                    break;
                }
                item.close();
                closedCount++;
            }

            return true;
        },

        /**
         * At this point we are create DOM structure
         * for new window, but don't show it
         *
         * At same time we bind all events on
         * control elements
         *
         * Window show by @see show() method
         */
        create: function()
        {
            // if window exists (second call) or BeforeCreate return false
            // value we are don't create DOM structure
            if (this.window || !this.settings.onBeforeCreate()) {
                return false;
            }

            var jqWindow = this;
            var windowContainer = this.container ? this.container : $('body');

            /*if (this.settings.overlayable) {
                $.jqWindow.createOverlay(windowContainer, this.settings.overlayClass);
            }*/

            // create common DOM-structure
            this.window = $('<div></div>').addClass(this.settings.windowClass)
                                          .addClass(this.settings.type)
                                          .attr('name', this.name)
                                          .appendTo(windowContainer);

            $.jqWindow.recountWindowSizeAndPosition(this);

            // Scrollable setting just add scrollableClass
            // to main DOM element of window
            if (this.settings.scrollable) {
                this.window.addClass(this.settings.scrollableClass);
            }

            /**
             * Window focus/blur
             *
             * @todo need to add hooks onBeforeFocus()/onAfterFocus()/onBeforeBlur()/onAfterBlur()
             */
            this.window.mousedown(function() {
                jqWindow.focus();
            });

            // Create and append header to window
            this.header = $('<div></div>').addClass(this.settings.headerClass)
                                           .appendTo(this.window);

            if (this.settings.draggable) {
                this.header.addClass('draggable')
                           .bind('mousedown.jqwindow_drag', function(event) {
                                jqWindow.window.addClass('drag');
                                var mousePos = {x : event.pageX - parseInt(jqWindow.window.offset().left),
                                                y : event.pageY - parseInt(jqWindow.window.offset().top)}
                                var i = 0;
                                $(window).bind('mousemove.jqwindow_drag', function(event) {
                                    jqWindow.drag(mousePos, event);
                                    event.preventDefault();
                                });
                                event.preventDefault();
                           });
                $(window).bind('mouseup.jqwindow_drag', function(event) {
                    jqWindow.window.removeClass('drag');
                    $(window).unbind('mousemove.jqwindow_drag');
                });
            }

            // create window header action bar
            this.headerActionBar = $('<span></span>').addClass(this.settings.headerActionBarClass)
                                                     .appendTo(this.header);


            // create maximize/minimize button
            if (this.settings.maximizable) {
                $('<a href="javascript:void(0)"></a>').appendTo(this.headerActionBar)
                                                      .addClass(this.settings.headerButtonClass + ' ' + this.settings.headerMaximizeButtonClass)
                                                      .click(function() {
                                                          jqWindow.maximize();
                                                      })
                                                      .append('<em>Maximize</em>');

                $('<a href="javascript:void(0)"></a>').appendTo(this.headerActionBar)
                                                      .addClass(this.settings.headerButtonClass + ' ' + this.settings.headerMinimizeButtonClass)
                                                      .click(function() {
                                                          jqWindow.minimize();
                                                      })
                                                      .hide()
                                                      .append('<em>Minimize</em>');
            }

            // create close button
            if (this.settings.closeable) {
                $('<a href="javascript:void(0)"></a>').appendTo(this.headerActionBar)
                                                      .addClass(this.settings.headerButtonClass + ' ' + this.settings.headerCloseButtonClass)
                                                      .click(function() {
                                                          jqWindow.close();
                                                      })
                                                      .append('<em>Close</em>');
            }
/*
            if (settings.minimizable) {
                headerActionBar.append("<div title='minimize window' class='minimize button'></div>");
                headerActionBar.children('.minimize').click(function() {
                    minimize();
                });
            }

            headerActionBar.children('.button').dblclick(function() {
                return false;
            });*/

            if (this.settings.maximizable) {
                this.header.dblclick(function() {
                    if (jqWindow.maximized) {
                        jqWindow.minimize();
                    } else {
                        jqWindow.maximize();
                    }
                });
            }

            // create window title
            this.title = $('<span></span>').addClass(this.settings.headerTitleClass)
                                           .html(this.settings.title)
                                           .width(this.header.width() - this.headerActionBar.width() - 5)
                                           .appendTo(this.header);

            if (this.settings.footerContent) {
                this.footer = $('<div></div>').addClass(this.settings.footerClass)
                                              .html(this.settings.footerContent)
                                              .appendTo(this.window);
            }

            this.content = $('<div></div>').addClass(this.settings.contentClass)
                                           .addClass('loading')
                                           .click(function() {
                                                jqWindow.content.removeClass('loading');
                                            })
                                           .appendTo(this.window);
            var contentHeight = this.window.height() - this.header.outerHeight(true) - (this.content.outerHeight(true) - this.content.height());
            this.content.wrap($('<div></div>').addClass(this.settings.bodyClass)
                                              .height(contentHeight));
            this.body = this.content.parent();

            if (this.settings.resizeable) {
                $('<div></div>').css({position : 'absolute',
                                      top    : 0,
                                      right   : 0,
                                      cursor : 'w-resize',
                                      width  : '3px',
                                      height : this.window.height()})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                    if (!jqWindow.maximized
                                        && (!jqWindow.settings.onBeforeResize
                                            || jqWindow.settings.onBeforeResize(jqWindow, event, jqWindow.getCurrentSizeAndPos()))
                                    ) {
                                        jqWindow.window.addClass('resize');
                                        jqWindow.originalSizeAndPos = jqWindow.getCurrentSizeAndPos();
                                        $(window).bind('mousemove.jqwindow_resize', function(event) {
                                            if (jqWindow.settings.onResize(jqWindow, event, jqWindow.getCurrentSizeAndPos(), jqWindow.originalSizeAndPos)) {
                                                jqWindow.resize(event, 'east');
                                            }
                                            event.preventDefault();
                                        });
                                    }
                                    event.preventDefault();
                                })
                                .appendTo(this.window);
                $('<div></div>').css({position : 'absolute',
                                      bottom : 0,
                                      left   : 0,
                                      cursor : 's-resize',
                                      width  : this.window.width(),
                                      height : '5px'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                    if (!jqWindow.maximized
                                        && (!jqWindow.settings.onBeforeResize
                                            || jqWindow.settings.onBeforeResize(jqWindow, event, jqWindow.getCurrentSizeAndPos()))
                                    ) {
                                        jqWindow.window.addClass('resize');
                                        jqWindow.originalSizeAndPos = jqWindow.getCurrentSizeAndPos();
                                        $(window).bind('mousemove.jqwindow_resize', function(event) {
                                            if (jqWindow.settings.onResize(jqWindow, event, jqWindow.getCurrentSizeAndPos(), jqWindow.originalSizeAndPos)) {
                                                jqWindow.resize(event, 'south');
                                            }
                                            event.preventDefault();
                                        });
                                    }
                                    event.preventDefault();
                                })
                                .appendTo(this.window);
                $('<div></div>').css({position : 'absolute',
                                      bottom : 0,
                                      right  : 0,
                                      width  : '5px',
                                      height : '5px',
                                      cursor : 'se-resize'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                    if (!jqWindow.maximized
                                        && (!jqWindow.settings.onBeforeResize
                                            || jqWindow.settings.onBeforeResize(jqWindow, event, jqWindow.getCurrentSizeAndPos()))
                                    ) {
                                        jqWindow.window.addClass('resize');
                                        jqWindow.originalSizeAndPos = jqWindow.getCurrentSizeAndPos();
                                        $(window).bind('mousemove.jqwindow_resize', function(event) {
                                            if (jqWindow.settings.onResize(jqWindow, event, jqWindow.getCurrentSizeAndPos(), jqWindow.originalSizeAndPos)) {
                                                jqWindow.resize(event, 'south-east');
                                            }
                                            event.preventDefault();
                                        });
                                    }
                                    event.preventDefault();
                                })
                                .appendTo(this.window);
                $(window).bind('mouseup.jqwindow_resize', function(event) {
                    if (jqWindow.maximized) {
                        return;
                    }
;;;                 if (jqWindow.settings.debug) {
;;;                     $.jqWindowManager().log("onAfrterResize: '" + jqWindow.getName() + "' #" + jqWindow.getId() , 5);
;;;                     $.jqWindowManager().log("onAfterResize param currentSizeAndPos:", 6);
;;;                     $.jqWindowManager().log(jqWindow.getCurrentSizeAndPos(), 6);
;;;                     $.jqWindowManager().log("onAfterResize param originalSizeAndPos:", 6);
;;;                     $.jqWindowManager().log(jqWindow.originalSizeAndPos, 6);
;;;                 }

                    if (jqWindow.settings.onAfterResize(jqWindow, event, jqWindow.getCurrentSizeAndPos(), jqWindow.originalSizeAndPos)) {
                        jqWindow.window.removeClass('resize');
                        $(window).unbind('mousemove.jqwindow_resize');
                        delete jqWindow.originalSizeAndPos;
                    }
                });
            }

            this.window.hide();

            return true;
        },

        /**
         * Show the window.
         *
         * if BeforeShow hook return false,
         * window will not be shown, and
         * AfterShow will not be run
         */
        show : function()
        {
            if (this.settings.onBeforeShow(this)) {
                this.window.show();
                this.settings.onAfterShow(this);
            }
        },

        /**
         * Close the window
         *
         * If you are redefine this method in options,
         * you have watch for close functionality by youself
         *
         * You can use this.close() in your method to close window
         *
         * False value, returned by BeforeClose,  prevents closes window
         *
         * !!! Important !!!
         * Remember: Close method also does some things:
         *  - it removes window from manager registry
         *  - hides overlay layer
         *
         *  @return boolean always true
         */
        close : function()
        {
            if (this.settings.onBeforeClose(this)) {
                this.window.remove();
                $.jqWindowManager().removeWindow(this.getId());
                if (this.getParent()) {
                    this.getParent().deleteChild(this.getId());
                }
                if (this.getChildCount()) {
                    $.each(this.childList, function(key, jqWindow) {
                        jqWindow.parent = null;
                    })
                }

                this.settings.onAfterClose();
            }
            return true;
        },

        /**
         * Window grag
         *
         * @param mousePos mouse position at screen (browser window)
         * @param event event object
         */
        drag : function (mousePos, event)
        {
            event = event ? event : window.event;
            var posX = event.pageX - mousePos.x,
                posY = event.pageY - mousePos.y;

            // We allow drag window only within its territories (container)
            if (!this.container) {
                // If container not defined we can drag window in within screen (browser window)
                var screenDimensions = $.jqWindow.getBrowserScreenDimensions();
                var scrollPosition = $.jqWindow.getBrowserScrollPosition();
            }
            if (!this.settings.possiblySpadeWest) {
                var minX = this.container ? this.container.offset().left : scrollPosition.x;
            } else {
                var minX = -1;
            }
            if (!this.settings.possiblySpadeNorth) {
                var minY = this.container ? this.container.offset().top : scrollPosition.y;
            } else {
                var minY = -1;
            }
            if (!this.settings.possiblySpadeEast) {
                var maxX = this.container ? this.container.offset().left + this.container.width() - this.window.outerWidth(true)
                                          : scrollPosition.x + screenDimensions.width - this.window.outerWidth(true);
            } else {
                var maxX = -1;
            }
            if (!this.settings.possiblySpadeSouth) {
                var maxY = this.container ? this.container.offset().top + this.container.height() - this.window.outerHeight(true)
                        : scrollPosition.y + screenDimensions.height - this.window.outerHeight(true);
            } else {
                var maxY = -1;
            }

            posX = (minX >= 0 && posX <= minX) ? minX : ((maxX >= 0 && posX >= maxX) ? maxX : posX);
            posY = (minY >= 0 && posY <= minY) ? minY : ((maxY >= 0 && posY >= maxY) ? maxY : posY);

            this.window.css({
                top  : posY,
                left : posX
            });
        },

        resize : function (event, direction)
        {
            event = event ? event : window.event;

            var screenDimensions = $.jqWindow.getBrowserScreenDimensions();
            var scrollPosition = $.jqWindow.getBrowserScrollPosition();
            if (direction == 'south-east' || direction == 'east') {
                var width = event.pageX - this.window.offset().left;
                var minWidth = this.settings.minWidth;
                var maxWidth = this.settings.maxWidth ? this.settings.maxWidth : (this.container ? this.container.width() : screenDimensions.width - (this.window.offset().left - scrollPosition.x));
                width = width < minWidth ? minWidth : (width > maxWidth ? maxWidth : width);
                this.window.width(width);
            }
            if (direction == 'south-east' || direction == 'south') {
                var height = event.pageY - this.window.offset().top;
                var minHeight = this.settings.minHeight;
                var maxHeight = this.settings.maxHeight ? this.settings.maxHeight : (this.container ? this.container.height() : screenDimensions.height - (this.window.offset().top - scrollPosition.y));
                height = height < minHeight ? minHeight : (height > maxHeight ? maxHeight : height);
                this.window.height(height);
            }
            $.jqWindow.recountSizeWindowItems(this);
        },

        maximize : function()
        {
;;;         if (this.settings.debug) {
;;;             $.jqWindowManager().log("onBeforeMaximize: '" + this.getName() + "' #" + this.getId() , 5);
;;;         }

            $.jqWindow.maximize(this);
        },

        minimize : function()
        {
            if (!this.container) {
                $.jqWindow.showBrowserScrollbar();
            }

            if (this.windowSaveParams) {
                this.window.css({
                    width	: this.windowSaveParams.width,
                    height	: this.windowSaveParams.height,
                    top		: this.windowSaveParams.y,
                    left	: this.windowSaveParams.x
                });
            }
            this.headerActionBar.children('.' + this.settings.headerMaximizeButtonClass).show();
            this.headerActionBar.children('.' + this.settings.headerMinimizeButtonClass).hide();
            this.maximized = false;
            
            $.jqWindow.recountSizeWindowItems(this);
        },

        /**
         * Focus window
         */
        focus : function()
        {
            // Current window (top window)
            $.jqWindowManager().focusWindow(this);
        },

        setContent : function(content)
        {
            this.content.html(content);
        },

        setTitle : function(title)
        {
            this.header.children('.' + this.settings.headerTitleClass).html(title);
        },

        hideOverlay : function()
        {
            $.jqWindow.hideOverlay();
        },

        getName : function()
        {
            return this.name;
        },

        getId : function()
        {
            return this.id;
        },

        getDomId : function()
        {
            return this.window.attr('id');
        },

        setZindex : function(zIndex)
        {
            this.zIndex = zIndex;
            this.window.css('z-index', zIndex);
        },

        getCurrentSizeAndPos : function()
        {
            return {width  : this.window.width(),
                    height : this.window.height(),
                    top    : this.window.offset().top,
                    left   : this.window.offset().left};
        }
    },

    getElementPosition : function(element)
    {
        var top = 0;
        var left = 0;
        if (element) {
            var pos = element.offset();
            top = pos.top + parseInt(element.css('borderTopWidth'));
            left = pos.left + parseInt(element.css('borderLeftWidth'));
        }

        return {x : left, y : top};
    },

    getBrowserScrollPosition : function()
    {
        var scrOfX = 0, scrOfY = 0;
        if (typeof( window.pageYOffset ) == 'number') {
            //Netscape compliant
            scrOfY = window.pageYOffset;
            scrOfX = window.pageXOffset;
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            //DOM compliant
            scrOfY = document.body.scrollTop;
            scrOfX = document.body.scrollLeft;
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            scrOfY = document.documentElement.scrollTop;
            scrOfX = document.documentElement.scrollLeft;
        }
        return {x:scrOfX, y:scrOfY};
    },

    hideBrowserScrollbar : function()
    {
        this.bodyOverflowSave = $('body').css('overflow');
        $('body').css('overflow', 'hidden');
    },

    showBrowserScrollbar : function()
    {
        $('body').css('overflow', this.bodyOverflowSave);
    },

    /**
     * Получить размеры рабочей области браузера
     *
     * return {width, height}
     */
    getBrowserScreenDimensions : function()
    {
        var width = document.documentElement.clientWidth,
            height = document.documentElement.clientHeight;
        return {width : width, height : height};
    },

    recountSizeWindowItems : function(jqWindow)
    {
        jqWindow.title.width(jqWindow.header.width() - jqWindow.headerActionBar.width() - 5);
        var contentHeight = jqWindow.window.height() - jqWindow.header.outerHeight(true) - (jqWindow.content.outerHeight(true) - jqWindow.content.height());
        //console.log(contentHeight);
        jqWindow.body.height(contentHeight);

        return this;
    },

    recountWindowSizeAndPosition : function(jqWindow)
    {
;;;     if (jqWindow.settings.debug) {
;;;         $.jqWindowManager().log("recountWindowSizeAndPosition: '" + jqWindow.getName() + "' #" + jqWindow.getId() , 5);
;;;     }

        if (jqWindow.settings.onBeforeResize && !jqWindow.settings.onBeforeResize(jqWindow, window.event, jqWindow.getCurrentSizeAndPos())) {
;;;         if (jqWindow.settings.debug) {
;;;             $.jqWindowManager().log("onBeforeResize: hook return false", 5);
;;;         }
            return this;
        }

        if (jqWindow.maximized) {
;;;         if (jqWindow.settings.debug) {
;;;             $.jqWindowManager().log("recountWindowSizeAndPosition: window is maximized", 5);
;;;         }
            this.maximize(jqWindow);
            return this;
        }
        jqWindow.originalSizeAndPos = jqWindow.getCurrentSizeAndPos();

        // Calculate window width and height
        var windowWidth = jqWindow.settings.width;
        if (windowWidth[windowWidth.length - 1] == '%') {
            windowWidth = (parseInt(windowWidth.substr(0, windowWidth.length - 1)) * $(window).width() / 100);
        }

        var windowHeight = jqWindow.settings.height;
        if (windowHeight[windowHeight.length - 1] == '%') {
            windowHeight = (parseInt(windowHeight.substr(0, windowHeight.length - 1)) * $(window).height() / 100);
        }

        /**
         * @todo Change to "if" construction
         */
        windowWidth = (jqWindow.settings.minWidth > 0 && windowWidth < jqWindow.settings.minWidth) ? jqWindow.settings.minWidth : ((jqWindow.settings.maxWidth > 0 && windowWidth > jqWindow.settings.maxWidth) ? jqWindow.settings.maxWidth : windowWidth);
        windowHeight = (jqWindow.settings.minHeight > 0 && windowHeight < jqWindow.settings.minHeight) ? jqWindow.settings.minHeight : ((jqWindow.settings.maxHeight > 0 && windowHeight > jqWindow.settings.maxHeight) ? jqWindow.settings.maxHeight : windowHeight);

        // calculate and set position of window
        var containerPos = this.getElementPosition(jqWindow.container);
        var scrollPos = this.getBrowserScrollPosition();

        var windowPosX = containerPos.x + (jqWindow.settings.left >= 0)
                                ? jqWindow.settings.left
                                : ($(jqWindow.container ? jqWindow.container : $(window)).width() - windowWidth) / 2;

        var windowPosY = containerPos.y + (jqWindow.settings.top >= 0)
                            ? jqWindow.settings.top
                            : ($(jqWindow.container ? jqWindow.container : $(window)).height() - windowHeight) / 2;

        if (!jqWindow.container) {
            windowPosX += scrollPos.x;
            windowPosY += scrollPos.y;
        }

        jqWindow.window.css({
            left    : windowPosX,
            top     : windowPosY
        }).width(windowWidth).height(windowHeight);

        if (jqWindow.settings.onAfterResize) {
            jqWindow.settings.onAfterResize(jqWindow, window.event, jqWindow.getCurrentSizeAndPos(), jqWindow.originalSizeAndPos);
            delete jqWindow.originalSizeAndPos;
        }
        return this;
    },

    maximize : function(jqWindow)
    {
        if (!jqWindow.container) {
            this.hideBrowserScrollbar();
            var newDimensions = this.getBrowserScreenDimensions();
            var newPos = this.getBrowserScrollPosition();
        } else {
            var newDimensions = {width  : jqWindow.container.width(),
                                 height : jqWindow.container.height()};
            var newPos = {x : jqWindow.container.offset().left,
                          y : jqWindow.container.offset().top};
        }

        jqWindow.windowSaveParams = {width  : jqWindow.window.width(),
                                 height : jqWindow.window.height(),
                                 x      : jqWindow.window.offset().left,
                                 y      : jqWindow.window.offset().top}

        jqWindow.window.css({
            width    : newDimensions.width,
            height   : newDimensions.height,
            top      : newPos.y,
            left     : newPos.x
        });

        jqWindow.headerActionBar.children('.' + jqWindow.settings.headerMaximizeButtonClass).hide();
        jqWindow.headerActionBar.children('.' + jqWindow.settings.headerMinimizeButtonClass).show();
        jqWindow.maximized = true;

        this.recountSizeWindowItems(jqWindow);
    },


    getWindowZIndexByWindowId : function(windowId)
    {
        return $.jqWindowManager().settings.zIndexStart + windowId * 2;
    },

    createOverlay : function(container, className)
    {
        if (this.overlay) {
            return;
        }
        this.overlay =  $('<div></div>').addClass(className)
                                        .appendTo(container)
                                        .width(container.width())
                                        .height(container.height())
                                        .click(function() {
                                            $.jqWindowManager().closeAll();
                                        })
                                        .hide();
    },

    showOverlay : function(zIndex)
    {
        if (this.overlay) {
            if (zIndex) {
                this.overlay.css('z-index', zIndex);
            }
            this.hideBrowserScrollbar();
            this.overlay.show();
        }
    },

    hideOverlay : function()
    {
        if (this.overlay) {
            this.showBrowserScrollbar();
            this.overlay.remove();
            this.overlay = null;
        }
    }

});


$.jqWindowManager = function()
{
    return this;
}

$.extend($.jqWindowManager(), {
    settings : {
        zIndexStart     : 1000,
        overlayClass    : 'jqwindow_overlay',
        persistentOverlay : true,
        debugLevel      : 9
    },

    windows : [],

    layers : [],

    overlayableWindowCount : 0,

    focusWindow : function(jqWindow)
    {
        jqWindow = this.getWindow(jqWindow);

        if (jqWindow instanceof $.jqWindow && jqWindow != this.getFocusedWindow()) {
            if (jqWindow.zIndex) {
                this.layers.splice(jqWindow.zIndex, 1);
            }
            var windowZIndex = (this.layers.length ? this.layers.length : this.settings.zIndexStart) + 2;
            jqWindow.setZindex(windowZIndex);
            this.layers[jqWindow.zIndex] = jqWindow;
        }
    },

    getFocusedWindow : function()
    {
        if (this.layers.length) {
            for (var i = this.layers.length; i >= 0; i--) {
                if (this.layers[i] instanceof $.jqWindow) {
                    return this.layers[i];
                }
            }
        }
        return null;
    },

    getWindow : function(jqWindow)
    {
        var windowId = this.getWindowIdFromMixed(jqWindow);
        for (var key in this.windows) {
            if (this.windows[key].getId() == windowId) {
                return this.windows[key];
            }
        }
        return null;
    },

    getWindowIdFromMixed : function(windowId)
    {
        if (windowId) {
            if (typeof(windowId) == 'string' && windowId.substring(0, 9) == 'jqwindow_') {
                windowId = windowId.substring(9, windowId.length);
            } else if (typeof(windowId) == 'object') {
                windowId = windowId.getId();
            }
        }
        return windowId;
    },

    registryWindow : function(jqWindow)
    {
        if (jqWindow instanceof $.jqWindow) {
            jqWindow.id = this.getWindowCount() + 1;
            this.windows.push(jqWindow);

            $(window).bind('resize.jqwindow_' + jqWindow.id, function(event) {
                $.jqWindow.recountWindowSizeAndPosition(jqWindow).recountSizeWindowItems(jqWindow);
            });
            /**
             * new window is always on top (current)
             */
            this.focusWindow(jqWindow);
            if (jqWindow.settings.overlayable) {
                this.overlayableWindowCount++;
            }
            if (this.overlayableWindowCount || (this.settings.persistentOverlay && this.getWindowCount() == 1)) {
                this.showOverlay(jqWindow.zIndex - 1);
            }
            return true;
        }
        return false;
    },

    removeWindow : function(jqWindow)
    {
        jqWindow = this.getWindow(jqWindow);

        if (jqWindow) {
            for (var key in this.windows) {
                if (this.windows[key].getId() == jqWindow.getId()) {
                    this.windows.splice(key, 1);
                }
            }
            $(window).unbind('resize.jqwindow_' + jqWindow.getId());

            //this.windows[jqWindow.getId()] = undefined;
            this.layers[jqWindow.zIndex] = undefined;
            this.focusWindow(this.getFocusedWindow());
            if (jqWindow.settings.overlayable) {
                for (var i = this.getWindowCount(); i >= 0; i--) {
                    var value = this.windows[i];
                    if (value instanceof $.jqWindow && value.settings.overlayable) {
                        this.showOverlay(value.zIndex - 1);
                    }
                }
                this.overlayableWindowCount--;
            }
            console.log(this.overlayableWindowCount);
            if (!this.overlayableWindowCount || (this.settings.persistentOverlay && !this.getWindowCount())) {
                this.hideOverlay();
            }
        }
    },

    createWindow : function(name, options, parentWindow)
    {
        return new $.jqWindow(name, options, parentWindow);
    },

    /**
     * Get count of windows in the registry
     *
     * @return integer
     */
    getWindowCount : function()
    {
        return this.windows.length;
    },

    closeAll : function()
    {
        for (var key in this.windows) {
            this.windows[key].close();
        }
    },

    createOverlay : function(container)
    {
        if (this.overlay) {
            return;
        }
        if (!container) {
            var windowDimensions = $.jqWindow.getBrowserScreenDimensions();
            var width = windowDimensions.width;
            var height = windowDimensions.height;
        } else {
            var width = $(container).width();
            var height = $(container).height();
        }
        container = container ? $(container) : $('body');
        this.overlay =  $('<div></div>').addClass(this.settings.overlayClass)
                                        .appendTo(container)
                                        .width(width)
                                        .height(height)
                                        .bind('mousedown.jqwindow', function() {
                                            //$.jqWindowManager().closeAll();
                                        })
                                        .hide();
    },

    showOverlay : function(zIndex)
    {
        if (!this.overlay) {
            this.createOverlay();
        }
        if (zIndex) {
            this.overlay.css('z-index', zIndex);
        }
        $.jqWindow.hideBrowserScrollbar();
        this.overlay.show();
    },

    hideOverlay : function()
    {
        if (this.overlay) {
            $.jqWindow.showBrowserScrollbar();
            this.overlay.remove();
            this.overlay = null;
        }
    },

    log : function(message, level)
    {
;;;     if (!level) {
;;;         level = 1;
;;;     }
;;;     if (this.settings.debugLevel > level) {
;;;         console.log(message);
;;;     }
    }

});

})(jQuery)