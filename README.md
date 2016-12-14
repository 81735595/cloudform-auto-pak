# cloudform-auto-pak
给云表单用的工作流脚本，现在主要针对design模块进行打包压缩，目前的策略是以页面为单位进行整体打包，后续准备引入自动提取公共依赖的功能

# 使用方法
脚本基于nodejs，首先需要安装依赖组件
````bash
$ npm install
````
如果安装失败，检查下是否有管理员权限，或者升级node和npm，根据我之前的经验，node和npm升级到最新版本不需要管理权限也能安装成功。

安装成功后需要配置conf.js中的root属性，配置为本地要编译的模块下的webapp文件夹的绝对路径

配置好后执行脚本
````bash
$ npm start
````

首次编译构成会比较慢，因为要压缩一些比较大的公共库，之后的编译过程会加快，没有修改的文件会走本地缓存

还可以使用下面的命令进入debug模式，查看各个文件的编译过程
````bash
$ npm run debug
````

debug模式下所有文件都不走缓存，所以比较慢，编译过程中会在命令行输出各个文件的编译流程信息，后续准备加入输出log文件的功能，因为命令行下的调试信息不好看嘛

另外，在debug模式下还会在当前文件夹下生成map.json文件，根据这个文件可以查看各个文件最终的编译状态和编译属性，以及打包信息，可以作为调试的依据，也可以给后端使用，做动态打包什么的

------

## 2016.11.03 更新

加入了git自动commit的功能，本来打算用shell来实现的，但是考虑到shell没法在windows上用，所以用nodegit来做了……啊，说起来nodegit真是各种拧巴啊，文档里有哪些接口到是有写，但是很多接口只写了参数类型，没写到底干啥用的……而底层的操作又都是调用C语言写的模块，搞的我根本不知道怎么使……按照他提供的例子，试了半天才试出来，希望在windows上也能正常跑吧……不然还不如用shell写呢……

另外，在安装nodegit的过程中遇到了个问题，首先安装这个模块需要管理员权限，然后在preinstall时报了：…… libssh2/missing: Unknown `--is-lightweight' …… 的错误，我的环境是osx 10.11.6，nodejs v0.12.7，最后升级了xcode CLT搞好了（如何升级xcode CLT，可以查看这篇文章[Xcode Command Line Tools](http://railsapps.github.io/xcode-command-line-tools.html)），之前查了各种资料也没找到原因，后来在github上的issues上看到了答案 [Can't install via NPM](https://github.com/nodegit/nodegit/issues/1134)

具体的配置方法是，在conf.js中添加git属性，例子如下：
````javascript
module.exports = {
    // ...
	git: {
		// path属性是用来匹配要提交哪些文件到缓冲区的，类似git add 后面的参数，类型可以是数组，也可以是字符串，为空的时候会add所有可提交的文件
		paths: [
			'xxx/dist1',
			'xxx/dist2'
		],
		// commit message，不能不填
		message: 'XXXXXX'
	}
	// ...
}
````
------

## 2016.12.14 更新

加入了多模块支持的功能，现在可以设置多个模块在conf.js中设置多个模块，然后串行执行了。原来的脚本也都拆分到模块了里。

具体配置方法是，首先，在conf.js中添加module属性，例子如下：

````javascript
module.exports = {
    // ...
	module: {
		// module对象下的每个属性的属性值代表模块在module文件夹下的文件夹名，属性的值是一个对象，用来写模块的基本信息，现在只需要root和entry_files两个属性
		'design': {
            // 要编译的模块下的webapp文件夹的绝对路径，在编译前需要修改成本地的路径
            root: '/Users/zhengxingcheng/work/yonyou/iweb_cloudform/iform_parent/iform_parent/design/src/main/webapp',
            // 依赖扫描的入口文件,可以用glob语法，可以是多条
            entry_files: [
                'WEB-INF/tmpl/**/*.html'
            ]
        }
        // ...
	}
	// ...
}
````

设置好的同conf.js文件的同事，需要在module下建立跟module属性名同名的文件夹，文件夹下的index.js文件会被串行执行，所以当前模块的编译流程都在这个文件夹下面。

现阶段每个模块的编译脚本相似度很高，后续会再做优化把相似的代码抽象抽出来。
