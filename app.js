const express = require("express");
var proxy = require('http-proxy-middleware');
var app = express();
var open = require("open");
app.use(express.static('src'));
app.use('/', proxy({
    target: 'https://map.bjsubway.com/',
    pathRewrite: {
        '^/apis': '' // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
    },
    changeOrigin: true,
    "secure": false,
}));
app.listen(5101);
open("http://127.0.0.1:5101")