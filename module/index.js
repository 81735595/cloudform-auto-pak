module.exports = function(grunt) {
	var conf = require('../conf.js')
	var module = conf.module
	var keys = Object.keys(module)
	keys.forEach(function (key) {
		grunt.registerTask('module_'+key, require('./'+key))
	})
	grunt.registerTask('module', function (debug) {
		grunt.task.run(keys.map(function(key){
			return 'module_'+ key + (debug ? ':debug' : '');
		}))
	})
}
