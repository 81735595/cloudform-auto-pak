'use strict';
// 根据html里面的标注生成pack-conf
var packMap = {};
var regPackInfo = /<!--pack(Js|Css)=([a-zA-Z\/\.]*)-->[\s\S\n\r]*<!--pack\1-->/g
var regPackDeps = {
    'js': /<script(?=\s)[\s\S]*?\bsrc\s*=\s*("(?:[^\\"\r\n\f]|\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')[\s\S]*?>/g,
    'css': /<link(?=\s)[\s\S]*?\bhref\s*=\s*("(?:[^\\"\r\n\f]|\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')[\s\S]*?>/g
}
var regRemoveQuo = /[\'\"]/g
module.exports = function (fis, key) {
    fis.on('package:start', function(){
        fis.media().set('settings.' + key, packMap)
    })
    fis.match('::package', {
        prepackager: function () {
            fis.emit('package:start');
        }
    })
    return function(filecontent, parentFile){
        var packInfo, content, type, packUrl, regPackDep, packDep, dep, temp, pack, root, file, dirname
        regPackInfo.lastIndex = 0
        while(packInfo = regPackInfo.exec(filecontent)) {
            content = packInfo[0]
            type = packInfo[1]
            packUrl = packInfo[2]
            regPackDep = regPackDeps[type.toLowerCase()]
            if (!regPackDep) {
                continue;
            }
            regPackDep.lastIndex = 0
            if (!packMap[packUrl]) {
                packMap[packUrl] = []
            }
            pack = packMap[packUrl]
            while(packDep = regPackDep.exec(content)) {
                regRemoveQuo.lastIndex = 0
                dep = packDep[1].replace(regRemoveQuo, '')
                temp = dep
                if (~dep.indexOf('?__deps')) {
                    dep = dep.replace('?__deps', '')
                }
                if (~dep.indexOf('uui')) {
                    debugger;
                }
                file = fis.project.lookup(dep, parentFile).file
                if (file) {
                    file = file.subpath
                    if (dep != temp) {
                        pack.push(file + ':deps')
                    }
                    pack.push(file)
                }
            }
        }
        /*
            {
                '/pkg/design/index.js': [
                    '/static/js/design/form-new/lib/bower_components/jquery/jquery.js',
                    '/static/js/design/form-new/lib/bower_components/underscore/underscore.js',
                    '/static/js/design/form-new/lib/bower_components/backbone/backbone.js',
                    '/static/js/design/form-new/lib/bower_components/json2/json2.js',
                    '/static/js/design/form-new/lib/bower_components/jquery-ui/dist/jquery-ui.js',
                    '/static/js/design/plugins.js',
                    '/static/js/design/ckeditor/ckeditor.js',
                    '/static/js/design/requirejs/require.js',
                    '/static/js/design/form-new/index.js:deps',
                    '/static/js/design/form-new/index.js'
                ],
                '/pkg/design/index.css': [
                    '/static/css/design/iform.ui.css',
                    '/static/css/design/iconfont/iconfont.css',
                    '/static/css/design/jquery.ui.css',
                    '/static/css/design/scrollbar.css',
                    '/static/css/design/colpick.css',
                    '/static/css/design/bootstrap.pnotify.css',
                    '/static/css/design/bootstrap.datetimepicker.css',
                    '/static/css/design/introjs.css',
                    '/static/css/design/form.css',
                    '/static/css/design/form-view.css',
                    '/static/css/design/form-typeahead.css',
                    '/static/css/design/org.css'
                ],
                '/pkg/manage/index.js': [
                    '/static/js/design/libs.js',
                    '/static/js/design/plugins.js',
                    '/static/js/design/requirejs/require.js',
                    '/static/js/design/teams/index.js:deps',
                    '/static/js/design/teams/index.js'
                ],
                '/pkg/manage/index.css': [
                    '/static/css/design/eteams.ui.min.css',
                    '/static/css/design/plugins.css',
                    '/static/css/design/eteams.min.css',
                    '/static/css/design/all-crm.min.css',
                    '/static/css/design/youyon.ui.css',
                    '/static/css/design/iconfont/iconfont.css'
                ]
            }
        */
    }
}
