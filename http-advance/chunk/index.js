var http = require('http')
var net = require('net')

function send(res) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      res.write('1\r\na\r\n')
      resolve()
    }, 10)
  })
}

// http.createServer(async function(req,res){
//     res.writeHead(200,{
//         "transfer-encoding":"chunked"
//     });
//     for (let index = 0; index < 3; index++) {
//       await send(res)
//       res.end();
//     }
//     res.write("0\r\n\r\n");
//     res.end()
// }).listen(3000);

/**
chrome（62 stable）
必须传输超过 1024 个字节 才会开始渲染

IE （11）
必须传输超过 4096 个字节 才会开始渲染
**/

var server = net.createServer(function(socket) {
  // socket.setNoDelay(true)
  socket.on('data', async function dataHandler(data) {//data是客户端发送给服务器的数据
    socket.write('HTTP/1.1 200 OK\r\n' + 'transfer-encoding: chunked\r\n\r\n')
    for (let index = 0; index < 2048; index++) {
      await send(socket)
    }
    socket.write('0\r\n\r\n')
    socket.end()
  });

  socket.on('close', function(){
    console.log(socket.remoteAddress, socket.remotePort, 'disconnected');
  })
})

server.listen(1337, '127.0.0.1')

