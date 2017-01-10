// 是否开启debug模式
var debug = !!~process.argv.indexOf('--debug');

var build = !!~process.argv.indexOf('--build');

var git = !!~process.argv.indexOf('--git');

var config = require('./conf');

var gruntInit = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});
};

if (build) {
	var grunt = require('grunt');
	var fis = require('fis3');
	var key = process.argv.pop();
	gruntInit(grunt);
	require('./module')(grunt, config, key);
	grunt.tasks(['module_' + key + (debug ? ':debug' : '')])
} else if (git) {
	var grunt = require('grunt');
	gruntInit(grunt);
	require('./git')(grunt, config);
	grunt.tasks(['addAndCommitFile']);
}else {
	var createWriteStream = require('fs').createWriteStream;
	var spawn = require('child_process').spawn;
	var Gauge = require('gauge')
	var gt = new Gauge(process.stderr, {
		updateInterval: 50,
		theme: 'brailleSpinner',
		cleanupOnExit: false
	});
	var confModules = config.module;
	var taskList = Object.keys(confModules)
	var progress = taskList.length;
	var curProgress = 0;

	gt.show('Current progress (' + curProgress + '/' + progress + ')', 0);
	var pulse = setInterval(function () {
		gt.pulse()
	}, 100);

	Promise.all(taskList.map(function(key){
		return new Promise(function(resolve, reject){
			var cp = spawn('npm', ['run', 'build', key]);
			cp.stdout.pipe(createWriteStream('./'+key+'.log'));
			cp.on('close', function (code) {
				curProgress += 1;
				gt.show('Current progress (' + curProgress + '/' + progress + ')', curProgress/progress);
				resolve({
					name: key,
					code: code
				});
			});
		});
	})).then(function(results){
		clearInterval(pulse);
		gt.disable();
		results.forEach(function(result){
			var key = result.name;
			var code = result.code;
			console.log('build ' + key + (code ? ' has error' : ' done') + ', close code: ' + code);
		});
		var cp = spawn('npm', ['run', 'git']);
		cp.stdout.pipe(process.stdout);
	});
}
