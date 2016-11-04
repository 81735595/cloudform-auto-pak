module.exports = function(grunt) {
    // 默认就是utf8这里就不用了
    // grunt.file.defaultEncoding = 'utf8';

    // 加载node_modules里面的grunt插件，跟react学的
    Object.keys(grunt.config.get('pkg').dependencies)
    .filter(function(npmTaskName) {
        return npmTaskName.indexOf('grunt-') === 0;
    })
    .filter(function(npmTaskName) {
        return npmTaskName !== 'grunt-cli';
    })
    .forEach(function(npmTaskName) {
        grunt.loadNpmTasks(npmTaskName);
    });

	require('./module')(grunt);

	grunt.registerTask('git', require('./git'));

    // 注册命令
    // build命令用来生成资源文件
    // build-debug会在生成资源文件的同事在当前文件夹生成一个map文件，通过map文件可以查看
    // pack文件包含的内容等配置信息，同时在编译过程中也会打印所有的log
    grunt.registerTask('build', function(debug) {
		if (debug) {
			grunt.task.run(['module:debug'])
		} else {
			grunt.task.run(['module'/*, 'git'*/])
		}
	});
}
