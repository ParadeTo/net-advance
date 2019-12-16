const http = require('http')
const path = require('path')
const fs = require('fs')
const express = require('express')

const app = express()

app.head('/:filename', (req, res) => {
   const { size } = fs.statSync(req.params.filename)
   res.setHeader("Content-Range", `bytes */${size}`)
   res.end()
})

app.listen(1337)