/**
 * Created by Administrator on 2017/1/17 0017.
 */
HomeWorkListModel.controller('SelfSelQusCtrl', function ($scope, $timeout, myModal,httpService) {
  //关闭的按钮
  $scope.closeMe = function () {
    myModal.deactivate();
  };
  //请求数据
  var ls = window.localStorage;
  var userInfo = angular.fromJson(ls.getItem("userInfo"));
  var testInfo = angular.fromJson(ls.getItem("testInfo"));
  $scope.testTitle = testInfo.title;
  $scope.name = userInfo.name;
  var param = {
    testid: testInfo.testid,
    authtoken: ls.getItem("authtoken")
  }
  var promise = httpService.post("api/exerciseDrowRange", param);
  promise.then(function (data) {
    for (var i = 0; i < data.length; i++) {
      var range = data[i].range;
      data[i].selBundle = "第" + range[0] + "套";

    }
    $scope.items = data;
  }, function (err) {
    swal("请求失败", err, "error");
  })
  //进行练习
  $scope.goToExe = function () {
    var drawsetting = [];
    //随后将第和套拿掉 再把topicid 拿进去
    for (var i = 0; i < $scope.items.length; i++) {
      var bundleid = $scope.items[i].selBundle;
      bundleid = bundleid.replace("第", "");
      bundleid = bundleid.replace("套", "");

      var dic = {
        topicid: $scope.items[i].topicid,
        bundleid: bundleid
      }
      drawsetting.push((dic));
    }
    //设置字符串
    testInfo.redraw = true;
    testInfo.drawsetting = angular.toJson(drawsetting);
    ls.setItem("testInfo", angular.toJson((testInfo)));
    myModal.deactivate();
    window.location.href = "Main.html";

  }
})