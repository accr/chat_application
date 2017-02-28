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
