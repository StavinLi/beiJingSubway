var beijingData = "",
    startStation = "",
    endStation = "";
if (!func.isPC()) {
    alert("移动端部分功能无法体验，请在PC端查看")
}
$.ajax({
    url: "/apis/subwaymap/beijing.xml",
    dataType: 'xml',
    type: 'GET',
    async: false,
    timeout: 5000,
    success: function(data) {
        beijingData = data;
        var ls = $(data).find("sw").children()
        for (var i = 0; i < ls.length; i++) {
            var ps = $(ls[i]).children()
            var lColor = $(ls[i]).attr("lc").replace("0x", "#");
            var lLoop = $(ls[i]).attr("loop");
            var lSlb = $(ls[i]).attr("slb");
            for (var n = 0; n < $(ls[i]).attr("lp").split(";").length; n++) {
                if ($(ls[i]).attr("lp").split(";")[n]) {
                    var lp = $(ls[i]).attr("lp").split(";")[n].split(",");
                    var rect = $.svg('rect').appendTo('#g-box')
                    rect.attr({
                        x: lp[0] * 1,
                        y: lp[1] * 1,
                        width: lp[2] * 1,
                        height: lp[3] * 1,
                        fill: lColor,
                    });
                    var text = $.svg('text').appendTo('#g-box')
                    text.addSvgClass("subway-name").attr({
                        x: lp[0] * 1 + lp[2] / 2,
                        y: lp[1] * 1 + lp[3] / 3 * 2,
                    }).html(lSlb.split(",")[n].indexOf("机场") == -1 ? "地铁" + (isNaN(lSlb.split(",")[n] * 1) ? lSlb.split(",")[n] : lSlb.split(",")[n] + "号") + "线" : lSlb.split(",")[n] + "线");
                }
            }
            for (var j = 0; j < ps.length; j++) {
                if (j == ps.length - 1) {
                    if (lLoop === "false") {
                        continue;
                    }
                }
                var thisP = $(ps[j]);
                var thisPlus = (j == ps.length - 1) ? $(ps[0]) : $(ps[j + 1])
                if (thisP.attr("arc")) {
                    var path = $.svg('path').appendTo('#g-box')
                    path.attr({
                        d: `M${thisP.attr("x")*1} ${thisP.attr("y")*1} Q${thisP.attr("arc").split(":")[0]*1} ${thisP.attr("arc").split(":")[1]*1} ${thisPlus.attr("x")*1} ${thisPlus.attr("y")*1}`,
                        stroke: lColor
                    });
                    continue;
                }
                var line = $.svg('line').appendTo('#g-box')
                line.attr({
                    x1: thisP.attr("x") * 1,
                    y1: thisP.attr("y") * 1,
                    x2: thisPlus.attr("x") * 1,
                    y2: thisPlus.attr("y") * 1,
                    stroke: lColor,
                    sdata: thisP.attr("lb")
                })
            }
            for (var j = 0; j < ps.length; j++) {
                var thisP = $(ps[j])
                if (!thisP.attr("lb")) {
                    continue;
                }
                var text = $.svg('text').appendTo('#g-box')
                text.attr({
                    "font-size": 12,
                    x: thisP.attr("x") * 1 + thisP.attr("rx") * 1,
                    y: thisP.attr("y") * 1 + thisP.attr("ry") * 1 + 14,
                    size: 12
                })
                var tspan = $.svg('tspan').appendTo(text)
                tspan.html(thisP.attr("lb"))
                if (thisP.attr("iu") === "false") {
                    text.addSvgClass("disabled")
                    var text1 = $.svg('text').appendTo('#g-box')
                    text1.attr({
                        "font-size": 12,
                        x: thisP.attr("x") * 1 + thisP.attr("rx") * 1,
                        y: thisP.attr("y") * 1 + thisP.attr("ry") * 1 + 28,
                        size: 12
                    }).addSvgClass("disabled")
                    var tspan = $.svg('tspan').appendTo(text1)
                    tspan.html("(暂缓开通)")
                }
                if (thisP.attr("ex") === "true") {
                    var image = $.svg('image').appendTo('#g-box')
                    image.attr({
                        width: "14",
                        height: "14",
                        x: thisP.attr("x") - 7,
                        y: thisP.attr("y") - 7,
                        sdata: thisP.attr("lb")
                    });
                    image[0].href.baseVal = `https://map.bjsubway.com/subwaymap/turn.png`;
                } else {
                    var circle = $.svg('circle').appendTo('#g-box')
                    circle.attr({
                        r: 4,
                        cx: thisP.attr("x") * 1,
                        cy: thisP.attr("y") * 1,
                        stroke: lColor,
                        sdata: thisP.attr("lb")
                    })
                    if (thisP.attr("iu") === "false") {
                        circle.addSvgClass("disabled")
                    }
                }
            }
        }
        window.panzoom = svgPanZoom('#mobile-svg', {
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: false,
            fit: false,
            center: false,
            contain: false,
            minZoom: 0.3,
            maxZoom: 5,
            customEventsHandler: eventsHandler
        });
        panzoom.pan({ x: -950 + window.innerWidth / 2, y: -700 + window.innerHeight / 2 });
    }
});
var stations = {},
    isClick = false;
