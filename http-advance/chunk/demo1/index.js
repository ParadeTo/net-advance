var http = require('http')

const chunks = ['a', 'bc', 'def', 'ghijklmnopqrstuvwxyz']

http
  .createServer(async function(req, res) {
    res.writeHead(200, {
      'transfer-encoding': 'chunked'
    })
    for (let index = 0; index < chunks.length; index++) {
      res.write(`${chunks[index].length.toString(16)}\r\n${chunks[index]}\r\n`)
    }
    res.write('0\r\n\r\n')
    res.end()
  })
  .listen(3000)

