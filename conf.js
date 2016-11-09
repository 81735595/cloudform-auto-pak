module.exports = {
	module: {
		'design': {
		    // 要编译的模块下的webapp文件夹的绝对路径，在编译前需要修改成本地的路径
		    root: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp',
		    // 依赖扫描的入口文件,这里应该不用修改
		    entry_files: [
		        'WEB-INF/tmpl/**/*.html'
		    ]
		},
		'rt_dd': {
			root: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/rt/src/main/webapp',
			entry_files: [
		        'static_dd/rt/iform_app/index.html'
		    ]
		}
	},
	git: {
		root: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/',
		paths: [
			'iform_parent/iform_parent/design/src/main/webapp/static/dist',
			'iform_parent/iform_parent/design/src/main/webapp/WEB-INF/tmpl/dist',
			'iform_parent/iform_parent/rt/src/main/webapp/static_dd/rt/dist'
		],
		message: '重新构建静态文件'
	}
}
