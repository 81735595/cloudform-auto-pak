module.exports = function(grunt) {
    grunt.file.defaultEncoding = 'utf8';
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
}
