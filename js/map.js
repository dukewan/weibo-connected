var width = 1000,
    height = 600,
    active = d3.select(null);

var svg = d3.select("body").select("#map")
    .attr("width", width)
    .attr("height", height);


// 定义投影
var projection = d3.geo.mercator()
    .center([105, 38])
    .scale(750)
    .translate([width / 2, height / 2]);

var g = svg.append("g");

// 地理投影转换
var path = d3.geo.path()
    .projection(projection);

d3.json("data/china.topo.json", function(error, china) {
    // 获取中国轮廓信息
    var chinaBorder = topojson.feature(china, china.objects.china);

    // 绘制路径
    g.append("path")
        .datum(chinaBorder)
        .attr("class", "china")
        .attr("d", path);
});

d3.json("data/total.topo.json", function(error, total) {
    var provinces = topojson.feature(total, total.objects.province);

    // 绘制省份
    g.selectAll("path")
        .data(provinces.features)
        .enter().append("path")
        .attr("name", function(d) {return d.properties.name;})
        .attr("class", "province")
        .attr("d", path)
        .on("click", clicked);

    var users = topojson.feature(total, total.objects.user);

    // 绘制用户
    g.selectAll(".user")
        .data(users.features)
        .enter().append("circle")
        .attr("class", "user")
        .attr("id", function(d) {return 'user-'+d.properties.id;})
        .attr("nickname", function(d) {return d.properties.nickname;})
        .attr("cx", function(d) { var cor = projection(d.geometry.coordinates); return cor[0]; })
        .attr("cy", function(d) { var cor = projection(d.geometry.coordinates); return cor[1]; })
        .attr("r", "5");
});

function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.selectAll(".user")
        .attr("r", ""+ 5/ scale);

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr("transform", "");

    g.selectAll(".user")
        .attr("r", "5");
}

$(document).ready(function () {

    var tips = {};
    $(".myContainer").delegate(".user", "mouseover",
        function () {
            var me = $(this);
            if(tips[me.attr("id")]) {
                console.log('hell0');
                me.tipsy("show");
            } else {
                $.ajax({
                    "url": "php/json.php?id="+me.attr("id").split('-')[1],
                    "type": "get",
                    "dataType": "json",
                    "success": function (data) {
                        console.log(data);
                        var tpl = "<a target='_blank' href='http://weibo.com/u/"+data.uid+"'><div class='info'>"
                                    +"<div class='avatar'><img src='http://tp1.sinaimg.cn/"+data.uid+"/50/1/1' /></div>"
                                    +"<div class='name'>"+data.nickname+"</div>"
                                    +"<div class='location'>"+data.location+"</div>"
                                    +"<div class='fri'>关注 "+data.friends_count+"|粉丝 "+data.followers_count+"|互粉 "+data.bi_followers_count+"</div>"
                                    + "<div class='description'>"+data.description+"</div>"
                                  +"</div></a>";

                        me.attr('original-title', tpl);
                        me.tipsy({html: true, gravity: 's', title: 'original-title', trigger: 'manual'});
                        me.tipsy("show");
                        tips[me.attr("id")] = true;
                    },
                    "error": function () {
                        alert("提取数据错误");
                    }
                });
            }
            return false;
    });

    $(".myContainer").delegate(".user", "mouseout",
        function () {
            var me = $(this);
            if(tips[me.attr("id")]) {

//                setTimeout(function () {
                    me.tipsy("hide");
//                }, 500);

                console.log('hide');
            }
            return false;
    });

    var searchUser = function (name) {
        var circles = $("circle[nickname="+name+"]");
        if(circles) {
            return circles;
        } else {
            return false;
        }
    };

    $('#searchText').focus();

    var str1 = "没有找到您搜索的用户哦～";
    $('#searchBtn').popover({content:str1,trigger:"manual",placement:"bottom"});

    var str2 = "请输入用户昵称～";
    $('#searchText').popover({content:str2,trigger:"manual",placement:"bottom"});

    $("#searchBtn").click(function(){
        var btn = $('#searchBtn');
        var text = $('#searchText');
        var nickname = text.val();

        if(nickname == "") {
            text.popover('show');
            setTimeout(function() {
                text.popover('hide');
            }, 2000);

            return false;
        }

        var users = searchUser(nickname);
        if(users.length != 0){
            users.each(function() {
                var me = $(this);
                me.trigger('mouseover');
            });
        } else {
            btn.popover('show');
            setTimeout(function() {
                btn.popover('hide');
            }, 2000);
        }

        return false;

    });

    $(".myContainer").click(function () {
        $('.user').each(function() {
            var me = $(this);
            me.trigger('mouseout');
        });

        return false;
    });

    $(window).keydown(function(event){
        switch (event.keyCode) {
            case 13:
                $('#searchBtn').click();
                break;
            default :
                break;
        }
    });
});
