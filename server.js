const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

require('./sockets/xo')(io);

server.listen(process.env.PORT || 2000, () => {
    console.log(`server listening on port ${2000}`);
})