const http = require('http')
const path = require('path')
const fs = require('fs')
const express = require('express')

const app = express()

const dist = './files'

const resolveFilename = filename => path.resolve(__dirname, dist, filename)

const filename = path.resolve(__dirname, './files/file1.dmg')
const fd = fs.openSync(filename, 'r')

app.get('/files', (req, res) => {
  const filenames = fs.readdirSync(dist)
  const data = []
  const stats = filenames
    .map(filename => ({filename, stat: fs.statSync(resolveFilename(filename))}))
    .filter(({stat}) => stat.isFile())
    .map(({filename, stat: {size}}) => ({filename, size}))
  res.json(stats)
})

app.head('/:filename', (req, res) => {
  const filename = req.params.filename
  const {size} = fs.statSync(path.resolve(__dirname, `./files/${filename}`))
  res.setHeader('Content-Range', `bytes */${size}`)
  res.end()
})

app.get('/:filename', (req, res) => {
  const fullFilename = resolveFilename(req.params.filename)
  const range = req.headers['range']
  const {size} = fs.statSync(fullFilename)
  let [start, end] = range.split('=')[1].split('-')
  start = +start
  end = +end
  if (end === 0 || end > size) end = size
  const len = end - start

  console.log(range)
  console.log(start)
  console.log(end)
  console.log(len)

  // const maxBuffer = 1 << 16
  // const buffer = new Buffer(len > maxBuffer ? maxBuffer : len)
  // let bytesRead = 0
  // while (bytesRead < len) {
  //   const read = fs.readSync(fd, buffer, 0, buffer.length, bytesRead)
  //   console.log('read: ' + read)
  //   bytesRead += read
  //   res.write(buffer)
  // }
  // console.log(buffer.length)
  // res.end()

  const readStream = fs.createReadStream(fullFilename, {start, end})
  readStream.pipe(res)
})

app.listen(3001)

// http
//   .createServer(async function(req, res) {
//     const {method, headers} = req
//     if (method === 'HEAD') {
//       const {size} = fs.statSync('bigFile.iso')
//     } else if (method === 'GET') {
//       const range = headers['range']
//       const {size} = fs.statSync(filename)
//       let [start, end] = range.split('=')[1].split('-')
//       start = +start
//       end = +end
//       if (end === 0 || end > size) end = size
//       const len = end - start

//       console.log(range)
//       console.log(start)
//       console.log(end)
//       console.log(len)

//       // const maxBuffer = 1 << 16
//       // const buffer = new Buffer(len > maxBuffer ? maxBuffer : len)
//       // let bytesRead = 0
//       // while (bytesRead < len) {
//       //   const read = fs.readSync(fd, buffer, 0, buffer.length, bytesRead)
//       //   console.log('read: ' + read)
//       //   bytesRead += read
//       //   res.write(buffer)
//       // }
//       // console.log(buffer.length)
//       // res.end()

//       const readStream = fs.createReadStream(filename, {start, end})
//       readStream.pipe(res)
//     }
//   })
//   .listen(3001)
