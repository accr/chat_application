/**
 * Created by AC on 2017/2/28.
 */


// 使用Socket.IO
var socketio = require('socket.io');

var io;

var guestNumber = 1;

var nickName = {};

var nameUsed = [];

var currentRoom  = {};


// 启动Socket.IO服务器
exports.listen = function (server) {
    io = socketio.listen(server);   // 启动Socket.IO服务器，允许它搭载在已有的HTTP服务器上
    io.set('log level',1);

    io.sockets.on('connection',function(socket){    // 定义每个用户连接的处理逻辑
        guestNumber = assignGuestName(socket,guestNumber,nickName,nameUsed);    // 在用户连接上来时赋予其一个访客名

        joinRoom(socket,'Lobby');   // 在用户连接上来时把他放入聊天室Lobby里

        handleMessageBroadcasting(socket,nickName); // 处理用户的消息，更名，以及聊天室的创建和变更

        handleNameChangeAttempts(socket,nickName,namesUsed);

        handleRoomJoining(socket);

        socket.on('room',function () {  // 用户发出请求时，向其提供已经被占用的聊天室的列表
            socket.emit('rooms',io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket,nickName,namesUsed);   // 定义用户断开连接后的清楚逻辑

    });
};

// 分配用户名称
function assignGuestName(socket,guestNumber,nickNames,namesUsed){
    var name = 'Guest' + guestNumber;   // 生成新昵称
    nickNames[socket.id] = name;    // 把用户昵称跟客户端连接ID关联上
    socket.emit('nameResult',{  // 让用户知道他们的昵称
        success:true,
        name:name
    });

    namesUsed.push(name);   // 存放已经被占用的昵称
    return guestNumber + 1; // 增加用来生成昵称的计数器
}

// 进入聊天室
function joinRoom(socket,room) {
    socket.join(room);  // 让用户进入房间
    currentRoom[socket.id] = room;  // 记录用户的当前房间
    socket.emit('joinResult',{room:room});  // 让用户知道他们进入了新的房间
    socket.broadcast.to(room).emit('message',{  // 让房间里的其他用户知道有新用户进入了房间
        text:nickName[socket.id] + ' has joined ' + room + ' . '
    });

    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1){ // 如果不知一个用户在这个房间里，汇总下都是谁

    }
}