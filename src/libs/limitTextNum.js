//location.origin兼容
if (!window.location.origin) {
    window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
};
(function($) {
    $.fn.extend({ //为扩展jQuery类本身.即对jQuery.prototype进得扩展，就是为jQuery类添加新方法。
        addSvgClass(className) {
            return this.each(function() {
                var attr = $(this).attr('class')
                if (attr) {
                    if (attr.indexOf(className) < 0) {
                        $(this).attr('class', attr + ' ' + className)
                    }
                } else {
                    $(this).attr('class', className)
                }
            })
        },
        removeSvgClass(className) {
            return this.each(function() {
                var attr = $(this).attr('class')
                attr = attr.replace(' ' + className, '')
                $(this).attr('class', attr)
            })
        },

    });
    $.extend({ //为jQuery类添加添加类方法，可以理解为添加静态方法。
        svg: function(tagName) {
            return $(document.createElementNS("http://www.w3.org/2000/svg", tagName));
        }
    })
})(window.Zepto || window.jQuery);

!(function(window, undefined) {
    function All() {}
    All.prototype = {
        isPC: function() {
            var userAgentInfo = navigator.userAgent;
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        }
    };
    window.func = new All();
    Array.prototype.max = function() {
        return Math.max.apply({}, this)
    }
    Array.prototype.min = function() {
        return Math.min.apply({}, this)
    }
})(window);