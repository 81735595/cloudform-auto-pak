var grunt = require('grunt')
var fis = require('fis3')

// 是否开启debug模式
var debug = !!~process.argv.indexOf('--debug')

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json')
});

grunt.tasks(['build' + (debug ? ':debug' : '')])
