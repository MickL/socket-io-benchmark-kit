const express = require('express'),
  mongoAdapter = require('socket.io-adapter-mongo')
;
// require('log-buffer');

// Note we don't use a port here because the master listens on it for us.
const app = new express();

// Here you might use middleware, attach routes, etc.

// Don't expose our internal server to the outside.
let server = app.listen(0, 'localhost'),
  io = require('socket.io')(server);

let total = 0;

// Tell Socket.IO to use the redis adapter. By default, the redis
// server is assumed to be on localhost:6379. You don't have to
// specify them explicitly unless you want to change them.
// io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
io.adapter(mongoAdapter('mongodb://localhost:27017'));

// Here you might use Socket.IO middleware for authorization etc.

io.on('connection', socket => {
  total ++;
  // console.log(`Client connected on worker with pid '${process.pid}' - Total for worker: ${total}`);

  socket.on('disconnect', () => {
    total --;
    // console.log(`Client disconnected on worker with pid '${process.pid}' - Total for worker: ${total}`);
  });

  socket.on('message', msg => {
    console.log(`Worker with pid '${process.pid}' received message: '${msg}'`);

    io.emit('message', msg);
  })
});

// Here you might want to listen to server messages

// Listen to messages sent from the master. Ignore everything else.
process.on('message', function(message, connection) {
  switch(message) {
      case 'log-count':
        console.log(`pid '${process.pid}': ${total}`);
        break;
      case 'sticky-session:connection':
        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
        break;
  }
});