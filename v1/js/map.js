var width = 1000,
    height = 600;

var svg = d3.select("body").select("#map")
    .attr("width", width)
    .attr("height", height);

d3.json("assets/total30000.json", function(error, china) {
    // 获取省市信息
    var subunits = topojson.feature(china, china.objects["china-border"]);
    var users = topojson.feature(china, china.objects["user"]);
    console.log(users);

    // 定义投影
    var projection = d3.geo.mercator()
        .center([105, 38])
        .scale(750)
        .translate([width / 2, height / 2]);

    // 地理投影转换
    var path = d3.geo.path()
        .projection(projection);

    // 绘制路径
    svg.append("path")
        .datum(subunits)
        .attr("class", "province")
        .attr("d", path);

    svg.selectAll(".user")
        .data(users.features)
        .enter().append("circle")
        .attr("class", "user")
        .attr("id", function(d) { return d.properties.id;})
        .attr("cx", function(d) { var cor = projection(d.geometry.coordinates); return cor[0]; })
        .attr("cy", function(d) { var cor = projection(d.geometry.coordinates); return cor[1]; })
        .attr("r", "5");

//    svg.append("path")
//        .datum(topojson.mesh(china, china.objects["china-border"], function(a, b) { return a !== b }))
//        .attr("d", path)
//        .attr("class", "boundary");

//    svg.append("path")
//        .datum(topojson.mesh(china, china.objects["china-border"], function(a, b) { return a == b }))
//        .attr("d", path)
//        .attr("class", "boundary");
});

$(document).ready(function () {
    var tips = {};
    $(".container").delegate(".user", "mouseover", function () {
        var me = $(this);
        if(tips[me.attr("id")]) {
            tips[me.attr("id")].show();
        } else {
            $.ajax({
                "url": "json.php?id="+me.attr("id"),
                "type": "get",
                "dataType": "json",
                "success": function (data) {
                    console.log(data);
                    var myOpentip = new Opentip(me, {"className":"mytip"});
                    var tpl = "<div class='info'>"
//                                +"<div class='avatar'><img src='http://tp1.sinaimg.cn/1560442584/180/1282197847/1' /></div>"
                                +"<div class='name'>"+data.nickname+"</div>"
                                +"<div class='fri'>关注 "+data.friends_count+"|粉丝 "+data.followers_count+"|互粉 "+data.bi_followers_count+"</div>"
                                +"<div class='location'>"+data.location+"</div>"
                                + "<div class='description'>"+data.description+"</div>"
                              +"</div>";
                    myOpentip.setContent(tpl);
                    myOpentip.show();
                    tips[me.attr("id")] = myOpentip;
                },
                "error": function () {
                    alert("提取数据错误");
                }
            });
        }
    });
});
