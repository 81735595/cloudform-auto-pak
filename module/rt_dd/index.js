module.exports = function(debug) {
	var grunt = require('grunt')
	var path = require('path')
	var conf = require('../../conf').module['rt_dd']
	var webappRoot = conf.root
	var entryFiles = conf['entry_files']
	grunt.config.set('clean.rt_dd_dist', {
		options: {
			force: true
		},
		src: [
			path.normalize(webappRoot + '/static_dd/rt/dist')
		]
	})

	grunt.registerTask('fis_rt_dd', require('./grunt-fis')(grunt, webappRoot, entryFiles))

	if (debug) {
		grunt.config.set('clean.debug', {
            src: ['rt_dd_map.json', 'rt_dd_fis.log']
		})
		grunt.task.run([
			'clean:debug',
			'clean:rt_dd_dist',
			'fis_rt_dd:debug'
		])
	} else {
		grunt.task.run([
			'clean:rt_dd_dist',
			'fis_rt_dd'
		])
	}
}
