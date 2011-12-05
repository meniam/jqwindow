/**
 * @author Julia Loykova <julinary@gmail.com>
 */
(function($) {
    $.fn.jqCodeHighlighter = function() {
        var className = 'jqcode';
        return $(this).each(function(key, element) {
            var code = $(element).html()
                .replace(/(var|function|typeof|new|return|if|for|in|while|break|do|continue|switch|case)([^a-z0-9\$_])/gi, '<span class="' + className + ' keyword">$1</span>$2')
                .replace(/(\{|\}|\]|\[|\|)/gi, '<span class="' + className + ' keyword">$1</span>')
                .replace(/(\/\/[^\n\r]*(\n|\r\n))/g, '<span class="' + className + ' comment">$1</span>')
                .replace(/('.*?')/g, '<span class="' + className + ' str">$1</span>')
                .replace(/([a-z\_\$][a-z0-9_]*)\(/gi, '<span class="' + className + ' function">$1</span>(')
                .replace(/\t/g, '    ');
            code = '<pre>' + code + '</pre>';
            $(element).html(code);
        });
    }
})(jQuery);