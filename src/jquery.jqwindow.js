/**
 * jQuery Window Plugin v.0.2
 *
 * Copyright (c) 2011 Zapp-East llc.
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * @copyright 2011 Zapp-East llc.
 * @author Julia Loykova <julinary@gmail.com> main contributor and maintainer
 * @author Eugene Myazin <meniam@gmail.com>
 * @version 0.2 beta
 * @since 11 augest 2011
 */
(function($) {
/**
 * Hash of window managers
 *
 * @type {Object}
 */
var managers = {};
/**
 * Count of window managers
 *
 * @type {Integer}
 */
var managerCount = 0;

/**
 * Create new window
 *
 * @param {String} name name of window
 * @param {Object} [options] options of window [optional]
 *
 * @constructor
 *
 * @return {jqWindow}
 */
$.jqWindow = function(name, options) {
    return $.jqWindowManager().addWindow(name, options);
}

/**
 * Create new window in container
 *
 * @param {String} name name of window
 * @param {Object} [options] options of window [optional]
 *
 * @constructor
 *
 * @return {jqWindow}
 */
$.fn.jqWindow = function(name, options) {
    return $(this).jqWindowManager().addWindow(name, options);
}


/**
 * Create new popup window in container
 *
 * @param {Object} elem
 * @param {String} name name of window
 * @param {Object} [options] options of window [optional]
 *
 * @constructor
 *
 * @return {jqWindow}
 */
$.jqPopupWindow = function(elem, name, options) {
    options = $.extend(true, {}, {
        style           : jqWindow.defaults.style + ' jqwindow_popup',
        pointerClass    : 'jqwindow_arrow',
        horizontalAlign : 'center',
        verticalAlign   : 'bottom',
        pointerHeight   : 10,
        pointerWidth    : 10,
        padding         : 2
    }, options);
    options.overlayable = false;
    options.minimizable = false;
    options.maximizable = false;
    options.resizeable = false;
    options.draggable = false;

    elem = $(elem);

    /** @var window jqWindow */
    var window = $.jqWindowManager().addWindow(name, options);
    window.type = 'popup';
    window.controlElement = elem.get(0);

    var arrow = $('<div />').addClass(options.pointerClass)
                            .css({position : 'absolute'})
                            .insertBefore(window.header);

    var elemTop = elem.offset().top - $(document).scrollTop();
    var elemLeft = elem.offset().left - $(document).scrollLeft();

    var top  = elemTop;
    var left = elemLeft;

    var maxY = window.getContainer().isWindow ? Math.max($(document).height(), window.getContainer().height()) : window.getContainer().height();
    maxY -= window.window.outerHeight(true) + options.pointerHeight + options.padding;
    var minY = window.window.outerHeight(true) + options.pointerHeight + options.padding;

    if (options.verticalAlign == 'bottom' && elem.offset().top > maxY) {
        options.verticalAlign = 'top';
    }
    if (options.verticalAlign == 'top' && elem.offset().top < minY) {
        options.verticalAlign = 'bottom';
    }
    window.window.addClass(options.verticalAlign);

    switch(options.verticalAlign) {
        case 'top':
            top -= window.window.outerHeight(true) + options.pointerHeight + options.padding;
            arrow.css({
                top    : 'auto',
                bottom : -options.pointerHeight
            });
            arrow.addClass('down');
            break;
        default :
            top += elem.outerHeight() + options.pointerHeight + options.padding;
            arrow.css({
                top    : -options.pointerHeight,
                bottom : 'auto'
            });
            arrow.addClass('up');
    }

    var maxX = window.getContainer().isWindow ? Math.max($(document).width(), window.getContainer().width()) : window.getContainer().width();
    maxX -= window.window.outerWidth(true);
    var minX = window.window.outerWidth(true);

    if (options.horizontalAlign == 'right' && (elem.offset().left < minX)) {
        options.horizontalAlign = 'center';
    }
    if (options.horizontalAlign == 'center' && (elem.offset().left < minX)) {
        options.horizontalAlign = 'left';
    }
    if (options.horizontalAlign == 'left' && (elem.offset().left > maxX)) {
        options.horizontalAlign = 'center';
    }
    if (options.horizontalAlign == 'center' && (elem.offset().left > maxX)) {
        options.horizontalAlign = 'right';
    }
    window.window.addClass(options.horizontalAlign);

    var arrowLeft  = null;
    var arrowRight = null;
    switch(options.horizontalAlign) {
        case 'right':
            left -= window.window.width() - elem.outerWidth();
            arrowRight = Math.round(elem.outerWidth() / 2);
            break;
        case 'left':
            arrowLeft = Math.round(elem.outerWidth() / 2);
            break;
        default :
            left -= Math.round(window.window.width() / 2) - Math.round(elem.outerWidth() / 2);
            arrowLeft = elemLeft + elem.outerWidth() / 2 - left;
    }
    if (arrowLeft != null) {
        arrowLeft -= Math.round(options.pointerWidth / 2);
        if (arrowLeft >= window.window.width()) {
            arrowLeft = window.window.width();
        } else if (arrowLeft < 0) {
            arrowLeft = 0;
        }
        arrow.css('left', arrowLeft);
    }
    if (arrowRight != null) {
        arrowRight -= Math.round(options.pointerWidth / 2);
        if (arrowRight >= window.window.width()) {
            arrowRight = window.window.width();
        } else if (arrowLeft < 0) {
            arrowRight = 0;
        }
        arrow.css('right', arrowRight);
    }

    window._drag(left, top);

    //@todo need refactoring
    window.addEventListener(ListenerStorage.events.afterSetContent, function() {
        var top  = elemTop;
        var left = elemLeft;

        var maxY = window.getContainer().isWindow ? Math.max($(document).height(), window.getContainer().height()) : window.getContainer().height();
        maxY -= window.window.outerHeight(true) + options.pointerHeight + options.padding;
        var minY = window.window.outerHeight(true) + options.pointerHeight + options.padding;

        if (options.verticalAlign == 'bottom' && elem.offset().top > maxY) {
            options.verticalAlign = 'top';
        }
        if (options.verticalAlign == 'top' && elem.offset().top < minY) {
            options.verticalAlign = 'bottom';
        }
        window.window.addClass(options.verticalAlign);

        switch(options.verticalAlign) {
            case 'top':
                top -= window.window.outerHeight(true) + options.pointerHeight + options.padding;
                arrow.css({
                    top    : 'auto',
                    bottom : -options.pointerHeight
                });
                arrow.addClass('down');
                break;
            default :
                top += elem.outerHeight() + options.pointerHeight + options.padding;
                arrow.css({
                    top    : -options.pointerHeight,
                    bottom : 'auto'
                });
                arrow.addClass('up');
        }
        window._drag(undefined, top);
    });

    return window;
}

/**
 * Returns window manager
 *
 * @param {Object} options
 *
 * @constructor
 *
 * @return {jqWindowManager}
 */
$.jqWindowManager = function(options) {
    if (!managers['jqwm_default']) {
        managers['jqwm_default'] = new jqWindowManager(window, options);
    }
    return managers['jqwm_default'];
}

/**
 * Returns window manager of container
 *
 * @param {Object} options
 *
 * @constructor
 *
 * @return {jqWindowManager}
 */
$.fn.jqWindowManager = function(options) {
    var container = this[0];
    if (!container) {
        return $.jqWindowManager(options);
    }
    container = $(container);
    var managerId = container.data('jqwmanager');
    if (!managerId) {
        managerId = 'jqwm_' + (managerCount + 1);
        container.data('jqwmanager', managerId);
    }
    if (!managers[managerId]) {
        managers[managerId] = new jqWindowManager(container, options);
        managerCount++;
    }
    return managers[managerId];
}

/**
 *
 * @param {Object} container
 * @param {object} options
 * @this {jqWindowManager}
 *
 * @constructor
 */
jqWindowManager = function(container, options) {
    this.settings  = $.extend(true, {}, jqWindowManager.defaults, options);
    this.container = container instanceof $ ? container : $(container);
    this.windows   = [];
    this.layers    = [];
    this.listeners = new ListenerStorage();
    this.logger    = new Logger({level : this.settings.logLevel});

    var jqWM = this;
    jqWM.container.isWindow = $.isWindow(container);
    if (!jqWM.container.isWindow) {
        jqWM.container.css('position', 'relative');
    }
    var container = jqWM.container.isWindow ? $('body') : jqWM.container;
    this.overlay =  $('<div></div>').width('100%')
                                    .height('100%')
                                    .addClass(jqWM.settings.overlayClass)
                                    .hide()
                                    .appendTo(container);
    //jqWM.container.bind('resize.jqwindow_container_resize', function() {
        /*for (var i in jqWM.windows) {
            jqWM.windows[i]._recountSizeAndPosition();
        } */
    //});
}

$.extend(jqWindowManager, {
    defaults : {
        logLevel          : 1, //1 - errors, 2 - warnings, 3 - info, 4 - debug
        zIndexStart       : 1000,
        overlayClass      : 'jqwindow_overlay'
    },
    prototype : {
        lastWindowId : 1,
        /**
         * Add new window
         *
         * @param {String} name
         * @param {Object} options
         *
         * @return {jqWindow}
         */
        addWindow : function(name, options) {
            var window = new jqWindow(name, this, options);
            window.addEventListener(ListenerStorage.events.beforeFocus, [this, this._focusWindow]);
            window.addEventListener([this, this._eventHandler]);
            if (this.settings.logLevel >= 3) {
                window.addEventListener([this.logger, this.logger._eventHandler]);
            }
            if (window.settings.overlayable) {
                window.addEventListener(ListenerStorage.events.beforeShow, [this, this._showOverlay]);
            }
            window.addEventListener(ListenerStorage.events.afterClose, [this, this._deleteWindow]);
            window.create()
                  ._setId(this.lastWindowId)
                  .focus();

            this.lastWindowId++;

            this.windows.push(window);
            return window;
        },
        /**
         * Get window
         *
         * @param {jqWindow|String|Integer} window
         *
         * @return {jqWindow|null}
         */
        getWindow : function(window) {
            var windowId = jqWindowManager._getWindowIdFromMixed(window);
            for (var i = 0, length = this.windows.length; i < length; i++) {
                if (this.windows[i].getId() == windowId) {
                    return this.windows[i];
                }
            }
            return null;
        },
        /**
         * Get window
         *
         * @param {String} name window name
         *
         * @return {jqWindow|null}
         */
        getWindowByName : function(name) {
            for (var i = 0, length = this.windows.length; i < length; i++) {
                if (this.windows[i].getName() == name) {
                    return this.windows[i];
                }
            }
            return null;
        },
        /**
         * Get count of windows
         *
         * @return {Integer}
         */
        getWindowCount : function() {
            return this.windows.length;
        },
        /**
         * Get windows array
         *
         * @return {jqWindow[]}
         */
        getWindowList : function() {
            return this.windows;
        },

        /**
         * Close all windows by type (popup|flow). If type not specified all windows will be closed.
         * @param {String|null} window type
         */
        closeWindowsByType : function(type) {
            var type = type || null;
            var windowsCount = this.getWindowCount();
            //Reverse for in the reason of "this.windows.slice" in after_close
            for (var i = windowsCount - 1; i >= 0; i--) {
                var window = this.windows[i];
                if (!type || window.getType() == type) {
                    window.close();
                }
            }
        },

        /**
         * Close popup windows
         */
        closePopupWindows : function() {
            this.closeWindowsByType('popup');
        },

        /**
         * Get focused window
         *
         * @return {jqWindow|null}
         */
        getFocusedWindow : function() {
            if (this.layers.length) {
                for (var i = this.layers.length - 1; i >= 0; i--) {
                    if (this.layers[i] instanceof jqWindow) {
                        return this.layers[i];
                    }
                }
            }
            return null;
        },
        /**
         * Add event listener for any window
         *
         * If any listener return false, event will not be run
         *
         * @param {String|Function|Object} event - event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} listener - example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]
         *
         * @since version 0.2
         *
         * @return {jqWindowManager}
         */
        addEventListener : function(event, listener) {
            this.listeners.addListener(event, listener);
            return this;
        },
        /**
         * Delete event listener for any window
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} [listener] example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]. If undefined then delete all listeners this event
         *
         * @since version 0.2
         *
         * @return {jqWindow}
         */
        deleteEventListener : function(event, listener) {
            this.listeners.deleteListener(event, listener);
            return this;
        },
        /**
         * Focus window
         *
         * @param {jqWindow|Integer|String} window
         *
         * @inner
         * @event
         *
         * @return {Boolean}
         */
        _focusWindow : function(window) {
            if (!window instanceof jqWindow) {
                window = this.getWindow(window);
            }

            if (window) {
                var focusedWindow = this.getFocusedWindow();
                if (window != focusedWindow) {
                    if (window.getZindex()) {
                        this._deleteLayer(window);
                    }
                    var windowZIndex = focusedWindow instanceof jqWindow ? focusedWindow.getZindex() + 2 : this.settings.zIndexStart;
                    window._setZindex(windowZIndex);
                    this.layers.push(window);
                    if (focusedWindow instanceof jqWindow) {
                        focusedWindow.blur();
                    }
                } else {
                    return false;
                }
            }
            return true;
        },
        /**
         * Show overlay on window focus
         *
         * @param {jqWindow} window
         *
         * @inner
         * @event
         *
         * @return {Boolean}
         */
        _showOverlay : function(window) {
            if (!window instanceof jqWindow) {
                window = this.getWindow(window);
            }
            this.overlay.addClass(window.settings.overlayClass)
                        .css('z-index', window.getZindex() - 1)
                        .show();

            this.overlay.unbind('click.jqwindow');
            if (!window.settings.modal || window.settings.overlayable) {
                this.overlay.bind('click.jqwindow', function(event) {
                    window.close();
                });
            }

            this._hideContainerScrollbar();

            return true;
        },
        /**
         * Hide overlay
         *
         * @inner
         *
         * @return {Boolean}
         */
        _hideOverlay : function() {
            this.overlay.hide();

            this._showContainerScrollbar();

            return true;
        },
        /**
         * Check overlay is necessary show
         * Show/hide overlay
         *
         * @private
         */
        _checkOverlayVisibility : function() {
            var hideOverlay = true;
            for (var i = this.layers.length - 1; i >= 0; i--) {
                if (this.layers[i].settings.overlayable) {
                    this._showOverlay(this.layers[i]);
                    hideOverlay = false;
                    break;
                }
            }
            if (hideOverlay) {
                this._hideOverlay();
            }
        },
        /**
         * Delete window from layers
         *
         * @param {jqWindow|Integer|String} window
         *
         * @inner
         */
        _deleteLayer : function(window) {
            if (!window instanceof jqWindow) {
                window = this.getWindow(window);
            }
            if (window) {
                for (var key in this.layers) {
                    if (this.layers[key].getZindex() == window.getZindex()) {
                        this.layers.splice(key, 1);
                        break;
                    }
                }
            }
        },
        /**
         * Delete window
         *
         * @param {jqWindow|String|Integer} window
         *
         * @inner
         *
         * @return {jqWindowManager}
         */
        _deleteWindow : function(window) {
            if (!window instanceof jqWindow) {
                window = this.getWindow(window);
            }
            if (window) {
                for (var key in this.windows) {
                    if (this.windows[key].getId() == window.getId()) {
                        this.windows.splice(key, 1);
                        break;
                    }
                }
                this._deleteLayer(window);
                if (window.settings.overlayable) {
                    this._checkOverlayVisibility();
                }
            }
            return this;
        },
        _hideWindow : function(window) {
            if (!window instanceof jqWindow) {
                window = this.getWindow(window);
            }
            if (window) {

            }
        },
        /**
         * Handler of windows event
         *
         * @event
         * @inner
         *
         * @return {Boolean}
         */
        _eventHandler : function() {
            return this.listeners.notify.apply(this.listeners, arguments);
        },
        /**
         * Hide container scrollbar
         *
         * @inner
         */
        _hideContainerScrollbar : function() {
            if (!this.container.scrollbarIsHide) {
                var container = this.container.isWindow ? $('body') : this.container;
                if (!this.container.cssSave) {
                    this.container.cssSave = {};
                }
                this.container.cssSave.overflow = container.css('overflow');
                this.container.scrollbarIsHide = true;

                container.css('overflow', 'hidden');
                container.bind('scroll.jqwindow_hide_scroll', function (event) {
                    event.cancelBubble = true;
                    event.returnValue = false;
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    if (event.stopPropagation) {
                        event.stopPropagation();
                    }
                    return false;
                });
            }
        },
        /**
         * Show container scrollbar
         *
         * @inner
         */
        _showContainerScrollbar : function() {
            var container = this.container.isWindow ? $('body') : this.container;
            container.css('overflow', this.container.cssSave.overflow);
            container.unbind('scroll.jqwindow_hide_scroll');
            this.container.scrollbarIsHide = false;
        }
    },
    /**
     * Get window id from mixed data
     *
     * @param {jqWindow|Integer|String} data
     *
     * @inner
     * @static
     *
     * @return {Integer} window id
     */
    _getWindowIdFromMixed : function(data) {
        var id = data;
        if (typeof(data) == 'string' && data.substring(0, 9) == 'jqwindow_') {
            id = data.substring(9, data.length);
        } else if (data instanceof jqWindow) {
            id = data.getId();
        }
        return id;
    },
    _getThemePathByName : function(themeName) {

    },
    _loadTheme : function(themePath) {

    }
});

/**
 * Create jqWindow object
 *
 * @param {String} name window name
 * @param {jqWindowManager} manager
 * @param {Object} options
 * @this {jqWindow}
 *
 * @constructor
 */
jqWindow = function(name, manager, options) {
    this.settings    = $.extend(true, {}, jqWindow.defaults, options);
    this.name        = name || 'unnamed';
    this.manager     = manager;
    this.listeners   = new ListenerStorage();
    this.type        = 'flow';

    if (this.settings.modal) {
        this.settings.overlayable = true;
        this.settings.minimizable = false;
        this.settings.maximizable = false;
        this.settings.resizeable  = false;
        this.settings.draggable   = false;
    }
};

$.extend(jqWindow, {
    defaults : {
        style                    : 'jqwindow_normal jqwindow_padded', // window style [jqwindow_normal, jqwindow_basic, jqwindow_shadow, jqwindow_framed, jqwindow_masked, jqwindow_padded_basic, jqwindow_padded]
        theme                    : 'grey',
        themePath                : '',

        title                    : '&nbsp;',
        content                  : '',
        footer                   : '',

        minimizeButtonText       : 'Minimize',
        maximizeButtonText       : 'Maximize',
        closeButtonText          : 'Close',

        scrollable               : true,
        draggable                : true,
        maximizable              : true,
        closeable                : true,
        resizeable               : true,
        overlayable              : false,
        modal                    : false,

        contentOverflowY         : 'scroll', // window content overflow [hidden, scroll, autoresize]

        width                    : 400,
        height                   : 400,
        minWidth                 : 100,
        minHeight                : 100,
        maxWidth                 : 0,
        maxHeight                : 0,
        left                     : -1,
        top                      : -1,

        allowSpadeNorth          : false, // Allow outstep north boudn of the container (or window) while dragging
        allowSpadeEast           : false, // Allow outstep east boudn of the container (or window) while dragging
        allowSpadeSouth          : false, // Allow outstep south boudn of the container (or window) while dragging
        allowSpadeWest           : false, // Allow outstep west boudn of the container (or window) while dragging

        scrollToDuration         : 200, //Parameter "duration" of the animation scrolling window content
        scrollToEasing           : 'linear', //Parameter "easing" of the animation scrolling window content

        // css classes
        windowClass              : 'jqwindow',
        headerClass              : 'jqwindow_header',
        titleClass               : 'jqwindow_title',
        actionBarClass           : 'jqwindow_action_bar',
        actionBarButtonClass     : 'jqwindow_button',
        maximizeButtonClass      : 'jqwindow_maximize',
        minimizeButtonClass      : 'jqwindow_minimize',
        closeButtonClass         : 'jqwindow_close',
        footerClass              : 'jqwindow_footer',
        bodyClass                : 'jqwindow_body',
        contentClass             : 'jqwindow_content',
        scrollableClass          : 'jqwindow_scrollable',
        draggableClass           : 'jqwindow_draggable',
        focusClass               : 'jqwindow_focus',
        overlayClass             : 'jqwindow_overlay',
        modalOverlayClass        : 'jqwindow_modal_overlay'
    },
    prototype : {
        /**
         * @type {boolean}
         */
        isVisible : false,
        /**
         * At this point we create DOM structure
         * for new window, but don't show it
         *
         * Window show by @see jqWindow.show() method
         *
         * @return {jqWindow}
         */
        create : function() {
            var jqW = this;
            // if window exists (second call) or any listener "before_create" return false
            // value we don't create DOM structure
            if (jqW.window || !jqW.listeners.notify(ListenerStorage.events.beforeCreate, jqW)) {
                return jqW;
            }

            var container = !jqW.manager.container.isWindow ? jqW.manager.container : $('body');

            // create common DOM-structure
            jqW.window = $('<div></div>').addClass(jqW.settings.windowClass)
                                         .addClass(jqW.settings.style)
                                         .attr('name', jqW.name)
                                         .bind('mousedown.jqwindow_focus', function() {
                                            jqW.focus();
                                         })
                                         .appendTo(container);

            // Scrollable setting just add scrollableClass
            // to main DOM element of window
            if (jqW.settings.scrollable) {
                jqW.window.addClass(jqW.settings.scrollableClass);
            }

            // Create and append header to window
            jqW.header = $('<div></div>').addClass(jqW.settings.headerClass)
                                         .appendTo(jqW.window);

            if (jqW.settings.draggable) {
                jqW.header.addClass(jqW.settings.draggableClass)
                           .bind('mousedown.jqwindow_drag', function(event) {
                                if (jqW.listeners.notify(ListenerStorage.events.beforeDrag, jqW)) {
                                    var startPosX = jqW.getContainer().scrollLeft() + event.pageX - jqW.window.offset().left;
                                    var startPosY = jqW.getContainer().scrollTop() + event.pageY - jqW.window.offset().top;
                                    $(window).bind('mousemove.jqwindow_drag', function(event) {
                                        var posX = event.pageX - startPosX;
                                        posX -= jqW.getContainer().isWindow ? 0 : jqW.getContainer().offset().left;
                                        var posY = event.pageY - startPosY;
                                        posY -= jqW.getContainer().isWindow ? 0 : jqW.getContainer().offset().top;
                                        jqW._drag(posX, posY);
                                        event.preventDefault();
                                    });
                                    $(window).bind('mouseup.jqwindow_drag', function() {
                                        $(window).unbind('mousemove.jqwindow_drag');
                                        $(window).unbind('mouseup.jqwindow_drag');
                                        jqW.listeners.notify(ListenerStorage.events.afterDrag, jqW);
                                    });
                                }
                                event.preventDefault();
                           });
            }

            // create window header action bar
            jqW.actionBar = $('<span></span>').addClass(this.settings.actionBarClass)
                                              .appendTo(this.header);


            // create maximize/minimize button
            if (jqW.settings.maximizable) {
                $('<a href="javascript:void(0)"></a>').appendTo(jqW.actionBar)
                                                      .addClass(jqW.settings.actionBarButtonClass + ' ' + jqW.settings.maximizeButtonClass)
                                                      .click(function() {
                                                            jqW.maximize();
                                                      })
                                                      .append('<em>' + jqW.settings.maximizeButtonText + '</em>');

                $('<a href="javascript:void(0)"></a>').appendTo(jqW.actionBar)
                                                      .addClass(jqW.settings.actionBarButtonClass + ' ' + jqW.settings.minimizeButtonClass)
                                                      .click(function() {
                                                            jqW.minimize();
                                                      })
                                                      .hide()
                                                      .append('<em>' + jqW.settings.minimizeButtonText + '</em>');
                jqW.header.dblclick(function() {
                    if (jqW.maximized) {
                        jqW.minimize();
                    } else {
                        jqW.maximize();
                    }
                });
            }

            // create close button
            if (jqW.settings.closeable) {
                $('<a href="javascript:void(0)"></a>').appendTo(jqW.actionBar)
                                                      .addClass(jqW.settings.actionBarButtonClass + ' ' + jqW.settings.closeButtonClass)
                                                      .click(function() {
                                                            jqW.close();
                                                      })
                                                      .append('<em>' + jqW.settings.closeButtonText + '</em>');
            }

            // create window title
            jqW.title = $('<span></span>').addClass(jqW.settings.titleClass)
                                        .html(jqW.settings.title)
                                        .width(jqW.header.width() - jqW.actionBar.width() - 5)
                                        .appendTo(jqW.header);

            // create footer
            if (jqW.settings.footer) {
                jqW.footer = $('<div></div>').addClass(jqW.settings.footerClass)
                                             .html(jqW.settings.footer)
                                             .appendTo(jqW.window);
            }

            jqW.content = $('<div />').addClass(jqW.settings.contentClass)
                                      .appendTo(jqW.window);

            var contentHeight = jqW.window.height() - jqW.header.outerHeight(true) - (jqW.content.outerHeight(true) - jqW.content.height());
            jqW.content.wrap($('<div></div>')
                       .addClass(jqW.settings.bodyClass)
                       .height(contentHeight));
            jqW.body = jqW.content.parent();

            if (jqW.settings.contentOverflowY == 'scroll') {
                jqW.body.css('overflow-y', 'auto');
            }
            if (jqW.settings.contentOverflowY == 'hidden') {
                jqW.body.css('overflow-y', 'hidden');
            }

            // Scroll to anchor
            jqW.content.delegate('a[href*="#"]', 'click', function(event) {
                var url = $(this).attr("href");
                var anchorName = url.substr(url.search('#') + 1);
                var scrollTop = $('[name="' + anchorName + '"]').offset().top - jqW.body.offset().top + jqW.body.scrollTop();
                jqW.body.animate({scrollTop: scrollTop}, jqW.settings.scrollToDuration, jqW.settings.scrollToEasing);

                event.cancelBubble = true;
                event.returnValue = false;
                if (event.preventDefault) {
                    event.preventDefault();
                }
                if (event.stopPropagation) {
                    event.stopPropagation();
                }
                return false;
            });

            if (jqW.settings.resizeable) {
                var endResizeFunction = function() {
                    $(window).unbind('mousemove.jqwindow_resize');
                    $(window).unbind('mouseup.jqwindow_resize');
                    jqW.listeners.notify(ListenerStorage.events.afterResize, jqW);
                };
                $('<div></div>').css({position : 'absolute',
                                      top      : 0,
                                      right    : 0,
                                      cursor   : 'w-resize',
                                      width    : '3px',
                                      height   : '100%'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                        if (!jqW.maximized && jqW.listeners.notify(ListenerStorage.events.beforeResize, jqW)) {
                                            var windowOffsetLeft = jqW.window.offset().left;
                                            $(window).bind('mousemove.jqwindow_resize', function(event) {
                                                var width = event.pageX - windowOffsetLeft;
                                                jqW._resize(width, null);
                                                event.preventDefault();
                                            });
                                            $(window).bind('mouseup.jqwindow_resize', endResizeFunction);
                                        }
                                        event.preventDefault();
                                })
                                .appendTo(this.window);
                $('<div></div>').css({position : 'absolute',
                                      bottom   : 0,
                                      left     : 0,
                                      cursor   : 's-resize',
                                      width    : '100%',
                                      height   : '5px'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                        if (!jqW.maximized && jqW.listeners.notify(ListenerStorage.events.beforeResize, jqW)) {
                                            var windowOffsetTop = jqW.window.offset().top;
                                            $(window).bind('mousemove.jqwindow_resize', function(event) {
                                                var height = event.pageY - windowOffsetTop;
                                                jqW._resize(null, height);
                                                event.preventDefault();
                                            });
                                            $(window).bind('mouseup.jqwindow_resize', endResizeFunction);
                                        }
                                        event.preventDefault();
                                })
                                .appendTo(this.window);
                $('<div></div>').css({position : 'absolute',
                                      bottom   : 0,
                                      right    : 0,
                                      width    : '5px',
                                      height   : '5px',
                                      cursor   : 'se-resize'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                    if (!jqW.maximized && jqW.listeners.notify(ListenerStorage.events.beforeResize, jqW)) {
                                        var windowOffsetLeft = jqW.window.offset().left;
                                        var windowOffsetTop = jqW.window.offset().top;
                                        $(window).bind('mousemove.jqwindow_resize', function(event) {
                                            var width = event.pageX - windowOffsetLeft;
                                            var height = event.pageY - windowOffsetTop;
                                            jqW._resize(width, height);
                                            event.preventDefault();
                                        });
                                        $(window).bind('mouseup.jqwindow_resize', endResizeFunction);
                                    }
                                    event.preventDefault();
                                })
                                .appendTo(this.window);
                /*
                // Реализация оставлена до лучших времен
                $('<div></div>').css({position : 'absolute',
                                      left     : 0,
                                      top      : 0,
                                      width    : '5px',
                                      height   : jqW.window.height(),
                                      cursor   : 'w-resize'})
                                .bind('mousedown.jqwindow_resize', function(event) {
                                    if (!jqW.maximized && jqW.listeners.notify(ListenerStorage.events.beforeResize, jqW)) {
                                        var startPosX = event.pageX;
                                        var windowWidth = jqW.window.width();
                                        var maxPosX = jqW.window.offset().left + jqW.window.outerWidth(true) - jqW.settings.minWidth;
                                        $(window).bind('mousemove.jqwindow_resize', function(event) {
                                            var width = startPosX - event.pageX + windowWidth;
                                            var posX = event.pageX;
                                            posX = posX > maxPosX ? maxPosX : posX;
                                            if (posX < maxPosX) {
                                                jqW._drag(posX, null);
                                            }
                                            jqW._resize(width, null);
                                            event.preventDefault();
                                        });
                                        $(window).bind('mouseup.jqwindow_resize', endResizeFunction);
                                    }
                                    event.preventDefault();
                                })
                                .appendTo(this.window); */
            }

            //jqW._recountSizeAndPosition();
            jqW._resize(jqW.settings.width, jqW.settings.height);
            var posX = jqW.settings.left != -1 ? jqW.settings.left : 'center';
            var posY = jqW.settings.top != -1 ? jqW.settings.top : 'middle';
            jqW._drag(posX, posY);

            jqW.setContent(jqW.settings.content);

            jqW.window.hide();

            jqW.listeners.notify(ListenerStorage.events.afterCreate, jqW);
            return jqW;
        },
        /**
         * Show the window
         *
         * @return {jqWindow}
         */
        show : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeShow, this)) {
                this.window.show();
                this.isVisible = true;
                this.listeners.notify(ListenerStorage.events.afterShow, this);
            }
            return this;
        },
        /**
         * Hide the window
         *
         * @return {jqWindow}
         */
        hide : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeHide, this)) {
                this.window.hide();
                this.isVisible = false;
                this.listeners.notify(ListenerStorage.events.afterHide, this);
            }
            return this;
        },
        /**
         * Close window
         */
        close : function() {
           if (this.listeners.notify(ListenerStorage.events.beforeClose, this)) {
                this.window.remove();
                this.listeners.notify(ListenerStorage.events.afterClose, this);
                delete this;
           }
        },
        /**
         * Focus window
         *
         * @return {jqWindow}
         */
        focus : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeFocus, this)) {
                this.window.addClass(this.settings.focusClass);
                this.listeners.notify(ListenerStorage.events.afterFocus, this);
            }
            return this;
        },
        /**
         * Blur window
         *
         * @return {jqWindow}
         */
        blur : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeBlur, this)) {
                this.window.removeClass(this.settings.focusClass);
                this.listeners.notify(ListenerStorage.events.afterBlur, this);
            }
            return this;
        },
        /**
         * Maximize window
         *
         * @return {jqWindow}
         */
        maximize : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeMaximize, this)) {
                this.manager._hideContainerScrollbar();
                var offset = this.getContainer().offset();
                offset = offset ? offset : {left : 0, top : 0};

                /*jqWindow.windowSaveParams = {width  : jqWindow.window.width(),
                    height : jqWindow.window.height(),
                    x      : jqWindow.window.offset().left,
                    y      : jqWindow.window.offset().top}; */

                this.window.css({
                    width    : this.getContainer().width(),
                    height   : this.getContainer().height(),
                    top      : offset.left,
                    left     : offset.top
                });

                this.actionBar.children('.' + this.settings.maximizeButtonClass).hide();
                this.actionBar.children('.' + this.settings.minimizeButtonClass).show();
                this.maximized = true;

                //this.recountSizeWindowItems(jqWindow);
                this.listeners.notify(ListenerStorage.events.afterMaximize, this);
            }
            return this;
        },
        /**
         * Minimize window
         *
         * @return {jqWindow}
         */
        minimize : function() {
            if (this.listeners.notify(ListenerStorage.events.beforeMinimize, this)) {
                this.manager._showContainerScrollbar();

                this.window.css({
                    width    : this.width,
                    height   : this.height,
                    top      : this.top,
                    left     : this.left
                });

                this.actionBar.children('.' + this.settings.maximizeButtonClass).show();
                this.actionBar.children('.' + this.settings.minimizeButtonClass).hide();
                this.maximized = false;

                //this.recountSizeWindowItems(jqWindow);
                this.listeners.notify(ListenerStorage.events.afterMinimize, this);
            }
            return this;
        },
        /**
         * Drag window
         *
         * @param {Integer|String} posX
         * @param {Integer|String} posY
         *
         * @return {jqWindow}
         */
        drag : function(posX, posY) {
            if (this.listeners.notify(ListenerStorage.events.beforeDrag, this)) {
                this._drag(posX, posY);
                this.listeners.notify(ListenerStorage.events.afterDrag, this);
            }
            return this;
        },
        /**
         * Drag window
         *
         * @param {Integer|String} posX
         * @param {Integer|String} posY
         *
         * @inner
         */
        _drag : function(posX, posY) {
            var newPosition = {};
            if (posX || posX == 0) {
                if (posX == 'left') {
                    posX = 0;
                } else if (posX == 'right') {
                    posX = this.getContainer().width() - this.window.width();
                } else if (posX == 'center') {
                    posX = (this.getContainer().width() - this.window.width()) / 2;
                } else if (posX[posX.length - 1] == '%') {
                    posX = parseInt(posX.substr(0, posX.length - 1)) * (this.getContainer().width()) / 100;
                }
                posX += this.getContainer().scrollLeft();
                if (!this.settings.allowSpadeWest) {
                    var minX = 0;
                } else {
                    var minX = -1;
                }
                if (!this.settings.allowSpadeEast) {
                    var maxX = this.getContainer().isWindow ? Math.max($(document).width(), this.getContainer().width()) : this.getContainer().width();
                    maxX -= this.window.outerWidth(true);
                } else {
                    var maxX = -1;
                }
                posX = Math.max(minX, posX);
                posX = maxX >= 0 ? Math.min(maxX, posX) : posX;
                newPosition.left = posX;
            }

            if (posY || posY == 0) {
                if (posY == 'top') {
                    posY = 0;
                } else if (posY == 'bottom') {
                    posY = this.getContainer().height() - this.window.height();
                } else if (posY == 'middle') {
                    posY = (this.getContainer().height() - this.window.height()) / 2;
                } else if (posY[posY.length - 1] == '%') {
                    posY = parseInt(posY.substr(0, posY.length - 1)) * (this.getContainer().height()) / 100;
                }
                posY += this.getContainer().scrollTop();
                if (!this.settings.allowSpadeNorth) {
                    var minY = 0;
                } else {
                    var minY = -1;
                }
                if (!this.settings.allowSpadeSouth) {
                    var maxY = this.getContainer().isWindow ? Math.max($(document).height(), this.getContainer().height()) : this.getContainer().height();
                    maxY -= this.window.outerHeight(true);
                } else {
                    var maxY = -1;
                }
                posY = Math.max(minY, posY);
                posY = maxY >= 0 ? Math.min(maxY, posY) : posY;
                newPosition.top = posY;
            }
            this.window.css(newPosition);
        },
        /**
         * Resize window
         *
         * @param {String|Integer|null} width new width
         * @param {String|Integer|null} height new height
         *
         * @return {jqWindow}
         */
        resize : function (width, height) {
            if (this.listeners.notify(ListenerStorage.events.beforeResize, this)) {
                this._resize(width, height);
                this.listeners.notify(ListenerStorage.events.afterResize, this);
            }
            return this;
        },
        /**
         * Resize window
         *
         * @param {String|Integer|null} width new width
         * @param {String|Integer|null} height new height
         *
         * @inner
         *
         * @return {Boolean} true - if size of window was changed
         */
        _resize : function (width, height) {
            var result = false;
            if (width) {
                var containerWidth = this.getContainer().width();
                if (width[width.length - 1] == '%') {
                    width = parseInt(width.substr(0, width.length - 1)) * containerWidth / 100;
                }
                /*if (width > containerWidth) {
                 width = containerWidth;
                 }   */
                if (this.settings.minWidth > 0 && width < this.settings.minWidth) {
                    width = this.settings.minWidth;
                } else if (this.settings.maxWidth > 0 && width > this.settings.maxWidth) {
                    width = this.settings.maxWidth;
                }
                if (this.window.width() != width) {
                    this.window.width(width);
                    var titleWidth = this.header.width() - this.actionBar.width() - 5;
                    this.title.width(titleWidth);
                    result = true;
                }
            }
            if (height) {
                var containerHeight = this.getContainer().height();
                if (height[height.length - 1] == '%') {
                    height = parseInt(height.substr(0, height.length - 1)) * containerHeight / 100;
                }
                /*if (height > containerHeight) {
                 height = containerHeight;
                 }  */
                if (this.settings.minHeight > 0 && height < this.settings.minHeight) {
                    height = this.settings.minHeight;
                } else if (this.settings.maxHeight > 0 && height > this.settings.maxHeight) {
                    height = this.settings.maxHeight;
                }
                if (this.window.height() != height) {
                    this.window.height(height);
                    var contentHeight = this.window.height() - this.header.outerHeight(true) - (this.content.outerHeight(true) - this.content.height());
                    this.body.height(contentHeight);
                    result = true;
                }
            }
            return result;
        },
        /**
         * Add event listener for window
         *
         * If any listener return false, event will not be run
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} listener example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]
         *
         * @since version 0.2
         *
         * @return {jqWindow}
         */
        addEventListener : function(event, listener) {
            this.listeners.addListener(event, listener);
            return this;
        },
        /**
         * Delete event listener for window
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} [listener] example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]. If undefined then delete all listeners this event
         *
         * @since version 0.2
         *
         * @return {jqWindow}
         */
        deleteEventListener : function(event, listener) {
            this.listeners.deleteListener(event, listener);
            return this;
        },
        /**
         * Get window unique id
         *
         * @return {Integer}
         */
        getId : function() {
            return this.id;
        },
        /**
         * Set window unique id
         *
         * @param {Integer} id new id
         *
         * @inner
         *
         * @return {jqWindow}
         */
        _setId : function(id) {
            if (!this.id) {
                this.id = id;
                this.window.attr('id', 'jqwindow_' + this.id);
            }
            return this;
        },
        /**
         * Get DOM element z-index
         *
         * @return integer
         */
        getZindex : function() {
            return this.zIndex;
        },
        /**
         * Set DOM element z-index
         *
         * @param {Integer} zIndex new z-index
         *
         * @inner
         *
         * @return jqWindow
         */
        _setZindex : function(zIndex) {
            this.zIndex = zIndex;
            this.window.css('z-index', zIndex);
            return this;
        },
        /**
         * Get DOM element id attr
         *
         * @return string
         */
        getDomId : function() {
            return this.window.attr('id');
        },
        /**
         * Get window manager container
         *
         * @return {jQuery}
         */
        getContainer : function() {
            return this.manager.container;
        },
        /**
         * Set content of the window
         *
         * @param {DOM|String} content
         *
         * @return {jqWindow}
         */
        setContent : function(content) {
            if (this.listeners.notify(ListenerStorage.events.beforeSetContent, this)) {
                if (content instanceof $) {
                    this.content.empty();
                    this.content.prepend(content);
                } else {
                    this.content.html(content);
                }
                if (this.settings.contentOverflowY == 'autoresize') {
                    if (!this.isVisible) {
                        this.window.show();
                    }
                    var contentHeight = this.content.outerHeight(true);
                    var bodyHeight = this.body.height();
                    var windowHeight = contentHeight + this.header.outerHeight(true) + (this.body.outerHeight(true) - bodyHeight);
                    if (!this.isVisible) {
                        this.window.hide();
                    }
                    if (this.settings.maxHeight && windowHeight > this.settings.maxHeight) {
                        this.body.css('overflow-y', 'auto');
                    } else {
                        this.body.css('overflow-y', 'none');
                    }
                    this.resize(undefined, windowHeight);
                }
                this.listeners.notify(ListenerStorage.events.afterSetContent, this);
            }
            return this;
        },
        /**
         * Set window title
         *
         * @param {String} title
         *
         * @return {jqWindow}
         */
        setTitle : function(title) {
            this.title.html(title);

            return this;
        },
        /**
         * Return window name
         *
         * @return {String}
         */
        getName : function() {
            return this.name;
        },

        getType : function() {
            return this.type;
        },

        isFlowWindow : function() {
            return this.type == 'flow';
        },

        isPopupWindow : function() {
            return this.type == 'popup';
        }
        /**
         * Recount size and position of window
         *
         * @inner
         *
         * @todo Need fix. Lost current position and dimensions of the window and reset to defaults when browser window resize
         *
         * @return {jqWindow}
         */
        /*_recountSizeAndPosition : function() {
            var jqW = this;
            if (jqW.maximized) {
                jqW.maximize();
                return this;
            }

            // Calculate window width and height
            var windowWidth = jqW.width ? jqW.width : jqW.settings.width;
            var windowHeight = jqW.height ? jqW.height : jqW.settings.height;
            jqW._resize(windowWidth, windowHeight);

            // calculate and set position of window
            var windowPosX = jqW.left ? jqW.left : jqW.settings.left;
            var windowPosY = jqW.top ? jqW.top : jqW.settings.top;
            windowPosX = windowPosX != -1 ? windowPosX : 'center';
            windowPosY = windowPosY != -1 ? windowPosY : 'middle';
            jqW._drag(windowPosX, windowPosY);

            return this;
        }, */
    }
});

