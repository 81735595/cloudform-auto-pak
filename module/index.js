module.exports = function(grunt, config, key) {
	try {
		grunt.registerTask('module_'+key, require('./'+key)(config.module[key]))
	} catch (err) {
		console.log(err)
	}
}
