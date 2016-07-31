'use strict';

function restore(content, file) {
    file.url = file.url.replace(/\$_\{([^\}\r\n]*)\}/g, function (all, key) {
        return "${"+key+"}"
    })
    return content
}

function replace(values) {
    return function (content, file) {
        var fns = [];
        fis.util.forEach(values, function(v, i) {
            fns.push(function(content){
                var reg = new RegExp("(<(?:script|link|img).*)\\$\\{" + v.key + "\\}(.*>)","g");
                return content.replace(reg, function(all, pre, post){
                    return pre + v.value + post
                })
            })
        })
        fis.util.forEach(fns, function (v) {
            content = v(content)
        })
        return content
    }
}

module.exports = function(setting){
    if (setting == 'restore') {
        return restore
    }
    return replace(setting)
};
