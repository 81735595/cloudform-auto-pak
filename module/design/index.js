module.exports = function(conf){
	return function(debug) {
		var grunt = require('grunt')
		var path = require('path')
		var webappRoot = conf.root
		var entryFiles = conf['entry_files']
		grunt.config.set('copy.uui', {
			files: [{
				expand: true,
				// uui文件夹的位置，默认是根据当前webapp文件夹去找
				cwd: path.normalize(webappRoot + '/../../../../iform_web/src/main/webapp/'),
				src: ['uui2/**/*'],
				dest: webappRoot
			}]
		})
		grunt.config.set('clean', {
			options: {
				force: true
			},
			src: [
				path.normalize(webappRoot + '/static/dist'),
				path.normalize(webappRoot + '/WEB-INF/tmpl/dist')
			]
		})
		grunt.config.set('clean.uui', {
			options: {
				force: true
			},
			src: [path.normalize(webappRoot + '/uui2')]
		})

		grunt.registerTask('fis', require('./grunt-fis')(grunt, webappRoot, entryFiles))

		if (debug) {
			grunt.config.set('clean.debug', {
	            src: ['design_map.json', 'design_fis.log']
			})
			grunt.task.run([
				'clean:debug',
				'clean',
				'copy:uui',
				'fis:debug',
				'clean:uui'
			])
		} else {
			grunt.task.run([
				'clean',
				'copy:uui',
				'fis',
				'clean:uui'
			])
		}
	}
}
