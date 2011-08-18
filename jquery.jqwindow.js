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
    this.parent      = null;
    this.childList   = [];

    if (parentWindow && (typeof(parentWindow) == 'string' || typeof(parentWindow) == 'integer')) {
        this.parent = $.jqWindowManager().getWindowById(parentWindow);
    } else if (parentWindow && (typeof(parentWindow) == 'object')) {
        this.parent = parentWindow;
    }

    this.settings    = $.extend(true, {}, $.jqWindow.defaults, options);
    this.name        = name;
    this.container    = this.settings.container ? $(this.settings.container) : null;
    this.init();
};

$.extend($.jqWindow, {
    id    : null,
    defaults: {
        zIndexStart              : 10000,
        type                     : 'jqwindow_normal jqwindow_padded', // window type [jqwindow_normal, jqwindow_basic, jqwindow_shadow, jqwindow_framed, jqwindow_masked, jqwindow_padded_basic, jqwindow_padded]
        title                    : '&nbsp;',
        footerContent            : '',
        container                : null,
        width                    : 400,
        height                   : 400,
        minWidth                 : 0,
        minHeight                : 0,
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
        onBeforeShow        : function(jqWindow) { return true; },
        onAfterShow            : function(jqWindow) { return true; },
        onBeforeCreate        : function() { return true; },
        onAfterCreate        : function(jqWindow) { return true; },
        onBeforeClose        : function(jqWindow) { return true; },
        onAfterClose        : function() { return true; }
    },

    prototype: {
        /**
         * Create window (@see create()),
         * and register it in the window manager
         */
        init: function()
        {
            this.create();
            this.id = $.jqWindowManager().registryWindow(this);
        },

        addChild : function(jqWindow)
        {
            this.childList[jqWindow.getWindowId()] = jqWindow;
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

            var current = this;
            var windowListToClose = [];
            for (i=0;i<itemsToClose;i++) {
                current = current.parent;
                if (current) {
                    windowListToClose[i] = current;
                }
            }

            $.each(windowListToClose, function(k, v) {
                v.close();
            });

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
                return;
            }

            var jqWindow = this;
            var windowContainer = this.container ? this.container : $('body');

            $.jqWindow.showOverlay(windowContainer, this);

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
            windowHeight = (this.settings.minHeight > 0 && windowHeight < this.settings.minHeight) ? this.settings.maxHeight : ((this.settings.maxHeight > 0 && windowHeight > this.settings.maxHeight) ? this.settings.maxHeight : windowHeight);

            // create common DOM-structure
             this.window = $('<div></div>').addClass(this.settings.windowClass)
                                           .addClass(this.settings.type)
                                          .attr('id', 'jqwindow_' + $.jqWindowManager().getWindowCount())
                                          .attr('name', this.name)
                                          .css('z-index', this.settings.zIndexStart + $.jqWindowManager().getWindowCount())
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
                top        : windowPosY
            });

            // Scrollable setting just add scrollableClass
            // to main DOM element of window
            if (this.settings.scrollable) {
                this.window.addClass(this.settings.scrollableClass);
            }

            // Create and append header to window
            this.header = $('<div></div>').addClass(this.settings.headerClass)
                                           .appendTo(this.window);

            if (this.settings.draggable) {
                this.header.addClass('draggable')
                           .bind('mousedown.app_window', function(event) {
                                jqWindow.window.addClass('drag');
                                var mousePos = {x : event.pageX - parseInt(jqWindow.window.offset().left),
                                                y : event.pageY - parseInt(jqWindow.window.offset().top)}
                                var i = 0;
                                $(window).bind('mousemove.app_window_drag', function(event) {
                                    jqWindow.drag(mousePos, event);
                                    event.preventDefault();
                                });
                                event.preventDefault();
                            });
                $(window).bind('mouseup.app_window', function(event) {
                    jqWindow.window.removeClass('drag');
                    $(window).unbind('mousemove.app_window_drag');
                });
            }

            // create window header action bar
            this.headerActionBar = $('<span></span>').addClass(this.settings.headerActionBarClass)
                                                     .appendTo(this.header);

            // create close button
            if (this.settings.closeable) {
                $('<a href="javascript:void(0)"></a>').appendTo(this.headerActionBar)
                                                      .addClass(this.settings.headerButtonClass + ' ' + this.settings.headerCloseButtonClass)
                                                      .click(function() {
                                                          jqWindow.close();
                                                      })
                                                      .append('<em>Close</em>');
            }

            /*if (settings.maximizable) {
                headerActionBar.append("<div title='maximize window' class='maximize button'></div>");
                headerActionBar.append("<div title='cascade window' class='cascade button' style='display:none;'></div>");
                headerActionBar.children('.maximize').click(function() {
                    maximize();
                });
                headerActionBar.children('.cascade').click(function() {
                    restore();
                });
            }

            if (settings.minimizable) {
                headerActionBar.append("<div title='minimize window' class='minimize button'></div>");
                headerActionBar.children('.minimize').click(function() {
                    minimize();
                });
            }

            headerActionBar.children('.button').dblclick(function() {
                return false;
            });*/

            // create window title
            $('<span></span>').addClass(this.settings.headerTitleClass)
                              .html(this.settings.title)
                              .width(this.header.width() - this.headerActionBar.width() - 5)
                              .appendTo(this.header);

            /*if (this.settings.maximizable) {
                this.header.dblclick(function() {
                    if (this.maximized) {
                        restore($window);
                    } else {
                        maximize($window);
                    }
                });
            }*/

            /**
             * Window focus/blur
             *
             * @todo need to add hooks onBeforeFocus()/onAfterFocus()/onBeforeBlur()/onAfterBlur()
             */
            this.window.mousedown(function() {
                // Current window (top window)
                var currentWindow = $.jqWindowManager().getCurrentWindow();
                var tmp = $(this).css('z-index');

                $(this).css('z-index', currentWindow.window.css('z-index'));
                currentWindow.window.css('z-index', tmp);
                $.jqWindowManager().setCurrentWindowById($(this).attr('id'));
            });

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
            this.content.height('100%');

            this.body = this.content.wrap($('<div></div>').addClass(this.settings.bodyClass).height(contentHeight));
            this.window.hide();

            // new created window is always on top (current)
            $.jqWindowManager().setCurrentWindow(this);

            this.settings.onAfterCreate(this);
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
                $.jqWindowManager().removeWindow(this.id);
                this.settings.onAfterClose();
                $.jqWindow.hideOverlay();
            }

            return true
        },

        /**
         * Window grag
         *
         * @param mousePos mouse position at screen (browser window)
         * @param event event object
         */
        drag : function (mousePos, event) {
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

        maximize : function() {
            if (!this.container) {
                $.jqWindow.hideBrowserScrollbar();
                var newDimensions = getBrowserScreenDimensions();
                var newPos = getBrowserScrollPosition();
            } else {
                var newDimensions = {width    : container.width(),
                                     height : container.height()};
                var newPos = {x    : container.offset().left,
                              y    : container.offset().top};
            }

            windowSaveParams = {width    : $window.width(),
                                height    : $window.height(),
                                x        : $window.offset().left,
                                y        : $window.offset().top}

            $window.css({
                width    : newDimensions.width,
                height    : newDimensions.height,
                top        : newPos.y,
                left    : newPos.x
            });

            headerActionBar.children(".maximize").hide();
            headerActionBar.children(".cascade").show();
            maximized = true;
        },

        setContent : function(content)
        {
            this.content.html('<div class="inner">' + content + '</div>');
        },

        setTitle : function(title)
        {
            this.header.children('.' + this.settings.headerTitleClass).html(title);
        },

        hideOverlay : function()
        {
            $.jqWindow.hideOverlay();
        },

        getWindowId : function()
        {
            return this.window.attr('id');
        }
    },
