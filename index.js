var grunt = require('grunt')
var fis = require('fis3')
var config = require('./conf')
var path = require('path')

var webappRoot = config.root
var entry_files = config.entry_files
// 是否开启debug模式
var debug = !!~process.argv.indexOf('--debug')

if (!grunt.file.isDir(webappRoot)) {
    grunt.log.error().error('未找到云表单项目文件夹')
    return ;
}

grunt.initConfig(
    {
        pkg: grunt.file.readJSON('package.json'),
        webappRoot: webappRoot,
        entry_files: entry_files,
        copy: {
            // 因为uui没有在design模块中，所以需要在编译前先把uui挪过来，编译后再删掉
            uui: {
                files: [{
                    expand: true,
                    // uui文件夹的位置，默认是根据当前webapp文件夹去找
                    cwd: path.normalize(webappRoot + '/../../../../iform_web/src/main/webapp/'),
                    src: ['uui2/**/*'],
                    dest: webappRoot
                }]
            }
        },
        clean: {
            // 因为uui没有在design模块中，所以需要在编译前先把uui挪过来，编译后再删掉
            uui: {
                options: {
                    force: true
                },
                src: [path.normalize(webappRoot + '/uui2')]
            },
            // 删除之前存在的输出文件
            dist: {
                options: {
                    force: true
                },
                src: [
                    path.normalize(webappRoot + '/static/dist'),
                    path.normalize(webappRoot + '/WEB-INF/tmpl/dist')
                ]
            },
            // debug模式中，删除之前存在的输出文件
            map: {
                src: ['map.json']
            }
        }
    }
);


grunt.tasks(['build' + (debug ? '_debug' : '')])
