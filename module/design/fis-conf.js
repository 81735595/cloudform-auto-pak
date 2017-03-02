module.exports = function (webappRoot, entry_files) {
    var replaceFreeMarkerVar = require('../../fis/replace-free-marker-var')
    var makePackConf = require('../../fis/make-pack-conf')
    var makePattern = require('../../fis/make-pattern')

    fis.project.setProjectRoot(webappRoot)
	fis.project.currentMedia('design')
    fis.set('project.files', entry_files)
    fis.set('ctx', '/iform_web')
    // 暂时只针对design模块，所以这里先写死
    fis.set('namespace', 'design')
	var fisMedia = fis.media('design')
    // match配置区
    fisMedia.match('**', {
        deploy: [
            fis.plugin('encoding'),
            fis.plugin('local-deliver', {
                to: webappRoot
            })
        ]
    })
    fisMedia.match('/WEB-INF/tmpl/(**/*.html)', {
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
    fisMedia.match('/static/(**)', {
        parser: replaceFreeMarkerVar('restore'),
        url: '$_{ctx}/static/dist/$1',
        release: '/static/dist/$1'
    })
    // TODO delete
    // 因为引用了ck，里面的又会异步加载一些资源文件，那些资源文件都还没有搬运，所以暂时先不做处理
    // 后续优化掉
    fisMedia.match('/static/js/design/ckeditor/ckeditor.js', {
        url: '$_{ctx}/static/js/design/ckeditor/ckeditor.js',
        release: false
    })

    fisMedia.match('/static/(**.{png,jpg,jpeg,gif,eot,svg,ttf,woff,woff2})', {
        url: '${ctx}/static/dist/$1',
        release: '/static/dist/$1'
    })
    fisMedia.match('/(static/js/design/{form-new,teams}/**.html)', {
        id: '$1',
        parser: [
            replaceFreeMarkerVar('restore'),
            fis.plugin('require-text-and-css-plugin'),
        ],
        rExt: '.js',
        isMod: true
    })
    fisMedia.match('/uui2/libs/uui/js/u.js', {
        parser: function (content) {
            return content.replace(
                /\(function\(factory\) \{[a-zA-Z0-9\\/.'=\n\r (&){}<>\-\[\]|;,]*}\(function\(koExports\, require\)\{/,
                '(function(factory) {\
                    factory(window[\'ko\'] = {});\
                }(function(koExports, require){'
            )
        }
    });

    fisMedia.match('/static/js/design/{form-new,teams}/index.js', {
		parser: function (content) {
			return content.replace(
				/\/\*__REQUIRE_CONFIG__\*\/[\s\S\n\r]*\/\*__REQUIRE_CONFIG__\*\//g,
				'\
                require.config({\
                    paths: {\
                        "refer": window.$ctx + "/static/js/uiref/refer",\
                        "reflib":  window.$ctx + "/static/js/uiref/reflib",\
                        "refGrid":  window.$ctx + "/static/js/uiref/refGrid",\
                        "refGridtree":  window.$ctx + "/static/js/uiref/refGridtree",\
                        "refTree":  window.$ctx + "/static/js/uiref/refTree",\
                        "refcommon": window.$ctx + "/static/js/uiref/refcommon",\
                        "uiReferComp" : window.$ctx + "/static/js/uiref/uiReferComp"\
                    },\
                    shim: {\
                        "refer":{\
                            deps: ["reflib"]\
                        },\
                        "refGridtree":{\
                            deps: ["reflib"]\
                        },\
                        "refGrid":{\
                            deps: ["reflib"]\
                        },\
                        "refTree":{\
                            deps: ["reflib"]\
                        },\
                        "refcommon":{\
                            deps: ["reflib"]\
                        }\
                    }\
                });\
                require.jsExtRegExp = /^\\/|:\\/\\/|\\?/;'
			)
		}
    })
    fisMedia.match(makePattern(
            '/static/js/design/form-new/**',
            '/static/js/filesystem/**',
            '/static/js/design/table.js'
        ), {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/js/design/form-new/',
            paths : {
                'table': "../table",
        		'ajaxfileupload': "../../filesystem/ajaxfileupload",
        		'ossupload': "../../filesystem/ossupload",
        		'cookie': "../../filesystem/jquery.cookie",
        		'interface_file_impl': "../../filesystem/interface.file.impl",
        		'interface_file': "../../filesystem/interface.file",
				'vue': "lib/bower_components/vue/dist/vue.min",
				'echarts': '../echarts.min'
        	},
            shim : {
				'echarts' : [],
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
    fisMedia.match(makePattern(
            '/static/js/design/teams/**',
            '/static/js/design/echarts.min.js'
        ), {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/js/design/',
            paths: {
                'echarts': 'echarts.min'
            },
            shim: {
                'echarts' : []
            }
        })
    })

    fisMedia.match(makePattern(
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
    fisMedia.match('/uui2/(**)', {
        parser: replaceFreeMarkerVar('restore'),
        release: false,
        url: '$_{uui}/$1'
    })
    fisMedia.match('/pkg/**', {
        // 因为pkg文件夹构建之初是不存在的，所以没办法complie，只能在之后再找机会修正url中的变量，
        // 现在是在发布之后替换文件内容是做的
        // parser: replaceFreeMarkerVar('restore'),
        release: '/static/dist$0',
        url: '$_{ctx}/static/dist$0'
    })
    fisMedia.match(makePattern(
        '/static/js/design/form-new/**.js',
        '/static/js/design/teams/**.js'
    ), {
        optimizer: fis.plugin('uglify-js')
    })
    fisMedia.match('/static/css/design/**.css', {
        optimizer: fis.plugin('clean-css')
    })
    fisMedia.match('/static/js/design/form-new/lib/**', {
        useAMD: false
    })
	fisMedia.match('/static/js/design/form-new/lib/**/vue/**', {
        useAMD: true
    })
    fisMedia.match(makePattern(
            '/static/js/design/**{-,.}min.{js,css}',
            '/static/js/design/form-new/lib/**.map',
            '/static/js/design/form-new/index.js',
            '/static/js/design/eteams/index.js'
        ), {
        optimizer: false
    })
    fis.match('::packager', {
        packager: fis.plugin('deps-pack')
    })
}