$.ajax({
    url: "/apis/subwaymap/stations.xml",
    dataType: 'xml',
    type: 'GET',
    async: false,
    timeout: 5000,
    success: function(data) {
        var ss = $(data).find("stations").children()
        for (var i = 0; i < ss.length; i++) {
            var stationName = $(ss).eq(i).attr("name");
            if (!stations[stationName]) {
                stations[stationName] = []
            }
            var firstEnds = $(ss).eq(i).attr("firstend")
            for (var j = 0; j < firstEnds.split("||||||").length; j++) {
                var firstEnd = firstEnds.split("||||||")[j]
                if (!stations[stationName][firstEnd.split("::::::")[0]]) {
                    stations[stationName][firstEnd.split("::::::")[0]] = []
                }
                stations[stationName][firstEnd.split("::::::")[0]].push({
                    line: firstEnd.split("::::::")[1],
                    time: firstEnd.split("::::::")[2],
                })
            }
        }
        var timer = null,
            isStart = true;
        $("circle:not(.disabled),image[sdata]").on("click", function() {
            var $that = $(this)
            isClick = true;
            var image = $.svg('image').appendTo('#g-box')
            $(".station-info").hide();
            image.attr({
                name: $that.attr("sdata"),
                width: "20",
                height: "31",
                x: $that[0].nodeName == "circle" ? $that.attr("cx") - 10 : ($that.attr("x") - 3),
                y: $that[0].nodeName == "circle" ? $that.attr("cy") - 28 : ($that.attr("y") - 21),
            }).addSvgClass(`mark ${isStart?"mark-start":"mark-end"}`);
            image[0].href.baseVal = `https://map.bjsubway.com/subwaymap/${isStart?"start":"end"}.png`;
            isStart = !isStart;
            if (isStart) {
                startStation = $(".mark-start").attr("name");
                endStation = $(".mark-end").attr("name");
                $(".line-info").show();
                $(".line-info h2").html(`${startStation} - ${endStation}`);
                $(".line-type li").removeClass("active");
                $(".line-type li[data-value='1']").addClass("active");
                var rect = $.svg('rect').appendTo('#g-box');
                rect.attr({
                    width: 2500,
                    height: 1500,
                    x: -250,
                    y: 0
                }).addSvgClass("mark");
                getThisLineInfo(1);
                var flag = 0;
                $("rect.mark").bind({
                    mousedown: function(e) {
                        flag = 0;
                    },
                    mousemove: function(e) {
                        flag = 1;
                    },
                    mouseup: function(e) {
                        if (flag === 0) { //点击
                            $("rect.mark").bind('click', function() {
                                isClick = false;
                                $(".mark").remove();
                                $(".line-info").hide();
                                return false; //阻止默认行为
                            })
                        }
                    }
                });
            }
        });
        $("circle:not(.disabled),image[sdata]").hover(function() {
            if (isClick) {
                return;
            }
            var $that = $(this)
            var thisleft = $that.offset().left + ($that[0].nodeName == "circle" ? 4 : 7) * panzoom.getZoom(),
                thisTop = $that.offset().top - 200 + ($that[0].nodeName == "circle" ? 4 : 7) * panzoom.getZoom();
            timer = setTimeout(function() {
                var stationName = $that.attr("sdata");
                var lines = Object.keys(stations[stationName])
                var infoStr = ``;
                for (var i = 0; i < lines.length; i++) {
                    infoStr += `<article><h3>${lines[i]}</h3>`
                    for (var j = 0; j < stations[stationName][lines[i]].length; j++) {
                        var thisLine = stations[stationName][lines[i]][j]
                        infoStr += `<ul>
                            <li>${thisLine.line}</li>
                            <li>${thisLine.time.replace("、"," ")}</li>
                        </ul>`
                    }
                    infoStr += `</article>`
                }
                $(".station-info").show().scrollTop(0).css({
                    left: thisleft,
                    top: thisTop
                }).html(`<h2>${$that.attr("sdata")}</h2>${infoStr}`)
            }, 500)
        }, function() {
            $(".station-info").hide();
            clearTimeout(timer)
        });
        $(".station-info").hover(function() {
            $(".station-info").show();
        }, function() {
            $(".station-info").hide();
        })
    }
});

