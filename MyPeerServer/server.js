var http      = require('http')
var express   = require('express');
var app       = module.exports.app = express();
var server    = http.createServer(app);
var io        = require('socket.io').listen(server);
var port      = process.env.port || 1337;
var clientIDs = []

function log(logMessage){
    console.log(new Date().toLocaleTimeString() + ': ' + logMessage)
}

io.sockets.on('connection', function (client){
 
    log('Socket connection. Client id assigned : ' + client.id);
        
    client.emit('connected', { clientID : client.id });
    
    client.on('iAmHere', function (message) {
        log('ClientID : ' + message.clientID);
        log('I am here request');
        
        client.broadcast.emit(message.type, message);
    });

    client.on('offer', function (message) {
        log('ClientID : ' + message.clientID);
        log('Offer SDP data : ' + message.sdp);

        client.to(message.destinationID).emit(message.type, message);
    });

    client.on('answer', function (message) {
        log('ClientID : ' + message.clientID);
        log('Answer SDP data : ' + message.sdp);

        client.to(message.destinationID).emit(message.type, message);
    })

    client.on('candidate', function (message) {
        log('ClientID : ' + message.clientID);
        log('ICE candidate : ' + message.data.candidate);
        
        client.to(message.destinationID).emit('candidate', message);
    });
})

app.use(express.static(__dirname + '/Public'))
app.use(express.static(__dirname + '/Js'))
app.get('/', function (req, res){
    res.sendFile(__dirname + '/Html/Default.html')
})

console.log('listening on *:' + port);
server.listen(port);