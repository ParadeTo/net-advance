const http = require('http')
const fs = require('fs')

function sendPersonInfo(res) {
  return new Promise(resolve => {
    setTimeout(() => {
      const data = {
        name: 'ayou',
        age: 18,
        gender: '男'
      }
      res.write(`<script>bigpipe.set('personInfo', ${JSON.stringify(data)})</script>`)
      resolve()
    }, 1000)
  })
}

function sendArticles(res) {
  return new Promise(resolve => {
    setTimeout(() => {
      const list = []
      for (let i = 0; i < 50; i++) {
        list.push({
          title: `网络协议进阶${i + 1}`
        })
      }
      res.write(`<script>bigpipe.set('articles', ${JSON.stringify(list)})</script>`)
      resolve()
    }, 3000)
  })
}

http
  .createServer(async function(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/html;charset=utf-8'
    })
    const html = fs.readFileSync('./index.html')
    res.write(html)
    await Promise.all([sendPersonInfo(res), sendArticles(res)])
    res.end()
  })
  .listen(3000)
