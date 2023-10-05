const express = require("express");
var proxy = require('http-proxy-middleware');
var app = express();
var open = require("open");
app.use(express.static('src'));

app.use('/', proxy({
    target: 'https://map.bjsubway.com/',
    pathRewrite: {
        '^/apis': ''
    },
    changeOrigin: true,
    "secure": false,
}));
app.listen(5102);
open("http://localhost:5102")