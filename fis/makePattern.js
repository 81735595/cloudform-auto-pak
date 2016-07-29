module.exports = function (/*args...*/) {
    return '{' + Array.prototype.slice.call(arguments).join(',') + '}'
};