/**
 * @constructor
 * @since version 0.2
 */
ListenerStorage = function() {
    this.listeners = {};
}
$.extend(ListenerStorage, {
    events : {
        beforeCreate    : 'before_create',
        afterCreate     : 'after_create',
        beforeShow      : 'before_show',
        afterShow       : 'after_show',
        beforeHide      : 'before_hide',
        afterHide       : 'after_hide',
        beforeFocus     : 'before_focus',
        afterFocus      : 'after_focus',
        beforeBlur      : 'before_blur',
        afterBlur       : 'after_blur',
        beforeClose     : 'before_close',
        afterClose      : 'after_close',
        beforeMaximize  : 'before_maximize',
        afterMaximize   : 'after_maximize',
        beforeMinimize  : 'before_minimize',
        afterMinimize   : 'after_minimize',
        beforeDrag      : 'before_drag',
        afterDrag       : 'after_drag',
        beforeResize    : 'before_resize',
        afterResize     : 'after_resize',
        beforeSetContent: 'before_set_content',
        afterSetContent : 'after_set_content'
    },
    prototype : {
        /**
         * Add listener in storage
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} listener example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]
         */
        addListener : function(event, listener) {
            if (typeof event != 'string') {
                listener = event;
                event = 'all';
            }
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(listener);
        },
        /**
         * Delete listener from storage
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.) or listener (if need listen all events)
         * @param {Function|Array} [listener] example, function(){return true} or [new jqWindowManager(), new jqWindowManager()._eventHandler]. If undefined then delete all listeners this event
         */
        deleteListener : function(event, listener) {
            if (typeof event != 'string') {
                listener = event;
                event = 'all';
            }
            if (!this.listeners[event]) {
                return;
            }
            if (listener == undefined) {
                delete this.listeners[event];
                return;
            }
            for (var i in this.listeners[event]) {
                if (this.listeners[event][i] == listener) {
                    this.listeners[event].splice(i, 1);
                    break;
                }
            }
        },
        /**
         * Notify listeners about event
         *
         * @param {String|Function|Object} event event type (before_show, after_show etc.)
         *
         * @return {Boolean}
         */
        notify : function(event) {
           var result = true;
           if (this.listeners[event]) {
               var args = Array.prototype.slice.call(arguments, 1);
               for (var i in this.listeners[event]) {
                   var listener = this.listeners[event][i];
                   if (listener instanceof Array) {
                       result = listener[1].apply(listener[0], args);
                   } else {
                       result = listener.apply(null, args);
                   }
                   if (result == false) {
                       return result;
                   }
               }
           }
           if (this.listeners['all']) {
               for (var i in this.listeners['all']) {
                   var listener = this.listeners['all'][i];
                   if (listener instanceof Array) {
                       result = listener[1].apply(listener[0], arguments);
                   } else {
                       result = listener.apply(null, arguments);
                   }
                   if (result == false) {
                       return result;
                   }
               }
           }
           return result;
       }
    }
});
/**
 * @class
 * @constructor
 * @since version 0.2
 */
Logger = function(options) {
    this.settings = $.extend(true, {}, Logger.defaults, options);
    //this.adapter = console != undefined ? 'console' : 'alert';
    if (window.console != undefined) {
        this.adapter = console;
    } else {
        this.settings.level = 1;
        this.adapter = {
            info : function(message) {
                alert(message);
            },
            warn : function(message) {
                alert(message);
            },
            error : function(message) {
                alert(message);
            }
        }
    }
}
$.extend(Logger, {
    defaults : {
        level : 4 //1 - errors, 2 - warnings, 3 - info, 4 - debug
    },
    prototype : {
        _eventHandler : function() {
            var event = arguments[0];
            var args = Array.prototype.slice.call(arguments).slice(1);
            if (this.settings.level >= 3) {
                this.adapter.info('Init event "' + event + '"');
            }
            if (this.settings.level == 4) {
                this.adapter.info('Arguments:');
                this.adapter.info(args);
                this.adapter.info('-----------');
            }
            return true;
        }
    }
});

})(jQuery);
