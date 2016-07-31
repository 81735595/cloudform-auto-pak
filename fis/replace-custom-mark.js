var chain = []
var args
function next() {
    chain.length && chain.shift().apply(null, arguments)
}

function link(fn) {
    if (typeof fn == 'function') {
        chain.push(fn)
        return link
    } else (
        next.apply(null, args)
    )
}

function replaceCustomMark (total/*, args...*/) {
    var matchs = Array.prototype.slice.call(arguments, 1)
    fis.util.map(total, function(subpath, file) {
        fis.util.map(matchs, function(index, match) {
            if (typeof match.pattern == 'string') {
                match.pattern = fis.util.glob(match.pattern)
            }
            var pattern = match.pattern
            var regexp = match.regexp
            var replacement = match.replacement
            var replaces = match.replaces
            if (pattern.test(subpath)) {
                if (regexp) {
                    file.setContent(file.getContent().replace(regexp, replacement))
                } else if (replaces && Array.isArray(replaces)) {
                    fis.util.map(replaces, function(i, v) {
                        var regexp = v.regexp
                        var replacement = v.replacement
                        if (regexp) {
                            file.setContent(file.getContent().replace(regexp, replacement))
                        }
                    })
                } else {
                    fis.log.error(subpath + ' run replace-custom-mark args error.')
                }
            }
        })
        fis.util.write(fis.util(fis.project.getProjectPath() + file.getHashRelease()), file.getContent())
    })
    next(next)
}

module.exports = function() {
    args = Array.prototype.slice.call(arguments)
    return link(replaceCustomMark)
}