/*
    getWindowId : function()
    {
//        return this.window.attr('id');
    },
*/

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

    getBrowserScrollPosition : function() {
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

    hideBrowserScrollbar : function() {
        $('body').css('overflow', 'hidden');
    },

    showBrowserScrollbar : function() {
        /**
         * @todo Исправить
         */
        $('body').css('overflow', 'auto');
    },

    /**
     * Получить размеры рабочей области браузера
     *
     * return {width, height}
     */
    getBrowserScreenDimensions : function() {
        var width = document.documentElement.clientWidth,
            height = document.documentElement.clientHeight;
        return {width : width, height : height};
    },

    showOverlay : function(container, jqWindow)
    {
        if (this.overlay) {
            return;
        }
        this.hideBrowserScrollbar();
        this.overlay =  $('<div></div>').addClass(jqWindow.settings.overlayClass)
                                        .appendTo(container)
                                        .width(container.width())
                                        .height(container.height())
                                        .click(function() {
                                            $.jqWindowManager().closeAll();
                                        });
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
    /**
     * Curent/Focused/Top window)
     * After change focus we must define new current window
     * After close window we must securrent  window with highest z-index
     */
    currentWindow : null,

    registry : [],

    setCurrentWindow : function(jqWindow)
    {
       this.currentWindow = jqWindow;
    },

    setCurrentWindowById : function(windowId)
    {
       this.currentWindow = this.getWindowById(windowId);
    },

    getWindowById : function(windowId)
    {
        if (windowId.substring(0, 9) == 'jqwindow_') {
            windowId = windowId.substring(9, windowId.length);
        }

        return this.registry[windowId];
    },

    getCurrentWindow : function()
    {
       return this.currentWindow;
    },

    registryWindow : function(jqWindow)
    {
        var jqWindowId = this.registry.length;
        this.registry[jqWindowId] = jqWindow;
        return jqWindowId;
    },

    /**
     * Get count of windows in the registry
     *
     * @return integer
     */
    getWindowCount : function()
    {
        return this.registry.length;
    },

    removeWindow : function(id)
    {
        this.registry.splice(id, 1);
    },

    createWindow : function(name, options)
    {
        return new $.jqWindow(name, options);
    },

    closeAll : function()
    {
        for (i = 0; i < this.registry.length; i++) {
            this.registry[i].close();
        }
    }
});

})(jQuery)