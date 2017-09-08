const express = require('express');

const app = new express();
const server = app.listen(3000);
const io = require('socket.io')(server);

let total = 0;

io.on('connection', socket => {
  total ++;
  // console.log(`Client connected on worker with pid '${process.pid}' - Total for worker: ${total}`);

  socket.on('disconnect', () => {
    total --;
    // console.log(`Client disconnected on worker with pid '${process.pid}' - Total for worker: ${total}`);
  });

  socket.on('message', msg => {
    console.log(`Received message: '${msg}'. Emitting to everyone...`);
    io.emit('message', msg);
  })
});

// Clear GC every 30 seconds
if (global.gc) {
    setInterval(() => {
        console.log('Clearing GC...');
        global.gc();
    }, 30 * 1000);
}

// Show how many users are connected per process
setInterval(() => {
    console.log(`Connected users: ${total}`);
}, 3000);