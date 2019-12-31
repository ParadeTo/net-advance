var net = require('net')

const chunks = ['a', 'bc', 'def', 'ghijklmnopqrstuvwxyz']

var server = net.createServer(function(socket) {
  socket.on('data', async function(data) {
    socket.write('HTTP/1.1 200 OK\r\n' + 'transfer-encoding: chunked\r\n\r\n')
    for (let index = 0; index < chunks.length; index++) {
      socket.write(
        `${chunks[index].length.toString(16)}\r\n${chunks[index]}\r\n`
      )
    }
    socket.write('0\r\n\r\n')
    socket.end()
  })

  socket.on('close', function() {
    console.log(socket.remoteAddress, socket.remotePort, 'disconnected')
  })
})

server.listen(3000, '127.0.0.1')

