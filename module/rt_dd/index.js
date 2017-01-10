module.exports = function(conf) {
	return function(debug) {
		var grunt = require('grunt')
		var path = require('path')
		var webappRoot = conf.root
		var entryFiles = conf['entry_files']
		grunt.config.set('clean', {
			options: {
				force: true
			},
			src: [
				path.normalize(webappRoot + '/static_dd/rt/dist')
			]
		})

		grunt.registerTask('fis', require('./grunt-fis')(grunt, webappRoot, entryFiles))

		if (debug) {
			grunt.config.set('clean.debug', {
	            src: ['rt_dd_map.json', 'rt_dd_fis.log']
			})
			grunt.task.run([
				'clean:debug',
				'clean',
				'fis:debug'
			])
		} else {
			grunt.task.run([
				'clean',
				'fis'
			])
		}
	}
}
