
function btmBindMain() {  //给按钮绑定函数
    $("#btm_ShowTrack").click(btm_ShowTrack);
    $("#btm_ReDrawMap").click(btm_ReDrawMap);
    $("#btm_play").click(btm_play);
    $("#btm_play").attr("IsMove",0);//设置一个属性用于判定是否在运行动画,0表示没有，1表示有
}

function btm_ShowTrack(){
    $("#btm_play").hide();
    DrawPoiArea();
    CreateTable();
}

function btm_ReDrawMap() {
    $("#btm_play").hide();
    $("#cluster_table").empty();
    InitMap();
}

function btm_play() {
    play();
    if($("#btm_play").attr("IsMove")==0){
        $("#btm_play").attr("IsMove",1);
        $("#btm_play").toggleClass("btn-default");//切换class
        $("#btm_play").toggleClass("btn-primary");//切换class
        setTimeout("$('#btm_play').toggleClass('btn-primary');" +
            "$('#btm_play').toggleClass('btn-default');" +
            "$('#btm_play').attr('IsMove',0)",3000)
    }
}
