
var async = require('async');
var room = require('./room.js');
var user = require('./user.js');

const BROADCASTMESSAGE ={
    ENTER_ROOM:"broadcast:enterRoom",
    LEAVE_ROOM:"broadcast:leaveRoom"
  }
  
  const NEGOTIATION_MESSAGE ={
    OFFER:"negotiation:offer",
    ANSWER:"negotiation:answer",
    CANDIDATE:"negotiation:candidate",
    SUCESS_NEGOTIATION:"negotiation:sucess",
    FAILED_NEGOTIATION:"negotiation:failed"
  }
  
  const ROOM_MESSANGE ={
    ENTER_ROOM:"room:enterRoom",
    FAILED_ENTER_ROOM:"room:failedEnterRoom",
    LEAVE_ROOM:"room:leaveRoom",
  }
  
  const SESSION_MESSAGE ={
    LOGIN: "session:login",
    LOGOUT: "session:logout"
  }
  
  const ERR_MESSAGE ={
    INVALIDMESSAGE: "err:invalidMessage"
  }

module.exports.isInvalidMessage =function(message,callback){
    
    //todo: check validMessage

    callback(null,true)
}

module.exports.handleMessage = function(message,connection,callback){

    var data; 
		
      try { 
         data = JSON.parse(message); 
        
      } catch (e) { 
         console.log("Invalid JSON"); 
         data = {}; 
      }

      if(data.type != SESSION_MESSAGE.LOGIN){
        if(!user.authenticate(data.fromUserID)){

          var message ={
            type: "authenticate",
            success:false
          }
        }
      }
      
      switch (data.type) {
        
        case SESSION_MESSAGE.LOGIN:

          console.log("try login ",data.fromUserID)
          
          user.createUser(data.fromUserID,connection,(err,success)=>{

            if(err){
              console.log(err)
              throw err
            }

            var message = {
              type: SESSION_MESSAGE.LOGIN,
              success: success
            }

            connection.send(JSON.stringify(message));
          });

        break;
        case SESSION_MESSAGE.LOGOUT:
          
          console.log(data.fromUserID ," logout");
          
          message ={
            type: SESSION_MESSAGE.LOGOUT
          };

          user.sendTo(data.fromUserID,message);

        break;
        case ROOM_MESSANGE.ENTER_ROOM: 
           
          console.log("enter room",data.fromUserID ,data.roomID)

          async.waterfall([
            function(asyncCallBack){
              room.isRoom(data.roomID,asyncCallBack)

            },
            function(isRoom,asyncCallBack){
                if(isRoom){
                  console.log("enterRoom")

                  room.enterRoom(data.roomID,data.fromUserID,(err,enteredRoom)=>{
                    if(err){
                      asyncCallBack(err);
                    }

                    asyncCallBack(null, enteredRoom)
        
                  });

                }else{

                  console.log("createRoom("+ data.roomID+")")

                  room.createRoom(data.roomID,data.fromUserID,(err,createdRoom)=>{
                    
                    if(err){
                      asyncCallBack(err)
                    }
                    
                    asyncCallBack(null,createdRoom)
        
                  })
                }

            },
            function(room,asyncCallBack){

              var sanitizedRemoteUsers = [];
        
              for(var key in room.users){    //change to map??

                sanitizedRemoteUsers.push(key);
                
              }

              asyncCallBack(null,sanitizedRemoteUsers)
              
            },function(sanitizedUsers, asyncCallBack){

              var room = {
                "roomID": data.roomID,
                "users":sanitizedUsers,
              }

              var message ={

                // from:data.fromUserID,
                type: ROOM_MESSANGE.ENTER_ROOM,
                room: room,
                success: true
              }

              user.sendTo(data.fromUserID,message);

              if(Object.keys(sanitizedUsers).length>1){

                var message ={

                  from:data.fromUserID,
                  type: BROADCASTMESSAGE.ENTER_ROOM,
                  room: room,
                  success:true
                }
    
                room.broadcast(data.fromUserID,data.roomID,message,(err)=>{
                  
                  if(err){
                    asyncCallBack(err)
                  }

                })

              }
              
              asyncCallBack(null)
              
            }
            
          ],function(err){
            if(err){

              console.log(err)
              //todo: rollback

            }

            console.log("enter Room process done")
            
          })
          
             
        break;
        case ROOM_MESSANGE.LEAVE_ROOM: 
        
          console.log(data.fromUserID ," leave from",data.roomID);
          
          room.leaveRoom(data.fromUserID,data.roomID,(err)=>{

            if(err){
              console.log(err)
              throw err
            }

            var message={

              fromUserID: data.fromUserID,
              type: ROOM_MESSANGE.LEAVE_ROOM,
            }

            user.sendTo(data.fromUserID,message);

            var broadcastMessage={
              userID: data.fromUserID,
              type: BROADCASTMESSAGE.LEAVE_ROOM
            }

            if(room.rooms[data.roomID]){

              room.broadcast(data.fromUserID,data.roomID,broadcastMessage,(err)=>{
                if(err){
                  console.log(err);
                  throw err
                }
                
              });

            }

          });
        
        break;

        case NEGOTIATION_MESSAGE.OFFER:
      
          console.log("Sending offer from ", data.fromUserID,"to ",data.toUserID);
        
          user.sendTo(data.toUserID, { 
            fromUserID: data.fromUserID,
            type: NEGOTIATION_MESSAGE.OFFER, 
            offer: data.offer, 
            toUserID: data.toUserID
          }); 

        break;

        case NEGOTIATION_MESSAGE.ANSWER: 

        console.log("Sending answer from ",data.fromUserID ," to ",data.toUserID); 

        user.sendTo(data.toUserID, { 
          fromUserID: data.fromUserID,
          type: NEGOTIATION_MESSAGE.ANSWER, 
          answer: data.answer, 
          toUserID: data.toUserID
        }); 

      break; 
     
      case NEGOTIATION_MESSAGE.CANDIDATE: 
        
        console.log("Sending candidate from",data.fromUserID," to ", data.toUserID); 

        user.sendTo(data.toUserID, { 
          fromUserID: data.fromUserID,
          type: NEGOTIATION_MESSAGE.CANDIDATE, 
          candidate: data.candidate, 
          toUserID: data.toUserID
        }); 
        
      break;

      default: 

        console.log("send Invalide err to ",data.fromUserID )
        user.sendTo(data.fromUserID, { 
            type: ERR_MESSAGE.INVALIDMESSAGE, 
            message: "sending Invalid Message type:" + data.type 
          }); 
      
      break; 
      }


}

parsingMessage = function(message,callback){

    var data; 
		
      try { 
         data = JSON.parse(message); 
        
      } catch (e) { 
         console.log("Invalid JSON"); 
         callback(new Error("Invalid JSON err:",e)) 
      }

      callback(null,data)
}