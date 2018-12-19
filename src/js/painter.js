$.ajax({
    url: "/apis/subwaymap/beijing.xml",
    dataType: 'xml',
    type: 'GET',
    async: false,
    timeout: 5000,
    success: function(data) {
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
var stations = {}
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
        console.log(stations)
        var timer = null;
        $("circle:not(.disabled),image[sdata]").hover(function() {
            var $that = $(this)
            var thisleft = $that.offset().left + ($that[0].nodeName == "circle" ? 4 : 7),
                thisTop = $that.offset().top - 200 + ($that[0].nodeName == "circle" ? 4 : 7);
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