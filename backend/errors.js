var util = require('util')
var wss = require('./server/wsserver/wsserver.js')

function WebSoketError(username,message){
    Error.call()

}
util.inherits(HttpError, WebSocketError);

function RoomError(roomname,message){
    Error.call()
    
}
util.inherits(HttpError,WebSoketError)


function BadRequest()