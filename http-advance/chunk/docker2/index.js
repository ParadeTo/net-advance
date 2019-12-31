const http = require('http')
const fs = require('fs')

const dir = process.env.dir || '/data'
const filename = `${dir}/movie.mkv`

http
  .createServer(async function(req, res) {
    // 2
    const readStream = fs.createReadStream(filename)
    readStream.pipe(res)
  })
  .listen(3001)

