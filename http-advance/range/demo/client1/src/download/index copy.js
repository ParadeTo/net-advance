const http = require('http')
const path = require('path')
const fs = require('fs')

const downloadPath = path.resolve(__dirname, '../../downloads')
const processNum = 4

exports.getFiles = () => {
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
          console.log(body)
          resolve(body)
        })
        res.on('error', reject)
      }
    )
    req.end()
  })
}

const downloadPart = (filename, output, rangeStart, rangeEnd) => {
  console.log(`Start download ${filename}`)
  const fullOutput = path.resolve(downloadPath, output)
  if (fs.existsSync(fullOutput)) {
    const {size} = fs.statSync(fullOutput)
    rangeStart += size
  }

  const fd = fs.openSync(fullOutput, 'a')
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: 'localhost',
        port: '3001',
        method: 'GET',
        path: `/${filename}`,
        headers: {
          Range: `bytes=${rangeStart}-${rangeEnd}`
        }
      },
      res => {
        res.on('data', function(data) {
          // console.log('data', data.length)
          fs.write(fd, data, () => {})
        })
        res.on('end', function() {
          console.log(`Download ${filename} end.`)
          resolve()
        })
        res.on('error', console.error)
      }
    )
    req.end()
  })
}

const divide = (size, processNum) => {
  const parts = []
  const n = Math.floor(size / processNum)
  let remainder = size - processNum * n

  let lastEnd = 0
  for (let i = 0; i < processNum; i++) {
    let start = lastEnd
    if (start > size - 1) break
    let offset = n
    if (remainder-- > 0) {
      offset += 1
    }
    const end = start + offset - 1
    parts.push({
      start,
      end
    })
    lastEnd = end + 1
  }
  return parts
}

const writeToResult = (partStream, resultStream) => {
  return new Promise((resolve, reject) => {
    partStream.pipe(resultStream)
    partStream.on('end', resolve)
    partStream.on('error', reject)
  })
}

exports.download = async ({filename, size}) => {
  const parts = divide(size, processNum)
  const tasks = []
  console.log(parts)
  parts.forEach(({start, end}, index) =>
    tasks.push(downloadPart(filename, filename + `.part${index}`, start, end))
  )
  await Promise.all(tasks)
  for (let index = 0; index < parts.length; index++) {
    const resultStream = fs.createWriteStream(path.resolve(downloadPath, filename), { flags: 'a' })
    const partStream = fs.createReadStream(path.resolve(downloadPath, filename + `.part${index}`))
    await writeToResult(partStream, resultStream)
  }
}
