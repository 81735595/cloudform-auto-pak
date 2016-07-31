var deploy = require('fis3-command-release/lib/deploy')
module.exports = function (settings, cb) {
    var replaceCustomMark = require('./replace-custom-mark')
    var total = settings.total
    deploy(settings,
        replaceCustomMark(
            total,
            {
                pattern: '/WEB-INF/tmpl/**.html',
                replaces: [
                    {
                        regexp: /<!--pack(Js|Css)=([a-zA-Z\/\.]*)-->[\s\S\n\r]*<!--pack\1-->/g,
                        replacement: function (all, type, pack){
                            var m = ''
                            var file = total[pack]
                            if (file) {
                                m = total[pack].getUrl()
                            } else {
                                type = ''
                                fis.log.warn('未找到pack文件:' + pack)
                            }
                            switch (type.toLowerCase()) {
                                case 'js':
                                    all = '<script type="text/javascript" src="' + m + '"></script>'
                                    break
                                case 'css':
                                    all = '<link type="text/css" rel="stylesheet" href="' + m + '"/>'
                                    break
                                default:
                                    break
                            }
                            return all
                        }
                    },
                    {
                        regexp: /\$_\{([^\}\r\n]*)\}/g,
                        replacement: function (all, key) {
                            return "${"+key+"}"
                        }
                    }
                ]
            },
            {
                pattern: '/static/js/design/{form-new,teams}/index.js',
                regexp: /\/\*__REQUIRE_CONFIG__\*\/[\s\S\n\r]*\/\*__REQUIRE_CONFIG__\*\//g,
                replacement: ''
            }
        )(cb)
    )
}
