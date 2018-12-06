const express = require("express");
var fs = require('fs');
var app = express();
app.use(express.static('src'));
var gData = null;
//读取数据
fs.readFile("C:\\Users\\Administrator\\Desktop\\study\\beiJingSubway\\src\\js\\subway.xml", function(err, data) {
    //数据读取成功
    if (err)
        throw new Error('读取数据出错！');
    gData = data;

    app.listen(7000);
    console.log('服务已启动')
});
//访问数据
app.get("/books", function(req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    res.send(gData);
    console.log('响应成功')
})