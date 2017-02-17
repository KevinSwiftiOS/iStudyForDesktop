/**
 * Created by hcnucai on 2016/12/19.
 */
var LoginModel = angular.module("LoginModel", ['ngAnimate','btford.modal']);
LoginModel.controller("LoginCtrl", function ($scope, httpService,loginLoading) {
    $scope.user = {};
    //进行登录服务

    $scope.submit = function () {
        loginLoading.activate();
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
            loginLoading.deactivate();
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
            jsapi.loginSuccessful(data.authtoken,angular.toJson(info));
        }, function (err) {
            loginLoading.deactivate();
            swal("请求失败", err, "error");
        })
    }
    //打开设计界面
   $scope.openSetting = function () {
        jsapi.openSetting();
    }
    //帮助详细信息界面
    $scope.openCai = function () {
        jsapi.openWindowsDefaultBrowser("http://cai.hznu.edu.cn");
    }
})