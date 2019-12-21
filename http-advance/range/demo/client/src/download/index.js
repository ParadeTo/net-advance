const http = require('http')
const path = require('path')
const fs = require('fs')
const Event = require('./event')

const downloadPath = path.resolve(__dirname, '../../downloads')

module.exports = class Downloader extends Event {
  constructor(filename) {
    super()
    this.filename = filename
    this.output = path.resolve(downloadPath, filename)
    this.req = null
  }

  static getFiles() {
    let body = ''
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: 'localhost',
          port: '3001',
          method: 'GET',
          path: `/files`
        },
        res => {
          res.on('data', function(data) {
            body += data
          })
          res.on('end', function() {
            resolve(body)
          })
          res.on('error', reject)
        }
      )
      req.end()
    })
  }

  stop() {
    this.req.close()
  }

  download() {
    const me = this
    let rangeStart = 0
    let size = 0
    if (fs.existsSync(this.output)) {
      const stat = fs.statSync(this.output)
      size = stat.size
      rangeStart += size
    }
    const fd = fs.openSync(this.output, 'a')
    let downloadedSize = size

    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: 'localhost',
          port: '3001',
          method: 'GET',
          path: `/${me.filename}`,
          headers: {
            Range: `bytes=${rangeStart}-`
          }
        },
        res => {
          res.on('data', function(data) {
            console.log('data', data.length)
            fs.write(fd, data, () => {
              downloadedSize += data.length
              me.emit({ type: 'progress', payload: { loaded: downloadedSize } })
            })
          })
          res.on('end', function() {
            console.log(`Download ${me.filename} end.`)
            resolve()
          })
          res.on('error', console.error)
        }
      )
      req.end()
      this.req = req
    })
  }
}
