'use strict';
// 根据html里面的标注生成deps-pack的pack-conf
var packMap = {};
var regPackInfo = /<!--pack(Js|Css)=([a-zA-Z\/\.]*)-->[\s\S\n\r]*<!--pack\1-->/g
var regPackDeps = {
    'js': /<script(?=\s)[\s\S]*?\bsrc\s*=\s*("(?:[^\\"\r\n\f]|\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')[\s\S]*?>/g,
    'css': /<link(?=\s)[\s\S]*?\bhref\s*=\s*("(?:[^\\"\r\n\f]|\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*')[\s\S]*?>/g
}
var regRemoveQuo = /[\'\"]/g

fis.on('package:start', function(){
    fis.media().set('settings.packager.deps-pack', packMap)
})
fis.match('::package', {
    prepackager: function () {
        fis.emit('package:start');
    }
})

module.exports =  function(filecontent, parentFile){
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
            file = fis.project.lookup(dep, parentFile).file
            if (file) {
                file = file.subpath
                if (~dep.indexOf('?__deps')) {
                    pack.push(file + ':deps')
                }
                pack.push(file)
            }
        }
    }
    return filecontent
}
