// var port = 3000
// var http = require('http')
var grunt = require('grunt')
// require('./Gruntfile')(grunt)
// var server = http.createServer(function (request, response) {
    grunt.tasks([
        'clean:map',
        'clean:dist',
        'copy:uui',
        'fis',
        'clean:uui'
    ])
// });

// server.listen(port)
// console.log('server start at localhost:' + port)
