
### 北京地铁图

北京地铁图，基于svg开发，支持PC、移动端多种浏览器。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20181218084607543.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L20wXzM3Mjg1MTkz,size_16,color_FFFFFF,t_70)
-  [线上开源地址 https://github.com/StavinLi/beiJingSubway](https://github.com/StavinLi/beiJingSubway) 点个赞吧！
- [项目预览 http://47.106.166.17:5101/](http://47.106.166.17:5101/)

-------------------
 

#### 项目介绍

- 技术点

 1.`node`代理请求`https://map.bjsubway.com/`数据
```
app.use('/', proxy({
    target: 'https://map.bjsubway.com/',
    pathRewrite: {
        '^/apis': '' // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
    },
    changeOrigin: true
}));
```

2.请求结果`XML`格式解析
```
$.ajax({
    url: "/apis/subwaymap/beijing.xml",
    dataType: 'xml',
    type: 'GET',
    timeout: 5000,
    success: function(data) {
        var ls = $(data).find("sw").children()
        ...
    })
});
```
3.gulp构建工具，文件打包
```
//监控文件变化
gulp.task('watch', function() {
    gulp.watch(["src/css/*.css", "src/js/*.js"], ['default']);
});

gulp.task('default', function(cb) {
    runSequence('other', ['css', 'js'], 'html')(cb);
})
```
- 数据来源--北京地铁官网


#### 项目安装

> git clone https://github.com/StavinLi/beiJingSubway.git

#### 项目运行
> 1.环境依赖  `npm i`
> 2.本地运行 `npm run start` 
> 3.打包运行 `npm run build` 

#### 目录结构描述
```
├── Readme.md                   //help
├── dest                        //发布包
│   ├── css
│   ├── js                
│   └── *.html        
├── libs                        //第三方文件
├── node_modules                  
├── rev                         //静态版本json
├── src                         //开发包
└── gulpfile.js
```

#### 页面预览
- [在线预览](http://47.106.166.17:5101/) 点个赞吧！


#### 更新记录

##### 2018.12.06
```
    -  init commit
```
##### 2018.12.07
```
    -  node 跨求请求xml
    -  跨域 pathRewrite
```
##### 2018.12.10
```
    -  require("open") 本地运行打开新窗口
    -  西二旗坐标空格导致移动端显示错误
```
##### 2018.12.19
```
    -  新增站点hover 信息
```
##### 2018.12.20
```
    -  新增自定义线路
    -  修复少换乘切换相同换乘次数时，未综合考虑时间因素
    -  新增耗时、途径、换乘、票价
```
##### 2018.12.21
```
    -  新增起止点转换
```
##### 2018.12.21
```
    -  node 新增 设置证书免校验
```
#### 总结注意
> 1.line 标签西二旗属性 `lb="西二旗" x="757 "` 其中x属性中空格在移动端造成坐标失效，解决办法： ` $(this).attr("x")*1`

