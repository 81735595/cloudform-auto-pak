module.exports = function(debug) {
	var grunt = require('grunt')
	var path = require('path')
	var conf = require('../../conf').module['design']
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
	grunt.config.set('clean.uui', {
		options: {
			force: true
		},
		src: [path.normalize(webappRoot + '/uui2')]
	})
	grunt.config.set('clean.design_dist', {
		options: {
			force: true
		},
		src: [
			path.normalize(webappRoot + '/static/dist'),
			path.normalize(webappRoot + '/WEB-INF/tmpl/dist')
		]
	})

	grunt.registerTask('fis_design', require('./grunt-fis')(grunt, webappRoot, entryFiles))

	if (debug) {
		grunt.config.set('clean.debug', {
            src: ['design_map.json', 'design_fis.log']
		})
		grunt.task.run([
			'clean:debug',
			'clean:design_dist',
			'copy:uui',
			'fis_design:debug',
			'clean:uui'
		])
	} else {
		grunt.task.run([
			'clean:design_dist',
			'copy:uui',
			'fis_design',
			'clean:uui'
		])
	}
}
