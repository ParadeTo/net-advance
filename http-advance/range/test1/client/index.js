const http = require('http')
const fs = require('fs')

const fileName= 'bigFile'
const fd = fs.openSync(fileName, 'a')

const req = http.request(
  {
    host: 'localhost',
    port: '3000',
    method: 'GET',
    headers: {
      'Range': 'bytes=0-102400000'
    }
  },
  res => {
    res.on('data', function(data) {
      console.log(data.length)
      fs.writeSync(fd, data)
    })
    res.on('end', function() {
      console.log('end')
    })
  }
)

req.end()