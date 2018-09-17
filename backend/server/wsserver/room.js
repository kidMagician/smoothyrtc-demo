var ROOM_AVAILABLE_USER_NUM = require('./constants').ROOM_AVAILABLE_USER_NUM;
var MAX_ROOM_NAME_LENGTH =require('./constants').MAX_ROOM_NAME_LENGTH;
var MIN_ROOM_NAME_LENGTH = require('./constants').MIN_ROOM_NAME_LENGTH;

var rooms ={};

module.exports.rooms = rooms;

var user= require('./user.js');

var forbiddenNames = [
  ];

function isNameForbidden(roomID){

    return forbiddenNames.indexOf(roomIDs) >=0;
}

function isNameTooLong(roomID){

    return roomID.length > MAX_ROOM_NAME_LENGTH; 
}

function isNameTooShort(roomID){

    return roomID.length < MIN_ROOM_NAME_LENGTH;
}

function isUserinRoom(userID,roomID){

    if (rooms[roomID].users[userID]){
        
        return true;
    }else{
        return false;
    }

}

module.exports.isRoom = function(roomID,callback){
    
    if(!roomID){
        return callback(new Error('roomID cat not be null'))
    }

    if(!rooms[roomID]){
        callback(null,false)
    }else{
        return callback(null,true)
    }

    

}

module.exports.createRoom = function(roomID,userID,callback){

    // if(!isNameForbidden(roomID)){

    //     return callback(new Error('roomID is forbiddenNames'));     
    // }

    // if(!isNameTooLong(roomID)){

    //     return callback(new Error('roomID is too Long'));
    // }

    // if(!isNameTooShort(roomID)){

    //     return callback(new Error('roomID is too Short'))
    // }

    if(!roomID){

        return callback(new Error('roomeID can not be null'));
    }

    if(user.users[userID]){

        user.users[userID].status = user.USER_STATUS.INROOM;
        user.users[userID].roomID = roomID;
        
        var users ={};

        users[userID]= user.users[userID]; 

        rooms[roomID] = {users:users};

    }else{
        return callback(new Error(userID,'user dont have connection'))
    }

    var room = rooms[roomID]

    return callback(null,room)

}

 function deleteRoom(roomID,callback){

    if(!roomID){

        return callback(new Error('roomID can not be null'));
    }

    delete rooms[roomID]
    
    return callback(null)
}

module.exports.enterRoom =function(roomID,userID, callback){

    if(!roomID){
        return callback(new Error('roomename can not be null'));
    }

    if(!userID){
        return callback(new Error('userID cant not be null'));
    }

    if(!rooms[roomID]){
        return callback(new Error('room is not avaliavle \n roomID:'+roomID))
    }

    if(!rooms[roomID].users[userID]){

        user.users[userID].status = user.USER_STATUS.INROOM;
        user.users[userID].roomID = roomID;
        
        rooms[roomID].users[userID] =user.users[userID];

        return callback(null,rooms[roomID])
    
    }else{
        
        return callback(new Error('user is alredy in the room'));
    }

}

module.exports.leaveRoom = function(userID,roomID,callback){

    if(!roomID){
        return callback(new Error('roomename can not be null'));
    }

    if(!userID){
        return callback(new Error('userID can not be null'));
    }

    rooms[roomID].users[userID].status = user.USER_STATUS.ONLINE;
    rooms[roomID].users[userID].roomID = null;
    delete rooms[roomID].users[userID];
    
    if(Object.keys(rooms[roomID].users).length<=0){
        deleteRoom(roomID,(err)=>{

            if(err){
                return callback(err);
            }
        });
    }
    
    return callback(null);

}


module.exports.checkfull = function(roomID,callback){

    if(!roomID){
        return callback(new Error('roomename can not be null'));
    }

    if(roomID.length <= ROOM_AVAILABLE_USER_NUM){
        return callback(null,true);
    }else{
        return callback(null,false);
    }

}

module.exports.broadcast = function(from_userID,roomID,message,callback){

    if(!from_userID){
        return callback(new Error('userID can not be null'));
    }

    if(!roomID){
        return callback(new Error('roomID can not be null'));
    }

    if(!rooms[roomID]){
        return callback(new Error('room is not available'));
    }

    for(var userID in rooms[roomID].users){
        if(userID != from_userID){
            user.sendTo(userID,message)
        }
    }

    return callback(null)
    
}





