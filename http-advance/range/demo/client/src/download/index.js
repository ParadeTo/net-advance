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
            const handledData = Downloader.fillFilesWithLoadedField(body)
            resolve(handledData)
          })
          res.on('error', reject)
        }
      )
      req.end()
    })
  }

  static fillFilesWithLoadedField(data) {
    try {
      const json = JSON.parse(data)
      return json.map(file => {
        const fullFilename = path.resolve(downloadPath, file.filename)
        let loaded = 0
        if (fs.existsSync(fullFilename)) {
          const {size} = fs.statSync(fullFilename)
          loaded = size
        }
        return {
          ...file,
          loaded
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  stop() {
    this.off('data')
  }

  onReceiveData({payload: {fd, data, loaded, total}}) {
    fs.write(fd, data, () => {
      this.emit({
        type: 'progress',
        payload: {
          data,
          loaded,
          total
        }
      })
    })
  }

  download() {
    this.on('data', this.onReceiveData)

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
            downloadedSize += data.length
            me.emit({
              type: 'data',
              payload: {
                fd,
                data,
                loaded: downloadedSize,
                total: +res.headers['content-range'].split('/')[1]
              }
            })
          })
          res.on('end', function(err) {
            if (err) {
              console.error(err)
            }
            console.log(`Download ${me.filename} end.`)
            resolve()
          })
          res.on('error', console.error)
        }
      )
      req.end()
    })
  }
}
