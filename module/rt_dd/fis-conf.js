module.exports = function (webappRoot, entry_files) {
    var replaceFreeMarkerVar = require('../../fis/replace-free-marker-var')
    var makePackConf = require('../../fis/make-pack-conf')
    var makePattern = require('../../fis/make-pattern')

    fis.project.setProjectRoot(webappRoot)
	fis.project.currentMedia('rt_dd')
    fis.set('project.files', entry_files)
    fis.set('ctx', '/iform_web')
    // 暂时只针对design模块，所以这里先写死
    fis.set('namespace', 'rt_dd')
	var fisMedia = fis.media('rt_dd')
    // match配置区
    fisMedia.match('**', {
        deploy: [
            fis.plugin('encoding'),
            fis.plugin('local-deliver', {
                to: webappRoot
            })
        ]
    })

    fisMedia.match('/static_dd/rt/(**)', {
        // parser: replaceFreeMarkerVar('restore'),
        url: '${ctx}/static_dd/rt/dist/$1',
        release: '/static_dd/rt/dist/$1',
		useHash: true
    })

	fisMedia.match('/static_dd/rt/(iform_app/index.html)', {
		release: '/static_dd/rt/dist/$1',
		preprocessor: [makePackConf],
		useHash: false
	})

    fisMedia.match('/(static_dd/rt/iform_app/pages/**.html)', {
        id: '$1',
        parser: [
            replaceFreeMarkerVar('restore'),
            fis.plugin('require-text-and-css-plugin'),
        ],
        rExt: '.js',
        isMod: true
    })
    fisMedia.match(makePattern(
			'/static_dd/rt/*.js',
			'/static_dd/rt/iform_app/*.js',
			'/static_dd/rt/iform_app/config/**',
			'/static_dd/rt/iform_app/router/**',
			'/static_dd/rt/iform_app/pages/**'
		), {
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static_dd/rt/',
            paths : {
				'text': 'text',
				'underscore': 'underscore',
				'vue': 'vue',
				'vue-router': 'vue-router',
				'es6-promise': 'es6-promise',
				'fetch': 'fetch'
        	},
            shim : {
                'text' : [],
				'underscore': [],
				'vue': [],
				'vue-router': [],
				'es6-promise': [],
				'fetch': {
					deps: ['es6-promise'],
					init: function (es6Promise) {
						es6Promise.polyfill();
					}
				}
            }
        })
    })

    fisMedia.match('/pkg/**', {
        // 因为pkg文件夹构建之初是不存在的，所以没办法complie，只能在之后再找机会修正url中的变量，
        // 现在是在发布之后替换文件内容是做的
        // parser: replaceFreeMarkerVar('restore'),
        release: '/static_dd/rt/dist$0',
        url: '$_{ctx}/static_dd/rt/dist$0',
		useHash: true
    })
    fisMedia.match(makePattern(
		'/static_dd/rt/*.js',
		'/static_dd/rt/iform_app/*/**.js'
	), {
        optimizer: fis.plugin('uglify-js')
    })
    fisMedia.match('/static_dd/rt/**.css', {
        optimizer: fis.plugin('clean-css')
    })
    fisMedia.match('/static_dd/rt/**{-,.}min.{js,css}', {
        optimizer: false
    })
    fisMedia.match('::packager', {
        packager: fis.plugin('deps-pack')
    })
}
