module.exports.initWebSokcet = function(){
    
    var wrappingSocket ={};

    var ws = new WebSocketServer({port: 9090}); 

    wrappingSocket.ws = ws

    function findwsConn(conn){

    }

    wrappingSocket.sendMsg = function(toConn,msg){
        try{

            toConn.send(JSON.stringify(message));

        }catch(err){

        }
        
    }
    wrappingSocket.sendErrMsg = function(err,msg){
        
    }

    return wrappingSocket
}


