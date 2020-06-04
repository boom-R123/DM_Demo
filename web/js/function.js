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
var MoveMarkers=[];

function InitMap() {
    if ($map != null) {
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

function DrawHotPoi() {
    var time=$("#select_time").val(); //时间段
    var t=time.toString().split(" ")[1].split(":")[0];//转换成只有开始的小时
    var type=$("#select_type").val();//阈值
    var file="";
    if(type =="餐饮"){
        if(t == "06") {
            file="餐饮"+"_"+t+"-0"+(parseInt(t)+2)+"_"+"5_6";
        }
        else {
            file="餐饮"+"_"+t+"-"+(parseInt(t)+2)+"_"+"5_6";
        }
    }if(type=="休闲娱乐"){
        if(t == "06") {
            file="休闲娱乐"+"_"+t+"-0"+(parseInt(t)+2)+"_"+"15_20";
        }
        else {
            file="休闲娱乐"+"_"+t+"-"+(parseInt(t)+2)+"_"+"15_20";
        }
    }if(type =="购物"){
        if(t == "06") {
            file="购物"+"_"+t+"-0"+(parseInt(t)+2)+"_"+"5_10";
        }
        else {
            file="购物"+"_"+t+"-"+(parseInt(t)+2)+"_"+"5_10";
        }
    }if(type =="交通设施"){
        if(t == "06") {
            file="交通设施"+"_"+t+"-0"+(parseInt(t)+2)+"_"+"15_8";
        }
        else {
            file="交通设施"+"_"+t+"-"+(parseInt(t)+2)+"_"+"15_8";
        }
    }if(type=="生活服务"){
        if(t == "06") {
            file="生活服务"+"_"+t+"-0"+(parseInt(t)+2)+"_"+"5_15";
        }
        else {
            file="生活服务"+"_"+t+"-"+(parseInt(t)+2)+"_"+"5_15";
        }
    }
    var InfOut = {
        "action": "DrawArea",
        "file":file//要寻找的文件
    };
    $.ajax({
        type: "post",
        url: "S1",
        data: InfOut,
        success: function (data) {
            var infIn = JSON.parse(data);
            var Data=infIn.data;
            //console.log(infIn.data)
            Center = [Data[0].center_lat,Data[0].center_lon];
            overViewZoom=12;
            InitMap();
            var n = Data.length;//簇的个数
            console.log(n);
            var x = -1;//控制使用什么图标
            for (i = 0; i < n; i++) {
                var center=[Data[i].center_lat,Data[i].center_lon];
                var markerS = L.marker(center, {icon: RedIcon}).addTo($map);
                markerS.bindTooltip('热点区域<br>'+
                    "编号:"+ Data[i].cid+"<br>"+
                    "半径:"+ Data[i].radius.toFixed(2)+"km<br>"+
                    "簇的规模:"+ Data[i].poi_size+"<br>"+
                    "热点指数:"+ Data[i].flow+"<br>"
                    ,{direction: 'left'}).openTooltip();
                markerS.trajectory=Data[i].trajectory;
                markerS.center=center;
                markerS.r=Data[i].radius*1000 + 10;
                markerS.id=Data[i].cid;
                markerS.on("click", function () {//给中心点绑定函数，用于显示轨迹
                    $("#btm_play").show();
                    DrawMoveMarker(this.trajectory,this.center,this.r,this.id);
                });
                var circle = L.circle(center, {
                    color: 'green', //描边色
                    fillColor: '#f03',  //填充色
                    fillOpacity: 0.5, //透明度
                    radius: Data[i].radius*1000 + 10 //半径，单位米
                }).addTo($map);
            }
            CreateTable(Data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status);
        },
    });
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

function CreateTable(e) {
    //console.log(e);
    $("#cluster_table").empty();
    $("#cluster_table").append("<tr style='height: 50px'><th class='text-center'>编号</th>" +
        "<th class='text-center'>簇的规模</th>" +
        "<th class='text-center'>簇的半径(km)</th>" +
        "<th class='text-center'>热点区域热点指数</th>" +
        "<th class='text-center'>出租车数量</th>" +
        "<th class='text-center'>点击查看</th>" +
        "</tr>");
    $("#cluster_table").append("<tbody></tbody>");
    for(var i=0;i<e.length;i++){
        $("#cluster_table tbody").append("<tr>" +
            "<td>"+e[i].cid+"</td>" +
            "<td>"+e[i].poi_size+"</td>" +
            "<td>"+e[i].radius.toFixed(2)+"</td>" +
            "<td>"+e[i].flow+"</td>" +
            "<td>"+e[i].car_size+"</td>" +
            "<td class='look'><span class='glyphicon glyphicon-search'></span></td>" +
            "</tr>");
        $("#cluster_table tbody tr:eq("+i+") td:eq(5)")[0].trajectory=e[i].trajectory;//不能用attr
        $("#cluster_table tbody tr:eq("+i+") td:eq(5)")[0].center=[e[i].center_lat,e[i].center_lon];
        $("#cluster_table tbody tr:eq("+i+") td:eq(5)")[0].r=e[i].radius*1000 + 10;
        $("#cluster_table tbody tr:eq("+i+") td:eq(5)")[0].id=e[i].cid;
    }

    $(".look").click(function() {
        $("#btm_play").show();
        DrawMoveMarker(this.trajectory,this.center,this.r,this.id);
    })
}

function DrawMoveMarker(e,center,r,id) {
    MoveMarkers=[];
    console.log(e);
    Center = center;
    overViewZoom=14;
    InitMap();
    var circle = L.circle(center, {
        color: 'green', //描边色
        fillColor: '#f03',  //填充色
        fillOpacity: 0.5, //透明度
        radius: r //半径，单位米
    }).addTo($map);
    circle.bindTooltip("编号:"+id,{direction: 'left'}).openTooltip();
    for(var i=0;i<e.length;i++){
        var polyline = L.polyline(e[i].points, { color: 'red'}).addTo($map);
        $(".leaflet-interactive[stroke='red']").attr("stroke-width","2");
        //console.log(e[0].points)
        var marker = L.Marker.movingMarker(e[i].points,
            5000, {autostart: false}).addTo($map);
        MoveMarkers.push(marker)
        marker.setIcon(MoveIcon[i%4]);
    }
}

function play() {
    for(var i=0;i<MoveMarkers.length;i++){
        MoveMarkers[i].start();
    }
}