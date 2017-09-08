# About
- This is a simple server that creates a Socket.io-Server for each cpu-core
- The master process create a child process for each cpu-core
- The master process maps an ip-address to a core, using a hash function
- The cpu-cores can communicate by use of a MongoDB-Adapter

# Prerequisite
- Node.js
- MongoDB or Redis
- Run: `npm install`

# Run
- Run MongoDB with `sudo mongod` or run Redis with `sudo redis-server`
- Run the Server with `npm run start`