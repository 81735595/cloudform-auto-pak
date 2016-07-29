'use strict';
module.exports = function(setting){
    return function (content, file) {
        var fns = [];
        fis.util.forEach(setting.values, function(v, i) {
            fns.push(function(content){
                var reg = new RegExp("(<[script|link].*)\\$\\{"+v.key+"[^{}\\r\\n]*\\}(.*>)","ig");
                return content.replace(reg, function($0, $1, $2){
                    return $1 + v.value + $2
                })
            })
        })
        fis.util.forEach(fns, function (v) {
            content = v(content)
        })
        return content
    }
};
