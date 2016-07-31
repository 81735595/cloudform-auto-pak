module.exports = function (webappRoot, entry_files) {
    var replaceFreeMarkerVar = require('./replace-free-marker-var')
    var makePackConf = require('./make-pack-conf')
    var makePattern = require('./make-pattern')

    fis.project.setProjectRoot(webappRoot)
    fis.set('project.files', entry_files)
    // 暂时只针对design模块，所以这里先写死
    fis.set('namespace', 'design')

    // match配置区
    fis.match('**', {
        deploy: [
            fis.plugin('encoding'),
            fis.plugin('local-deliver', {
                to: webappRoot
            })
        ]
    })
    fis.match('/WEB-INF/tmpl/(**/*.html)', {
        release: '/WEB-INF/tmpl/dist/$1',
        preprocessor: [
            replaceFreeMarkerVar([{
                key: 'uui',
                value: '../../../uui2'
            }, {
                key: 'ctx',
                value: ''
            }]),
            makePackConf
        ]
    })
    fis.match('/static/(**)', {
        parser: replaceFreeMarkerVar('restore'),
        url: '$_{ctx}/static/dist/$1',
        release: '/static/dist/$1'
    })
    fis.match('/static/(**.{png,jpg,jpeg,gif,eot,svg,ttf,woff,woff2})', {
        url: '/iform_web/static/dist/$1',
        release: '/static/dist/$1'
    })
    fis.match('/(static/js/design/{form-new,teams}/**.html)', {
        id: '$1',
        parser: [
            replaceFreeMarkerVar('restore'),
            fis.plugin('require-text-and-css-plugin'),
        ],
        rExt: '.js',
        isMod: true
    })
    fis.match('{/static/js/design/form-new/**,/static/js/filesystem/**,/static/js/design/table.js}', {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/js/design/form-new/',
            paths : {
                'table': "../table",
        		'ajaxfileupload': "../../filesystem/ajaxfileupload",
        		'ossupload': "../../filesystem/ossupload",
        		'cookie': "../../filesystem/jquery.cookie",
        		'interface_file_impl': "../../filesystem/interface.file.impl",
        		'interface_file': "../../filesystem/interface.file"
        	},
            shim : {
                'table' : [],
                'ajaxfileupload' : [],
                'cookie' : [],
                'interface_file_impl': {
                    deps: ['ajaxfileupload' , 'interface_file', 'ossupload']
                },
                'ossupload': {
                    exports: 'oss_upload_entrance',
                    init: function () {
                        window.oss_upload_entrance = oss_upload_entrance
                    }
                },
                'interface_file' : {
                    exports: 'interface_file',
                    init: function () {
                        window.interface_file = interface_file
                    }
                }
            }
        })
    })
    fis.match('/static/js/design/teams/**', {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/js/design/'
        })
    })
    fis.match(makePattern(
            '/pkg/**',
            '/static/css/design/**.css',
            '/static/(**.{png,jpg,jpeg,gif,eot,svg,ttf,woff})',
            '/static/js/design/form-new/**',
            '/static/js/design/teams/**',
            '/static/js/design/mission-center/**',
            '/static/js/filesystem/**'
        ), {
        useHash: true
    })
    fis.match('/uui2/(**)', {
        parser: replaceFreeMarkerVar('restore'),
        release: false,
        url: '$_{uui}/$1'
    })
    fis.match('/pkg/**', {
        // 因为pkg文件夹构建之初是不存在的，所以没办法complie，只能在之后再找机会修正url中的变量，
        // 现在是在发布之后替换文件内容是做的
        // parser: replaceFreeMarkerVar('restore'),
        release: '/static/dist$0',
        url: '$_{ctx}/static/dist$0'
    })
    fis.match(makePattern(
            '/static/js/design/form-new/**.js',
            '/static/js/design/teasms/**.js'
        ), {
        optimizer: fis.plugin('uglify-js')
    })
    fis.match('/static/css/design/**.css', {
        optimizer: fis.plugin('clean-css')
    })
    fis.match('/static/js/design/form-new/lib/**', {
        useAMD: false
    })
    fis.match(makePattern(
            '/static/js/design/form-new/lib/**min',
            '/static/js/design/form-new/lib/**.map'
        ), {
        optimizer: false
    })
    fis.match('::packager', {
        packager: fis.plugin('deps-pack')
    })
}
