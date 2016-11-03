module.exports = function() {
    var grunt = require('grunt')
	var config = require('../conf')
	var nodegit = require("nodegit")
    var webappRoot = config.root
	var gitConfig = config.git
	var done = this.async()
	if (!gitConfig) {
		grunt.log.subhead('未设置git参数，无法自动进行commit如果需要使用这个功能，请参考README.md进行设置')
		done()
	}
	var paths = gitConfig.paths
	paths = paths && paths.length ? (typeof paths == "string" ? path : paths.map(function(v){
		return v + '/**'
	})) : '*'
	var message = gitConfig.message
	var repo;
	var index;
	var oid;
	nodegit.Repository.discover(webappRoot, 0, "").then(function(foundPath){
		return nodegit.Repository.open(foundPath)
	}).then(function(repoResult){
		repo = repoResult
		return repo.refreshIndex()
	}).then(function(indexResult) {
		index = indexResult;
		return index.addAll(
			paths,
			nodegit.Index.ADD_OPTION.ADD_CHECK_PATHSPEC
		)
	}).then(function(){
		return index.write();
	}).then(function() {
		return index.writeTree();
	}).then(function(oidResult) {
		oid = oidResult;
 		return nodegit.Reference.nameToId(repo, "HEAD");
	}).then(function(head) {
		return repo.getCommit(head);
	}).then(function(parent) {
		var author = repo.defaultSignature();
		var committer = repo.defaultSignature();
		return repo.createCommit("HEAD", author, committer, message, oid, [parent]);
	}).catch(function(err){
		grunt.log.error().error('自动进行git提交时出错，请尝试手动提交').error(err)
	}).done(done);
}
