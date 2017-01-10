module.exports = function(grunt, config) {
	var gitConfig = config.git;
	var webappRoot = gitConfig.root;
	if (!gitConfig) {
		grunt.log.subhead('未设置git参数，无法自动进行commit如果需要使用这个功能，请参考README.md进行设置');
		return false;
	}
	var paths = gitConfig.paths;
	paths = paths || './';
	var message = gitConfig.message;
	grunt.config.set('gitadd', {
		files: {
			src: paths,
			cwd: webappRoot
		},
		options: {
			cwd: webappRoot
		}
	});

	grunt.config.set('gitcommit', {
		files: {
			src: paths,
			cwd: webappRoot
		},
		options: {
			message: message,
			cwd: webappRoot
		}
	});

	grunt.registerTask('addAndCommitFile', function(){
		grunt.task.run(['gitadd', 'gitcommit']);
	});
}
