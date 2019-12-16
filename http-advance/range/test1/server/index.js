const http = require('http')
const path = require('path')
const fs = require('fs')

const fd = fs.openSync('bigFile.iso', 'r')

http.createServer(async function(req, res){
  const { method, headers } = req
  if (method === 'HEAD') {
    const { size } = fs.statSync('bigFile.iso')
    res.writeHead(200, {
      'Content-Range': `bytes */${size}`
    });
    res.end()
  } else if (method === 'GET') {
    const range = headers['range']
    const { size } = fs.statSync('bigFile.iso')
    let [start, end] = range.split('=')[1].split('-')
    if (start === '') start = 0
    if (end === '') end = size
    const len = end - start
    console.log(range)
    console.log(start)
    console.log(end)
    console.log(len)
    const buffer = new Buffer(len)
    let bytesRead = 0
    while (bytesRead < len) {
      const read = fs.readSync(fd, buffer, bytesRead, len - bytesRead, bytesRead)
      console.log('read: ' + read)
      bytesRead += read
    }
    console.log(buffer.length)
    res.write(buffer)
    res.end()
  }
}).listen(3000);

