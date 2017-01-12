/**
 * Created by hcnucai on 2017/1/11.
 */


SelfSelModel.controller("selfSelCtrl",function ($scope,httpService,hostip,cfpLoadingBar) {
  cfpLoadingBar.start();
    var ls = window.localStorage;
    var testInfo =  angular.fromJson(ls.getItem("testInfo"));
    var param = {
        testid: testInfo.testid,
        authtoken:ls.getItem("authtoken")
    }
    var promise = httpService.post("api/exerciseDrowRange",param);
    promise.then(function (data) {
      for(var i = 0; i <data.length;i++) {
          data[i].selBundle = "第1套";

      }
      $scope.items = data;
    },function (err) {
        swal("请求失败",err,"error");
    })
    //进行练习
    $scope.goToExe = function () {
        var drawsetting = [];
        //随后将第和套拿掉 再把topicid 拿进去
        for(var i = 0; i < $scope.items.length;i++) {
            var bundleid = $scope.items[i].selBundle;
            bundleid = bundleid.replace("第","");
            bundleid = bundleid.replace("套","");

            var dic = {
                topicid:$scope.items[i].topicid,
                bundleid:bundleid
            }
            drawsetting.push((dic));
        }
        console.log(drawsetting);
        //设置字符串

       ls.setItem("drawsetting" + testInfo.testid,angular.toJson(drawsetting));
        testInfo.redraw = true;
        ls.setItem("testInfo", angular.toJson((testInfo)));
        window.location.href = "Main.html";

    }
})