var fis = require('fis3')
var deploy = require('fis3-command-release/lib/deploy')
var fisConf = require('./fis-conf')
fisConf.init(fis)
module.exports = function(grunt) {
    var packageJson = grunt.file.readJSON('package.json')
    grunt.file.defaultEncoding = 'utf8';
    grunt.initConfig({
        pkg: packageJson,
        copy: {
            uui: {
                files: [{
                    expand: true,
                    cwd: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/iform_web/src/main/webapp/',
                    src: ['uui2/**/*'],
                    dest: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp/'
                }]
            }
        },
        clean: {
            uui: {
                options: {
                    force: true
                },
                src: ['/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp/uui2']
            },
            dist: {
                options: {
                    force: true
                },
                src: [
                    '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp/static/dist',
                    '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp/WEB-INF/tmpl/dist'
                ]
            },
            map: {
                src: ['map.json']
            }
        }
    });

    Object.keys(packageJson.dependencies)
    .filter(function(npmTaskName) {
        return npmTaskName.indexOf('grunt-') === 0;
    })
    .filter(function(npmTaskName) {
        return npmTaskName !== 'grunt-cli';
    })
    .forEach(function(npmTaskName) {
        grunt.loadNpmTasks(npmTaskName);
    });

    grunt.registerTask('fis', function() {
        var done = this.async()
        var total = {}
        var modified = {}
        var lastModified = {}
        var options = {}

        options.beforeEach = function(file) {
            if (file.isPartial)return;
            // file._start = Date.now(); // 记录起点
            file.release !== false && (total[file.subpath] = file);
            file._fromCache = true;
        };

        options.beforeCompile = function(file) {
            if (file.isPartial)return;
            file._fromCache = false;
            file.release !== false && (modified[file.subpath] = file);
        };

        options.afterEach = function(file) {
            if (file.isPartial)return;
            var mtime = file.getMtime().getTime();
            var fromCache = file._fromCache;

            if (file.release && (!fromCache || lastModified[file.subpath] !== mtime)) {
                // var cost = Date.now() - file._start;
                // var flag = fromCache ? (cost > alertCacheDurtion ? '.'.bold.yellow : '.'.grey) : (cost > alertDurtion ? '.'.bold.yellow : '.');
                lastModified[file.subpath] = mtime;
                modified[file.subpath] = file;
                // verbose ? fis.log.debug(file.realpath) : stream.write(flag);
            }
        };

        // fis.cache.clean();

        fis.release(options, function(ret){

            fis.util.map(ret.pkg, function(subpath, file) {
                modified[subpath] = file;
                total[subpath] = file;
            });

            deploy({
                options: options,
                modified: modified,
                total: total
            }, function () {
                var regHtml = fis.util.glob('/WEB-INF/tmpl/**/*.html')
                var indexJs = fis.util.glob('/static/js/design/{form-new,teams}/index.js')
                fis.util.map(ret.src, function(subpath, file) {
                    if (regHtml.test(subpath) || indexJs.test(subpath)) {
                        file.setContent(file.getContent().replace(
                            /<!--pack(Js|Css)=([a-zA-Z\/\.]*)-->[\s\S\n\r]*<!--pack\1-->/g,
                            function (all, type, pack){
                                var m = ''
                                try {
                                    m = ret.map.pkg[ret.pkg[pack].id].uri
                                } catch (e) {
                                    fis.log.error(e.message)
                                }
                                switch (type.toLowerCase()) {
                                    case 'js':
                                        m = '<script type="text/javascript" src="' + m + '"></script>'
                                        break;
                                    case 'css':
                                        m = '<link type="text/css" rel="stylesheet" href="' + m + '"/>'
                                        break;
                                    default:
                                        m = ''
                                        break;
                                }
                                return m
                            }
                        ))
                        file.setContent(file.getContent().replace(
                            /\/\*__REQUIRE_CONFIG__\*\/[\s\S\n\r]*\/\*__REQUIRE_CONFIG__\*\//g,
                            ""
                        ))
                        fis.util.write(fisConf.ROOT + file.release, file.getContent())
                    }
                })

                var temp = {}
                fis.util.each(ret.src, function(v, i) {
                    delete v._content
                    temp[i] = v
                })
                ret.src = temp
                temp = {}
                fis.util.each(ret.pkg, function(v, i) {
                    delete v._content
                    temp[i] = v
                })
                ret.pkg = temp
                grunt.file.write('map.json', JSON.stringify(ret, null, "\t"))

                done();
            })
        })
    });
}
