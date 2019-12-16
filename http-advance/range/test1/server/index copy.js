const http = require('http')
const path = require('path')
const fs = require('fs')
const express = require('express')

const app = express()

// http.createServer(async function(req, res){
//     res.writeHead(200);
//     var fileName = 'bigFile.iso';
//     var filePath = path.join(__dirname, fileName);
//     var stats = fs.statSync(filePath);
//     if(stats.isFile()){
//       fs.createReadStream(filePath).pipe(res);
//     }
// }).listen(3000);