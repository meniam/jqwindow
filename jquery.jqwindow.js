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

$.extend($.jqWindow, {
    defaults : {
        type                     : 'jqwindow_normal jqwindow_padded', // window type [jqwindow_normal, jqwindow_basic, jqwindow_shadow, jqwindow_framed, jqwindow_masked, jqwindow_padded_basic, jqwindow_padded]
        title                    : '&nbsp;',
        footerContent            : '',
        container                : null,
        width                    : 400,
        height                   : 400,
        minWidth                 : 100,
        minHeight                : 100,
        maxWidth                 : 0,
        maxHeight                : 0,
        posX                     : -1,
        posY                     : -1,
        posZ                     : 1000,
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

        // HOOK defaults 
        onBeforeShow                             : function(jqWindow) { return true; },
        onAfterShow                              : function(jqWindow) { return true; },
        onBeforeCreate                           : function()         { return true; },
        onAfterCreate                            : function(jqWindow) { return true; },
        onBeforeClose                            : function(jqWindow) { return true; },
        onAfterClose                             : function()         { return true; }
    },

    prototype : {
        /**
         * Create window (@see create()),
         * and register it in the window manager
         */
        init : function(parentWindow)
        {
            if (this.create()) {
                this.setParent(parentWindow);
                if (!this.parent) {
                    this.setParent($.jqWindowManager().getCurrentWindow());
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

            if (this.settings.overlayable) {
                $.jqWindow.createOverlay(windowContainer, this.settings.overlayClass);
            }

            // Calculate window width and height
            var windowWidth = this.settings.width;
            if (windowWidth[windowWidth.length - 1] == '%') {
                windowWidth = (parseInt(windowWidth.substr(0, windowWidth.length - 1)) * $(window).width() / 100);
            }

            var windowHeight = this.settings.height;
            if (windowHeight[windowHeight.length - 1] == '%') {
                windowHeight = (parseInt(windowHeight.substr(0, windowHeight.length - 1)) * $(window).height() / 100);
            }

            windowWidth = (this.settings.minWidth > 0 && windowWidth < this.settings.minWidth) ? this.settings.minWidth : ((this.settings.maxWidth > 0 && windowWidth > this.settings.maxWidth) ? this.settings.maxWidth : windowWidth);
            windowHeight = (this.settings.minHeight > 0 && windowHeight < this.settings.minHeight) ? this.settings.minHeight : ((this.settings.maxHeight > 0 && windowHeight > this.settings.maxHeight) ? this.settings.maxHeight : windowHeight);

            // create common DOM-structure
            this.window = $('<div></div>').addClass(this.settings.windowClass)
                                          .addClass(this.settings.type)
                                          .attr('name', this.name)
                                          .width(windowWidth)
                                          .height(windowHeight)
                                          .appendTo(windowContainer);

            // calculate and set position of window
            var containerPos = $.jqWindow.getElementPosition(this.container);
            var scrollPos = $.jqWindow.getBrowserScrollPosition();

            var windowPosX = containerPos.x + (this.settings.posX >= 0)
                                ? this.settings.posX
                                : ($(this.container ? this.container : window).width() - this.window.width()) / 2;

            var windowPosY = containerPos.y + (this.settings.posY >= 0)
                                ? this.settings.posY
                                : ($(this.container ? this.container : window).height() - this.window.height()) / 2;

            if (!this.container) {
                windowPosX += scrollPos.x;
                windowPosY += scrollPos.y;
            }

            this.window.css({
                left    : windowPosX,
                top     : windowPosY
            });

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
                                    jqWindow.window.addClass('resize');
                                    $(window).bind('mousemove.jqwindow_resize', function(event) {
                                        jqWindow.resize(event, 'east');
                                        event.preventDefault();
                                    });
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
                                    jqWindow.window.addClass('resize');
                                    $(window).bind('mousemove.jqwindow_resize', function(event) {
                                        jqWindow.resize(event, 'south');
                                        event.preventDefault();
                                    });
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
                                    jqWindow.window.addClass('resize');
                                    $(window).bind('mousemove.jqwindow_resize', function(event) {
                                        jqWindow.resize(event, 'south-east');
                                        event.preventDefault();
                                    });
                                    event.preventDefault();
                                })
                                .appendTo(this.window);
                $(window).bind('mouseup.jqwindow_resize', function(event) {
                    jqWindow.window.removeClass('resize');
                    $(window).unbind('mousemove.jqwindow_resize');
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
                /*if (this.settings.overlayable) {
                    $.jqWindow.showOverlay(this.window.css('z-index') - 1);
                }*/
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

                /*if (!$.jqWindowManager().getWindowCount()) {
                    $.jqWindow.hideOverlay();
                }*/

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
            if (this.container) {
                var minX = this.container.offset().left;
                var minY = this.container.offset().top;
                var maxX = this.container.offset().left + this.container.width() - this.window.outerWidth(true);
                var maxY = this.container.offset().top + this.container.height() - this.window.outerHeight(true);
            } else {
                // If container not defined we can drag window in within screen (browser window)
                var screenDimensions = $.jqWindow.getBrowserScreenDimensions();
                var scrollPosition = $.jqWindow.getBrowserScrollPosition();
                var minX = scrollPosition.x;
                var maxX = scrollPosition.x + screenDimensions.width - this.window.outerWidth(true);
                var minY = scrollPosition.y;
                var maxY = scrollPosition.y + screenDimensions.height - this.window.outerHeight(true);
            }

            posX = posX <= minX ? minX : (posX >= maxX ? maxX : posX);
            posY = posY <= minY ? minY : (posY >= maxY ? maxY : posY);

            this.window.css({
                top     : posY,
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
            if (!this.container) {
                $.jqWindow.hideBrowserScrollbar();
                var newDimensions = $.jqWindow.getBrowserScreenDimensions();
                var newPos = $.jqWindow.getBrowserScrollPosition();
            } else {
                var newDimensions = {width  : this.container.width(),
                                     height : this.container.height()};
                var newPos = {x : this.container.offset().left,
                              y : this.container.offset().top};
            }

            this.windowSaveParams = {width  : this.window.width(),
                                     height : this.window.height(),
                                     x      : this.window.offset().left,
                                     y      : this.window.offset().top}

            this.window.css({
                width    : newDimensions.width,
                height   : newDimensions.height,
                top      : newPos.y,
                left     : newPos.x
            });

            this.headerActionBar.children('.' + this.settings.headerMaximizeButtonClass).hide();
            this.headerActionBar.children('.' + this.settings.headerMinimizeButtonClass).show();
            this.maximized = true;
            
            $.jqWindow.recountSizeWindowItems(this);
        },

        minimize : function() {
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
            $.jqWindowManager().setCurrentWindow(this);

            /*var currentWindow = $.jqWindowManager().getCurrentWindow();

            if (currentWindow instanceof $.jqWindow && currentWindow != this) {
                var zIndex = this.window.css('z-index');
                var currentZIndex = currentWindow.window.css('z-index');
                this.window.css('z-index', currentZIndex);
                currentWindow.window.css('z-index', zIndex);
                $.jqWindowManager().setCurrentWindow(this);
                
                if (this.settings.overlayable) {
                    $.jqWindow.showOverlay($.jqWindow.getWindowZIndexByWindowId(this.id) - 1);
                } else {
                    var sortWindowRegistry = $($.jqWindowManager().windows).sort(function(window1, window2) {
                        return window1.window.css('z-index') < window2.window.css('z-index') ? 1 : window1.window.css('z-index') > window2.window.css('z-index') ? -1 : 0;
                    });
                    for (var key in sortWindowRegistry) {
                        var value = sortWindowRegistry[key];
                        if (value instanceof $.jqWindow && value.settings.overlayable) {
                            $.jqWindow.showOverlay($.jqWindow.getWindowZIndexByWindowId(value.getId()) - 1);
                            break;
                        }
                    }
                }
            }*/
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

        getId : function()
        {
            return this.id;
        },

        getDomId : function()
        {
            return this.window.attr('id');
        },

        setZIndex : function(zIndex)
        {
            this.zIndex = zIndex;
            this.window.css('z-index', zIndex);
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
        zIndexStart : 1000
    },

    windows : [],

    layers : [],

    setCurrentWindow : function(jqWindow)
    {
        jqWindow = this.getWindow(jqWindow);

        if (jqWindow instanceof $.jqWindow && jqWindow != this.getCurrentWindow()) {
            if (jqWindow.zIndex) {
                this.layers.splice(jqWindow.zIndex, 1);
            }
            jqWindow.setZIndex((this.layers.length ? this.layers.length : this.settings.zIndexStart) + 2);
            this.layers[jqWindow.zIndex] = jqWindow;
        }
    },

    getCurrentWindow : function()
    {
        return this.layers[this.layers.length - 1];
    },

    getCurrentWindowBefore : function()
    {
       return this.layers[this.layers.length - 1];
    },

    getWindow : function(jqWindow)
    {
        var windowId = this.getWindowIdFromMixed(jqWindow);
        return this.windows[windowId];
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
            jqWindow.id = this.getWindowCount();
            this.windows[jqWindow.getId()] = jqWindow;
            /**
             * new window is always on top (current)
             */
            this.setCurrentWindow(jqWindow);
            return true;
        }
        return false;
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

    removeWindow : function(jqWindow)
    {
        jqWindow = this.getWindow(jqWindow);

        if (jqWindow) {
            this.windows.splice(jqWindow.getId(), 1);
            this.layers.splice(jqWindow.zIndex, 1);
        }
    },

    createWindow : function(name, options, parentWindow)
    {
        return new $.jqWindow(name, options, parentWindow);
    },

    closeAll : function()
    {
        for (var key in this.windows) {
            this.windows[key].close();
        }
    },

});

})(jQuery)