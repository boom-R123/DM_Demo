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
var leafIcon = L.Icon.extend({
    options: {
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [15, 30], // size of the icon
        shadowSize: [15, 30], // size of the shadow
        iconAnchor: [7.5, 30], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    }
});
var greenIcon = new LeafIcon({iconUrl: 'img/indiv_green.png'}),
    redIcon = new LeafIcon({iconUrl: 'img/indiv_red.png'}),
    blueIcon = new LeafIcon({iconUrl: 'img/indiv_blue.png'}),
    yellowIcon = new LeafIcon({iconUrl: 'img/indiv_yellow.png'});
var MoveIcon = [greenIcon, redIcon, blueIcon,yellowIcon];
var GreenIcon = new leafIcon({iconUrl: 'img/marker-icon-green.png'}),
    RedIcon = new leafIcon({iconUrl: 'img/marker-icon-red.png'}),
    BlueIcon = new leafIcon({iconUrl: 'img/marker-icon-blue.png'}),
    GoldIcon = new leafIcon({iconUrl: 'img/marker-icon-gold.png'}),
    OrangeIcon = new leafIcon({iconUrl: 'img/marker-icon-orange.png'}),
    VioletIcon = new leafIcon({iconUrl: 'img/marker-icon-violet.png'}),
    BlackIcon = new leafIcon({iconUrl: 'img/marker-icon-black.png'}),
    GreyIcon = new leafIcon({iconUrl: 'img/marker-icon-grey.png'}),
    YellowIcon = new leafIcon({iconUrl: 'img/marker-icon-yellow.png'});
var Icon = [GreenIcon, RedIcon, BlueIcon, GoldIcon, OrangeIcon, VioletIcon, BlackIcon, GreyIcon, YellowIcon];
var Lines=[
    [[39.915168, 116.403875],[39.9, 116.4],[39.91, 116.5]],
    [[39.915168, 116.403875],[39.8, 116.3],[39.7, 116.4]],
    [[39.915168, 116.403875],[39.9, 116.3],[39.8, 116.4]]
];
var MoveMarkers=[];


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

function rad(d) {
    return d * Math.PI / 180.0;
}

function getDistance(e1, e2){//由经纬度转换成距离（米）
    var MLonA = e1[1];
    var MLatA = e1[0];
    var MLonB = e2[1];
    var MLatB = e2[0];
    var R = 6371004;
    var C = Math.sin(rad(e1[0])) * Math.sin(rad(e2[0])) + Math.cos(rad(e1[0])) * Math.cos(rad(e2[0])) * Math.cos(rad(MLonA - MLonB));
    return (R * Math.acos(C));
}

function DrawPoiArea() {
    var time=$("#select_time").val()//时间段
    var t=time.toString().split(" ")[1].split(":")[0];//转换成只有开始的小时
    var type=$("#select_type").val();//阈值
    var file="";
    if(type=="餐饮"){
        file="restaurant";
    }
    var InfOut = {
        "action": "DrawArea",
        "file":file,//要寻找的文件
    };
    $.ajax({
        type: "post",
        url: "S1",
        data: InfOut,
        success: function (data) {
            var infIn = JSON.parse(data);
            console.log(infIn)
            Start=infIn.clusters[0].Clusters[0];
            InitMap();
            var Center=[0,0];//地图显示的中心点
            var n = infIn.clusters.length;//簇的个数
            console.log(n);
            var x=-1;//控制使用什么图标
            for (i = 0; i < n; i++) {
                x++;
                var center = [0, 0];//中心点的坐标
                for (j = 0; j < infIn.clusters[i].Clusters.length; j++) {
                    var point = infIn.clusters[i].Clusters[j];
                    center[0] = center[0] + point[0];
                    center[1] = center[1] + point[1];
                    //var markerS = L.marker(point,{icon: Icon[x%9]}).addTo($map);//给地图添加各个点
                }
                console.log(x);
                center[0] = center[0] / infIn.clusters[i].Clusters.length;
                center[1] = center[1] / infIn.clusters[i].Clusters.length;
                Center[0] = Center[0] + center[0];
                Center[1] = Center[1] + center[1];

                const markerS = L.marker(center,{icon: BlueIcon}).addTo($map);
                markerS.bindTooltip('这是簇的中心点', {direction: 'left'}).openTooltip();

                markerS.on("click",function () {//给中心点绑定函数，用于显示轨迹
                    $("#btm_play").show();
                    DrawMoveMarker();
                });


                var dis=0;
                for (j = 0; j < infIn.clusters[i].Clusters.length; j++) {
                    var point = infIn.clusters[i].Clusters[j];
                    var temp=getDistance(center,point);
                    if(dis<temp){
                        dis=temp;
                    }
                }
                var circle = L.circle(center, {
                    color: 'green', //描边色
                    fillColor: '#f03',  //填充色
                    fillOpacity: 0.5, //透明度
                    radius: dis+10 //半径，单位米
                }).addTo($map);
                //circle.bindPopup('行政地标形成的簇,规模:'+infIn.clusters[i].size).openPopup();
            }
            Center[0] = Center[0] / infIn.clusters.length;
            Center[1] = Center[1] / infIn.clusters.length;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status);
        },
    });
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
        var type=$("#select_type").val();//阈值
        $("#btm_play").show();
        DrawMoveMarker();
        alert(this.id+t+type);
    })
}

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