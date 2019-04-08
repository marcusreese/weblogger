const express = require('express');
const http = require('http');
const WebSocket = require('ws');


const app = express();
const server = http.createServer(app);
app.use(express.static('public'));
app.use(require('body-parser').json());

let interval = 1000;
let intervToClear;
let activeWs;
app.post('/interval', (req, res) => {
    interval = req.body.interval;
    clearInterval(intervToClear);
    startLooping(interval, activeWs);
});
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws) => {
    activeWs = ws
    ws.on('message', (message) => {
        console.log('message from client:', message);
    });

    startLooping(interval, ws);

    ws.on('close', function() {
        closeShop();
    });
    ws.on('error', function(e) {
        console.log('ERROR', e);
        closeShop();
    });
});

server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});

function startLooping(interval, ws) {
    if (!ws) return;
    intervToClear = setInterval(() => {
        ws.send('Hi there, I am a WebSocket server');
        ws.send('Hi there, it is ' + Date.now());
    }, interval);
}

function closeShop() {
    clearInterval(intervToClear);
    activeWs = null;
}