$(".line-type").on("click", "li:not(.active)", function() {
    $(this).addClass("active").siblings().removeClass("active");
    getThisLineInfo($(this).attr("data-value"));
});

function getThisLineInfo(type = 1) {
    $(".line-info article").remove();
    $.ajax({
        type: "get",
        url: `/apis/api/searchstartend?start=${startStation}&end=${endStation}`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success(data) {
            $(".mark:not(rect):not(.mark-start):not(.mark-end)").remove();
            var timeReturnArr = [
                [],
                []
            ];
            for (var i = 0; i < JSON.parse(data.fangan).length; i++) {
                var thisTime = JSON.parse(data.fangan)[i]["m"] * 1;
                var thisReturn = JSON.parse(data.fangan)[i]["p"].length;
                timeReturnArr[0].push(thisTime)
                timeReturnArr[1].push(thisReturn)
            }
            var timeIndex = timeReturnArr[0].indexOf(timeReturnArr[0].min()),
                returnIndex;
            if (timeReturnArr[1][timeIndex] == timeReturnArr[1].min()) {
                returnIndex = timeIndex;
            } else {
                returnIndex = timeReturnArr[1].indexOf(timeReturnArr[1].min());
            }
            var firstPlan = type == 1 ? JSON.parse(data.fangan)[timeIndex] : JSON.parse(data.fangan)[returnIndex];
            var stationNum = 0;
            for (var i = 0; i < firstPlan["p"].length; i++) {
                stationNum += firstPlan["p"][i].length
            }
            $(".line-info p").html(`约${firstPlan.m}分钟• 途径${stationNum}站• 换乘${firstPlan["p"].length-1}次• 票价${data.price}元`)
            linePinter(firstPlan["p"])
        },
        error(data) {
            alert(data.responseJSON.message);
            isClick = false;
            $(".mark").remove();
            $(".line-info").hide();
        }
    })
}

