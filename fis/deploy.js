var deploy = require('fis3-command-release/lib/deploy')
module.exports = function (settings, cb, matchs) {
    var replaceCustomMark = require('./replace-custom-mark')
    var total = settings.total
    deploy(settings,
        replaceCustomMark.apply(null, [total].concat(matchs))(cb)
    )
}
