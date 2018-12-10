const express = require("express");
var proxy = require('http-proxy-middleware');
var app = express();
app.use(express.static('dest'));
app.use('/', proxy({
    target: 'https://map.bjsubway.com/',
    pathRewrite: {
        '^/apis': '' // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
    },
    changeOrigin: true
}));
app.listen(5101);