function linePinter(firstPlan) {
    var startEndMark = $("image.mark").clone();
    $("image.mark").remove();
    var thisLineStr = "";
    for (var i = 0; i < firstPlan.length; i++) {
        var lineCode = firstPlan[i][0][0];
        var thisLine = $(beijingData).find("sw").find(`l[lcode='${lineCode}']`);
        var lColor = thisLine.attr("lc").replace("0x", "#");
        for (var j = 0; j < firstPlan[i].length - 1; j++) {
            var thisPNum = firstPlan[i][j][3] * 1;
            var thisPlusNum = firstPlan[i][j + 1][3] * 1;
            var ssN = [thisPNum, thisPlusNum];
            loopPinter(ssN, thisLine, lColor)
        }
        var thisLineNum = thisLine.attr("slb").split(",")[0]
        thisLineStr += `<article><h3>${thisLineNum.indexOf("机场") == -1 ? "地铁" + (isNaN(thisLineNum * 1) ? thisLineNum : thisLineNum + "号") + "线" : thisLineNum + "线"}</h3><ul>`;
        for (var j = 0; j < firstPlan[i].length; j++) {
            var thisP = thisLine.find(`p[n='${firstPlan[i][j][3]}']`)
            if (!thisP.attr("lb")) {
                continue;
            }
            thisLineStr += `<li>${firstPlan[i][j][1]}</li>`
            var text = $.svg('text').appendTo('#g-box')
            text.attr({
                "font-size": 12,
                x: thisP.attr("x") * 1 + thisP.attr("rx") * 1,
                y: thisP.attr("y") * 1 + thisP.attr("ry") * 1 + 14,
                size: 12
            }).addSvgClass("mark")
            var tspan = $.svg('tspan').appendTo(text)
            tspan.html(thisP.attr("lb"))
            if (thisP.attr("iu") === "false") {
                text.addSvgClass("disabled")
                var text1 = $.svg('text').appendTo('#g-box')
                text1.attr({
                    "font-size": 12,
                    x: thisP.attr("x") * 1 + thisP.attr("rx") * 1,
                    y: thisP.attr("y") * 1 + thisP.attr("ry") * 1 + 28,
                    size: 12
                }).addSvgClass("disabled")
                var tspan = $.svg('tspan').appendTo(text1)
                tspan.html("(暂缓开通)")
            }
            if (thisP.attr("ex") === "true") {
                var image = $.svg('image').appendTo('#g-box')
                image.attr({
                    width: "14",
                    height: "14",
                    x: thisP.attr("x") - 7,
                    y: thisP.attr("y") - 7,
                    sdata: thisP.attr("lb")
                }).addSvgClass("mark");
                image[0].href.baseVal = `https://map.bjsubway.com/subwaymap/turn.png`;
            } else {
                var circle = $.svg('circle').appendTo('#g-box')
                circle.attr({
                    r: 4,
                    cx: thisP.attr("x") * 1,
                    cy: thisP.attr("y") * 1,
                    stroke: lColor,
                    sdata: thisP.attr("lb")
                }).addSvgClass("mark")
                if (thisP.attr("iu") === "false") {
                    circle.addSvgClass("disabled")
                }
            }
        }
        thisLineStr += `</ul></article>`
        $('#g-box').append(startEndMark)
    }
    $(thisLineStr).appendTo(".line-info div")
}

