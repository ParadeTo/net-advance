const http = require('http')
const fs = require('fs')

const dir = process.env.dir || '/data'
const filename = `${dir}/movie.mkv`

http
  .createServer(async function(req, res) {
    // 1
    try {
      const data = fs.readFileSync(filename)
      console.log('length', data.length)
      res.end(data)
    } catch (error) {
      console.error('error', error)
    }
  })
  .listen(3001)

