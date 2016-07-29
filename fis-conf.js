var setting = {
    root: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp',
    files: [
        'WEB-INF/tmpl/**/*.html'
    ],
    port: 3000
}
var preprocessor = require('./fis/replaceFreeMarkerVar')

var makePackConf = require('./fis/makePackConf')

var makePattern = require('./fis/makePattern')

var fisConf = function (fis) {
    fis.set('namespace', 'design');

    fis.match('**', {
        deploy: [
            fis.plugin('encoding'),
            fis.plugin('local-deliver', {
                to: setting.root
            })
        ]
    })

    fis.match('/WEB-INF/tmpl/(**/*.html)', {
        release: '/WEB-INF/tmpl/dist/$1',
        preprocessor: [
            preprocessor({
                values: [{
                    key: 'uui',
                    value: '../../../uui2'
                }, {
                    key: 'ctx',
                    value: ''
                }]
            }),
            makePackConf(fis, 'packager.deps-pack')
        ]
    });
    fis.match('/static/(**)', {
        url: '${ctx}/static/dist/$1',
        release: '/static/dist/$1'
    });
    fis.match('/static/(**.{png,jpg,jpeg,gif,eot,svg,ttf,woff})', {
        url: '/iform_web/static/dist/$1',
        release: '/static/dist/$1'
    });
    fis.match('/(static/js/design/{form-new,teams}/**.html)', {
        id: '$1',
        parser: fis.plugin('amd-plugin'),
        rExt: '.js',
        isMod: true
    });
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
    });
    fis.match('/static/js/design/teams/**', {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/js/design/'
        })
    });
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
        release: false,
        url: '${uui}/$1'
    });
    fis.match('/pkg/**', {
        release: '/static/dist$0',
        url: '${ctx}/static/dist$0'
    });

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
    });
}
var init = function (fis) {
    fis.log.level = fis.log.L_ALL;
    fis.project.setProjectRoot(setting.root);
    fis.set('project.files', setting.files);
    fisConf(fis)
}
module.exports = {
    init: init,
    PORT: setting.port,
    ROOT: setting.root
}
