module.exports = function(debug) {
	var grunt = require('grunt')
	var path = require('path')
	var conf = require('../../conf').module['rt']
	var webappRoot = conf.root
	var entryFiles = conf['entry_files']
	grunt.config.set('clean.rt_dist', {
		options: {
			force: true
		},
		src: [
			path.normalize(webappRoot + '/static/dist')
		]
	})
	grunt.config.set('copy.lib_rt', {
		files: [{
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../iform_web/src/main/webapp/'),
			src: ['uui2/**/*'],
			dest: webappRoot
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../design/src/main/webapp/static/js/'),
			src: ['filesystem/**/*'],
			dest: webappRoot
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../../../uitemplate_parent/uitemplate_parent/uitemplate_ref/src/main/webapp/static/js/'),
			src: ['uiref/**/*'],
			dest: webappRoot
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../../../uitemplate_parent/uitemplate_parent/uitemplate_ref/src/main/webapp/static/'),
			src: ['css/**/*'],
			dest: path.normalize(webappRoot + '/ref')
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../../../uitemplate_parent/uitemplate_parent/uitemplate_ref/src/main/webapp/static/'),
			src: ['images/**/*'],
			dest: path.normalize(webappRoot + '/ref')
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../design/src/main/webapp/static/css/design/'),
			src: ['iconfont/**/*'],
			dest: webappRoot
		}, {
			expand: true,
			cwd: path.normalize(webappRoot + '/../../../../../../uitemplate_parent/uitemplate_parent/uitemplate_ref/src/main/webapp/static/'),
			src: ['trd/**/*'],
			dest: webappRoot
		}]
	})
	grunt.config.set('clean.lib_rt', {
		options: {
			force: true
		},
		src: [
			path.normalize(webappRoot + '/uui2'),
			path.normalize(webappRoot + '/filesystem'),
			path.normalize(webappRoot + '/uiref'),
			path.normalize(webappRoot + '/ref'),
			path.normalize(webappRoot + '/iconfont'),
			path.normalize(webappRoot + '/trd')
		]
	})

	grunt.registerTask('fis_rt', require('./grunt-fis')(grunt, webappRoot, entryFiles))

	if (debug) {
		grunt.config.set('clean.debug', {
            src: ['rt_map.json', 'rt_fis.log']
		})
		grunt.task.run([
			'clean:debug',
			'clean:rt_dist',
			'copy:lib_rt',
			'fis_rt:debug',
			'clean:lib_rt'
		])
	} else {
		grunt.task.run([
			'clean:rt_dist',
			'copy:lib_rt',
			'fis_rt',
			'clean:lib_rt'
		])
	}
}
