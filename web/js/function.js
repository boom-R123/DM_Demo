var Center = [39.915168, 116.403875];//北京市中心
var End;
var overViewZoom = 12;
var $map = null;
var tilesOnline = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar'});
var Lines;//出租车的线路
var i = 0;//for循环使用
var Markers = []//标记数组
var num = [];//每条移动对象点的数量
var now;//现在要画的轨迹号

var LeafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }
});
var greenIcon = new LeafIcon({iconUrl: 'img/indiv_green.png'}),
    redIcon = new LeafIcon({iconUrl: 'img/indiv_red.png'}),
    blueIcon = new LeafIcon({iconUrl: 'img/indiv_blue.png'}),
    yellowIcon = new LeafIcon({iconUrl: 'img/indiv_yellow.png'});

var MoveIcon = [greenIcon, redIcon, blueIcon,yellowIcon];

function InitMap() {
    if ($map != null) {
        overViewZoom = $map.getZoom();
        $map.remove();
        $map = null;
    }
    $map = L.map('div_map', {
        center: Center,
        zoom: overViewZoom,
        layers: tilesOnline,
        minZoom: 8,
        maxZoom: 16,
    });
    L.control.scale().addTo($map);  //比例尺
}

var Lines=[
    [[39.915168, 116.403875],[39.9, 116.4],[39.91, 116.5]],
    [[39.915168, 116.403875],[39.8, 116.3],[39.7, 116.4]],
    [[39.915168, 116.403875],[39.9, 116.3],[39.8, 116.4]]
];
var MoveMarkers=[];
function DrawMoveMarker(e) {
    MoveMarkers=[];
    Center = Lines[0][0];
    InitMap();
    for(var i=0;i<Lines.length;i++){
        var polyline = L.polyline(Lines[i], { color: 'red' }).addTo($map);
        console.log(Lines)
        var marker = L.Marker.movingMarker(Lines[i],
            3000, {autostart: false}).addTo($map);
        MoveMarkers.push(marker)
        marker.setIcon(MoveIcon[i%4]);
    }
}
function play() {
    for(var i=0;i<MoveMarkers.length;i++){
        MoveMarkers[i].start();
    }
}



function CreateTable(clusters) {
    $("#cluster_table").empty();
    $("#cluster_table").append("<tr style='height: 50px'><th class='text-center'>热点区域编号</th>" +
        "<th class='text-center'>热点区域热点指数</th>" +
        "<th class='text-center'>点击查看</th>" +
        "</tr>");
    $("#cluster_table").append("<tbody></tbody>");
    for(var i=0;i<10;i++){
        $("#cluster_table tbody").append("<tr>" +
            "<td>1</td>" +
            "<td>100</td>" +
            "<td class='look'><span class='glyphicon glyphicon-search'></span></td>" +
            "</tr>");
        $("#cluster_table tbody tr:eq("+i+") td:eq(2)").attr("id","area"+i);
    }
    $(".look").click(function () {
        var time=$("#select_time").val()//时间段
        var t=time.toString().split(" ")[1].split(":")[0];//转换成只有开始的小时
        var value=$("#input_value").val();//阈值
        alert(this.id+t+value);
    })
}