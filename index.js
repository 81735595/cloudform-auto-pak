var grunt = require('grunt')
var fis = require('fis3')

// 是否开启debug模式
var debug = !!~process.argv.indexOf('--debug')

var build = !!~process.argv.indexOf('--build')

var git = !!~process.argv.indexOf('--git')

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json')
});

if (build) {
	var key = process.argv.pop()
	if (debug) {
		grunt.tasks(['module_' + key + ':debug'])
	} else {
		grunt.tasks(['module_' + key])
	}
} else if (git) {
	grunt.tasks(['git'])
}else {
	// grunt.tasks(['build-all' + (debug ? ':debug' : '')])
	// TODO 多进程
	// 
}
