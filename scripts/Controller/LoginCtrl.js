/**
 * Created by hcnucai on 2016/12/19.
 */
var loginModel = angular.module("LoginModel", ['ngAnimate']);
//设置成全局变量 用jsapi来提供域名服务
loginModel.constant("hostip", "http://dodo.hznu.edu.cn/");
loginModel.controller("LoginCtrl", function ($scope, httpService, hostip) {
    $scope.user = {};
    //进行登录服务
    $scope.submit = function () {
        var user = $scope.user;
        //进行登录
        var param = {
            username: user.username,
            password: user.password,
            devicetoken: "",
            number: "",
            os: "",
            clienttype: 1
        };
        var promise = httpService.infoPost("api/login", param);
        promise.then(function (data) {
            var ls = window.localStorage;
            ls.setItem("authtoken", data.authtoken);
            var info = data["info"];
            if (info.avtarurl == null) {
                //头像的设置
                info.avtarurl = "../images/head.png";

            }
            info.username = user.username;
            ls.setItem("userInfo", angular.toJson(info));
            //页面跳转
            window.location.href = "CourseAndTest.html";
        }, function (err) {
            swal("请求失败", err, "error");
        })
    }
})