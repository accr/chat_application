/**
 * Created by AC on 2017/2/28.
 */

// 变量声明
var http = require('http'); // 内置的http模块提供了HTTP服务器和客户端功能

var fs = require('fs'); // 内置的path模块提供了与文件系统路径相关的功能

var path = require('path');

var mime = require('mime'); // 附加的mime模块有根据文件扩展名得出MIME类型的能力

var cache = {}; // cache是用来缓存文件内容的对象


/*==========================
  发送文件数据及错误响应
  ==========================
 */

// 所请求的文件不存在时发送404错误
function send404(response) {
    response.writeHead(404,{'Content-type':'text/plain'});
    response.write('Error 404:resource not found.');
    response.end();
}

// 提供文件数据服务
function sendFile(response,filePath,fileContents) {
    response.writeHead(
        200,
        {"content-type":mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}


/*==========================
    访问内存（RAM）要比访问文件系统快得多
    Node程序通常会把常用的数据缓存到内存里。
    聊天程序把静态文件缓存到内存中，只有第一次访问的时候才会从文件系统读取
  ==========================
 */

// 提供静态文件服务
function serverStatic(response,cache,absPath) {
    if(cache[absPath]){     // 检查文件是否缓存在内存中
        senfFile(response,absPath,cache[absPath]);      // 从内存中返回文件
    }else {
        fs.exists(absPath,function (exists) {       // 检查文件是否存在
            if(exists){
                fs.readFile(absPath,function (err,data) {   // 从硬盘中读取文件
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response,absPath,data);    // 从硬盘中读取文件并返回
                    }
                });
            }else{
                send404(response);  // 发送HTTP 404响应
            }

        })
    }
}

// 创建HTTP服务器，用匿名函数定义对每个请求的处理行为
var server = http.createServer(function(request,response) {
    var filePath = false;

    if(request.url == '/'){
        filePath = 'public/index.html'; // 确定返回的默认HTML文件
    }else{
        filePath = 'public' + request.url;  // 将URl路径转为文件的相对路径
    }
    var absPath = './' + filePath;
    serverStatic(response,cache,absPath);   // 返回静态文件
});


// 启动HTTP服务器
server.listen(3000,function () {
     console.log("Server listening on port 3000.");
});

// 加载一个定制的Node模块，用来处理基于Socket.IO服务端聊天功能
var chatServer = require('./lib/char_server');

// 启动Socket.IO服务器
chatServer.listen(server);