function loopPinter(ssN, thisLine, lColor) {
    var isLoop = thisLine.attr("loop");
    if (isLoop === "true") {
        if ((ssN.max() - ssN.min()) > (thisLine.find("p").length - ssN.max() + ssN.min())) {
            for (var i = 0; i < ssN.min(); i++) {
                var thisP = thisLine.find(`p[n='${i}']`);
                var thisPlus = thisLine.find(`p[n='${i+1}']`);
                if (thisP.attr("arc")) {
                    var path = $.svg('path').appendTo('#g-box')
                    path.attr({
                        d: `M${thisP.attr("x")*1} ${thisP.attr("y")*1} Q${thisP.attr("arc").split(":")[0]*1} ${thisP.attr("arc").split(":")[1]*1} ${thisPlus.attr("x")*1} ${thisPlus.attr("y")*1}`,
                        stroke: lColor
                    }).addSvgClass("mark");
                    continue;
                }
                var line = $.svg('line').appendTo('#g-box')
                line.attr({
                    x1: thisP.attr("x") * 1,
                    y1: thisP.attr("y") * 1,
                    x2: thisPlus.attr("x") * 1,
                    y2: thisPlus.attr("y") * 1,
                    stroke: lColor,
                    sdata: thisP.attr("lb")
                }).addSvgClass("mark")
            }
            for (var i = ssN.max(); i < thisLine.find("p").length; i++) {
                var thisP = thisLine.find(`p[n='${i}']`);
                var thisPlus = thisLine.find(`p[n='${i+1 ==thisLine.find("p").length?0: i+1}']`);
                if (thisP.attr("arc")) {
                    var path = $.svg('path').appendTo('#g-box')
                    path.attr({
                        d: `M${thisP.attr("x")*1} ${thisP.attr("y")*1} Q${thisP.attr("arc").split(":")[0]*1} ${thisP.attr("arc").split(":")[1]*1} ${thisPlus.attr("x")*1} ${thisPlus.attr("y")*1}`,
                        stroke: lColor
                    }).addSvgClass("mark");
                    continue;
                }
                var line = $.svg('line').appendTo('#g-box')
                line.attr({
                    x1: thisP.attr("x") * 1,
                    y1: thisP.attr("y") * 1,
                    x2: thisPlus.attr("x") * 1,
                    y2: thisPlus.attr("y") * 1,
                    stroke: lColor,
                    sdata: thisP.attr("lb")
                }).addSvgClass("mark")
            }
        } else {
            for (var i = ssN.min(); i < ssN.max(); i++) {
                var thisP = thisLine.find(`p[n='${i}']`);
                var thisPlus = thisLine.find(`p[n='${i+1}']`);
                if (thisP.attr("arc")) {
                    var path = $.svg('path').appendTo('#g-box')
                    path.attr({
                        d: `M${thisP.attr("x")*1} ${thisP.attr("y")*1} Q${thisP.attr("arc").split(":")[0]*1} ${thisP.attr("arc").split(":")[1]*1} ${thisPlus.attr("x")*1} ${thisPlus.attr("y")*1}`,
                        stroke: lColor
                    }).addSvgClass("mark");
                    continue;
                }
                var line = $.svg('line').appendTo('#g-box')
                line.attr({
                    x1: thisP.attr("x") * 1,
                    y1: thisP.attr("y") * 1,
                    x2: thisPlus.attr("x") * 1,
                    y2: thisPlus.attr("y") * 1,
                    stroke: lColor,
                    sdata: thisP.attr("lb")
                }).addSvgClass("mark")
            }
        }
    } else {
        for (var i = ssN.min(); i < ssN.max(); i++) {
            var thisP = thisLine.find(`p[n='${i}']`);
            var thisPlus = thisLine.find(`p[n='${i+1}']`);
            if (thisP.attr("arc")) {
                var path = $.svg('path').appendTo('#g-box')
                path.attr({
                    d: `M${thisP.attr("x")*1} ${thisP.attr("y")*1} Q${thisP.attr("arc").split(":")[0]*1} ${thisP.attr("arc").split(":")[1]*1} ${thisPlus.attr("x")*1} ${thisPlus.attr("y")*1}`,
                    stroke: lColor
                }).addSvgClass("mark");
                continue;
            }
            var line = $.svg('line').appendTo('#g-box')
            line.attr({
                x1: thisP.attr("x") * 1,
                y1: thisP.attr("y") * 1,
                x2: thisPlus.attr("x") * 1,
                y2: thisPlus.attr("y") * 1,
                stroke: lColor,
                sdata: thisP.attr("lb")
            }).addSvgClass("mark")
        }
    }
}
var eventsHandler = {
    haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
    init: function(options) {
        var instance = options.instance,
            initialScale = 1,
            pannedX = 0,
            pannedY = 0
        this.hammer = Hammer(options.svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
        })
        this.hammer.get('pinch').set({
            enable: true
        })
        ``
        this.hammer.on('doubletap', function(ev) {
            instance.zoomIn()
        })
        this.hammer.on('panstart panmove', function(ev) {
            if (ev.type === 'panstart') {
                pannedX = 0
                pannedY = 0
            }
            instance.panBy({
                x: ev.deltaX - pannedX,
                y: ev.deltaY - pannedY
            })
            pannedX = ev.deltaX
            pannedY = ev.deltaY
        })
        this.hammer.on('pinchstart pinchmove', function(ev) {
            if (ev.type === 'pinchstart') {
                initialScale = instance.getZoom()
                instance.zoomAtPoint(initialScale * ev.scale, {
                    x: ev.center.x,
                    y: ev.center.y
                })
            }
            instance.zoomAtPoint(initialScale * ev.scale, {
                x: ev.center.x,
                y: ev.center.y
            })
        })
        options.svgElement.addEventListener('touchmove', function(e) {
            e.preventDefault();
        });
    },
    destroy: function() {
        this.hammer.destroy()
    }
}