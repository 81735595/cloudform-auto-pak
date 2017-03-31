module.exports = function (webappRoot, entry_files) {
    var replaceFreeMarkerVar = require('../../fis/replace-free-marker-var')
    var makePackConf = require('../../fis/make-pack-conf')
    var makePattern = require('../../fis/make-pattern')

    fis.project.setProjectRoot(webappRoot)
	fis.project.currentMedia('rt')
    fis.set('project.files', entry_files)
    fis.set('ctx', '/iform_web')
    // 暂时只针对design模块，所以这里先写死
    fis.set('namespace', 'rt')
	var fisMedia = fis.media('rt')
    // match配置区
    fisMedia.match('**', {
        deploy: [
            fis.plugin('encoding'),
            fis.plugin('local-deliver', {
                to: webappRoot
            })
        ],
		url: '${ctx}/static/dist/rt/resource$0',
		release: '/static/dist/rt/resource$0',
		useHash: true
    })
	fisMedia.match('/static/html/rt/(*.html)', {
		release: '/static/dist/rt/html/$1',
		preprocessor: [
			function(content, file){
				var script = makePackConf.regMaker('script', 'fis', true)
				var link = makePackConf.regMaker('link', 'fis', true)
				var img = makePackConf.regMaker('img', 'fis', true)
				var regAttrMaker = function (attr) {
					return new RegExp(attr + '\\s*=\\s*("(?:[^\"\\r\\n\\f])*\"|\'(?:[^\'\\n\\r\\f])*\')')
				}
				var regFisAttr = regAttrMaker('fis')
				var replaceCallbackMaker = function (attr) {
					var regAttr = regAttrMaker(attr)
					return function(match, p1) {
						return match.replace(regFisAttr, '').replace(regAttr, attr + "=" +p1)
					}
				}
				return content
					.replace(script, replaceCallbackMaker('src'))
					.replace(link, replaceCallbackMaker('href'))
					.replace(img, replaceCallbackMaker('src'))
			},
			makePackConf
		],
		useHash: false
	})
	fisMedia.match('/(static/freebill/js/*.html)', {
        id: '$1',
        parser: [
            replaceFreeMarkerVar('restore'),
            fis.plugin('require-text-and-css-plugin'),
        ],
        rExt: '.js',
        isMod: true
    })
    fisMedia.match(makePattern(
			'/static/js/rt/**.js',
			'/static/freebill/**',
			'/uui2/**.js',
			'/filesystem/**.js'
		), {
		optimizer: fis.plugin('uglify-js'),
        postprocessor: fis.plugin('amd', {
            baseUrl: 'static/',
            paths : {
				'uiReferFormInit' : "js/rt/uirefer.forminit",
				'formula2': 'js/rt/formula',
				'moneyuui': 'js/rt/moneyuui',
				'viewDataTable': 'js/rt/view.datatable',
				'mobileViewDataTable': 'js/rt/mobile.view.datatable',
				'dateintervaluui': 'js/rt/dateintervaluui',
				'ratyuui': 'js/rt/ratyuui',
				'workflow': 'freebill/js/workflow',
				'workflowmobile': 'freebill/js/workflowmobile',
				'vue': 'freebill/js/vue',
				'dateutil': 'freebill/js/dateutil',
				'texteditoruui': 'js/rt/texteditoruui',
				'billmarkeruui': 'js/rt/billmarkeruui',
				'billmarkerorguui': 'js/rt/billmarkerorguui',
				'billmarkermanageruui': 'js/rt/billmarkermanageruui',
				'billmarkerpostuui': 'js/rt/billmarkerpostuui',
				'fileuui': 'js/rt/fileuui',
				'compatibleuui': 'js/rt/compatibleuui',
				'ajaxfileupload': "../filesystem/ajaxfileupload",
				'ossupload':"../filesystem/ossupload",
				'interface_file_impl':"../filesystem/interface.file.impl",
				'interface_file':"../filesystem/interface.file",
				'ueditor': "js/rt/ueditor/ueditor.all",
				'bpm':"freebill/js/bpm",
				'utilBase':"js/rt/utils/base",
        	},
            shim : {
				dateutil: {
					init: function() {
						window.getFormatDateByLong = getFormatDateByLong;
					}
				},
				workflow: {
					deps: ["dateutil"],
					init: function () {
						window.getApproveInfosNew = getApproveInfosNew;
						window.getButtonsInfo = getButtonsInfo;
						window.workflowdata = workflowdata;
						window.getParamFromUrl = getParamFromUrl;
						window.doAction = doAction;
						window.initRefUI = initRefUI;
					}
				},
				ajaxfileupload: [],
				ossupload: {
                    exports: 'oss_upload_entrance',
                    init: function () {
                        window.oss_upload_entrance = oss_upload_entrance
                    }
                },
                interface_file: {
                    exports: 'interface_file',
                    init: function () {
                        window.interface_file = interface_file
                    }
                },
				interface_file_impl:{
					deps: ["interface_file", "ossupload", "ajaxfileupload"]
				},
				ueditor: []
            }
        })
    })

	fisMedia.match('/static/js/rt/**.js', {
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
						"uiReferComp" : window.$ctx + "/static/js/uiref/uiReferComp",\
						"uiReferFormInit" : window.$ctx + "/static/js/rt/uirefer.forminit"\
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
						},\
						"uiReferComp":{\
							deps:["uiReferFormInit", "refer", "refcommon", "refTree", "refGrid", "refGridtree"],\
							init: function () {\
								typeof window.referFormInit == "function" && window.referFormInit();\
							}\
						}\
					}\
				});\
				require.jsExtRegExp = /^\\/|:\\/\\/|\\?/;'
			)
		}
	});

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

    fisMedia.match('/pkg/(**)', {
        // 因为pkg文件夹构建之初是不存在的，所以没办法complie，只能在之后再找机会修正url中的变量，
        // 现在是在发布之后替换文件内容是做的
        // parser: replaceFreeMarkerVar('restore'),
        release: '/static/dist/rt/pkg/$1',
        url: '$_{ctx}/static/dist/rt/pkg/$1'
    })
	fisMedia.match('u.css', {
		preprocessor: [function(content, file){
			var reg = /@import\s*("(?:[^"\r\n\f])*"|'(?:[^'\n\r\f])*');/g;
			var result = content.replace(reg, function (match, p1) {
				return '@import url(\'./' + p1.replace(makePackConf.regRemoveQuo, '') + '\');'
			});
			return result
		}]
    })
    fisMedia.match('/**.css', {
        optimizer: fis.plugin('clean-css')
    })
	fisMedia.match('/**{-,.}min.{js,css}', {
		optimizer: false
	})
    fisMedia.match('::packager', {
        packager: fis.plugin('deps-pack')
    })
}
