module.exports = function(grunt, webappRoot, entryFiles) {
	var makePackConf = require('../../fis/make-pack-conf')
	return function(debug){
	    // init fis
	    require('./fis-conf')(
	        webappRoot,
	        entryFiles
	    )

	    var done = this.async()
	    var total = {}
	    var modified = {}
	    var lastModified = {}
	    var options = {}
	    var duration = function (ms) {
	        return ms > 999 ? ((ms / 1000).toFixed(2) + 's') : (ms + 'ms');
	    }

	    // 调试信息设置，从fis3-command-release里抄出来的
	    var stream = process.stdout;
	    var alertDurtion = 1000; // 1s
	    var alertCacheDurtion = 200; // 200ms

	    if (debug) {
	        // log级别为打印所有log，如果只打印debug信息，warning就丢了
	        fis.log.level = fis.log.L_ALL
	        // 输出log信息到当前文件夹下的fis.log文件
	        var logpath = process.cwd() + '/design_fis.log'
	        fis.log.on.any = function(type, msg){
	            fis.util.write(logpath, ('\n ' + '[' + type+ ']' + ' ' + msg + '\n'), null, true)
	        }
	    } else {
			fis.log.level = fis.log.L_NORMAL
			fis.log.on.any = function(type, msg) {}
		}
	    // 清除所有缓存，不清除不走complie流程，没法生成pack配置
	    stream.write('\n 清理缓存 '.bold.yellow);
	    var now = Date.now();
		fis.cache.clean();
		fis.cache.clean('../plugin');
	    stream.write((Date.now() - now + 'ms').green.bold);
	    stream.write('\n');

	    stream.write('\n 构建开始 '.green.bold)
	    options.beforeEach = function(file) {
	        if (file.isPartial)return;
	        file._start = Date.now(); // 记录起点
	        file.release !== false && (total[file.subpath] = file);
	        file._fromCache = true;
	    };

	    options.beforeCompile = function(file) {
	        if (file.isPartial)return;
	        file._fromCache = false;
	        file.release !== false && (modified[file.subpath] = file);
	    };

	    options.afterEach = function(file) {
	        if (file.isPartial)return;
	        var mtime = file.getMtime().getTime();
	        var fromCache = file._fromCache;

	        if (file.release && (!fromCache || lastModified[file.subpath] !== mtime)) {
	            var cost = Date.now() - file._start;
	            var flag = fromCache ? (cost > alertCacheDurtion ? '.'.bold.yellow : '.'.grey) : (cost > alertDurtion ? '.'.bold.yellow : '.');
	            lastModified[file.subpath] = mtime;
	            modified[file.subpath] = file;
	            debug ? fis.log.debug(file.realpath) : stream.write(flag);
	        }
	    };

	    // 正式的release开始，fis3的release入口是fis3-command-release，除了正式的release流程，
	    // 还有deploy和live的过程，这里使用了fis3-command-release的deploy过程，自定义了deploy之后的操作
	    var start = Date.now();
	    fis.release(options, function(ret){
	        stream.write(fis.log.format('%s%s'.bold.green, debug ? '' : ' ', duration(Date.now() - start)));

	        fis.util.map(ret.pkg, function(subpath, file) {
	            modified[subpath] = file;
	            total[subpath] = file;
	        });

	        var deploy = require('../../fis/deploy')

	        deploy({
	            options: options,
	            modified: modified,
	            total: total,
	            map: ret.map,
	            pkg: ret.pkg
	        }, function () {
	            if (debug) {
	                var temp = {}
	                fis.util.each(ret.src, function(v, i) {
	                    delete v._content
	                    temp[i] = v
	                })
	                ret.src = temp
	                temp = {}
	                fis.util.each(ret.pkg, function(v, i) {
	                    delete v._content
	                    temp[i] = v
	                })
	                ret.pkg = temp
	                grunt.file.write('design_map.json', JSON.stringify(ret, null, "\t"))
	            }
	            done();
	        }, [{
                pattern: '/WEB-INF/tmpl/**.html',
                replaces: [
                    {
                        regexp: makePackConf.regPackInfo,
                        replacement: function (all, type, pack){
                            var m = ''
                            var file = total[pack]
                            if (file) {
                                m = total[pack].getUrl()
                            } else {
                                type = ''
                                fis.log.warn('未找到pack文件:' + pack)
                            }
                            switch (type.toLowerCase()) {
                                case 'js':
                                    all = '<script type="text/javascript" src="' + m + '"></script>'
                                    break
                                case 'css':
                                    all = '<link type="text/css" rel="stylesheet" href="' + m + '"/>'
                                    break
                                default:
                                    break
                            }
                            return all
                        }
                    },
                    {
                        regexp: /\$_\{([^\}\r\n]*)\}/g,
                        replacement: function (all, key) {
                            return "${"+key+"}"
                        }
                    }
                ]
            }])
	    })
	}
}
