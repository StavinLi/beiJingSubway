const express = require("express");
var proxy = require('http-proxy-middleware');
var app = express();
app.use(express.static('src'));
app.use('/', proxy({ target: 'https://map.bjsubway.com', changeOrigin: true }));
app.listen(3000);