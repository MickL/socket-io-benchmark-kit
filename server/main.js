const cluster = require('cluster'),
      net = require('net'),
      farmhash = require('farmhash')
;

const port = 3000,
    num_processes = require('os').cpus().length;

cluster.setupMaster({
  exec: './worker.js'
});

// This stores our workers. We need to keep them to be able to reference
// them based on source IP address. It's also useful for auto-restart, for example
let workers = [];

// Helper function for spawning worker at index 'i'
let spawn = i => {
  console.log(`Spawning worker ${i}`);
  workers[i] = cluster.fork();

  // Restart worker on exit
  workers[i].on('exit', (code, signal) => {
    if (signal) {
      console.log(`Worker was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(`Worker exited with error code: ${code}`);
    }
    spawn(i);
  });
};

// Spawn workers.
for (let i = 0; i < num_processes; i++) {
  spawn(i);
}

// Helper function for getting a worker index based on IP address.
// This is a hot path so it should be really fast. The way it works
// is by converting the IP address to a number by removing non numeric
// characters, then compressing it to the number of slots we have.
//
// Compared against "real" hashing (from the sticky-session code) an  d
// "real" IP number conversion, this function is on par in terms of
// worker index distribution only much faster.
let worker_index = (ip, len) => {
 return farmhash.fingerprint32(ip) % len;
};

// Create the outside facing server listening on our port.
let server = net.createServer({ pauseOnConnect: true }, connection => {
  // We received a connection and need to pass it to the appropriate
  // worker. Get the worker for this connection's source IP and pass
  // it the connection.
  const worker = workers[worker_index(connection.remoteAddress, num_processes)];
  worker.send('sticky-session:connection', connection);
}).listen(port);

// Clear GC every 30 seconds
if (global.gc) {
  setInterval(() => {
      console.log('Clearing GC...');
      global.gc();
  }, 30 * 1000);
}

// Show how many users are connected per process
setInterval(() => {
  console.log('Connected users:');

  workers.forEach(worker => {
    worker.send('log-count');
  })
}, 3000);