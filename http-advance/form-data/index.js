var http = require('http')
var formidable = require('formidable')
http
  .createServer(function(req, res) {
    var form = new formidable.IncomingForm()
    form.uploadDir = './'
    form.parse(req, function(err, fields, files) {
      console.log(fields, files)
      req.body = fields
      req.files = files
      res.writeHead(200, 'ok')
      res.end('success')
    })
  })
  .listen(1337, '127.0.0.1')
