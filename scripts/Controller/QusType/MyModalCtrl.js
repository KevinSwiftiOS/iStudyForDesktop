/**
 * Created by hcnucai on 2016/12/23.
 */
MainModel.controller('MyModalCtrl', function ($scope, $timeout, myModal, base64, httpService, QusService) {
    //重置的时候应该先保存
    //进行阅卷时首先要进行保存
    var ls = window.localStorage;
    var testinfo = angular.fromJson(ls.getItem("testInfo"));
    var qusLocation = angular.fromJson(ls.getItem("qusLocation"));
    $scope.isGoOver = true;
    //不应该在这里判断是否已经阅卷
    //逻辑进行判断
    var param = {
        authtoken: ls.getItem("authtoken"),
        testid: testinfo.testid,
        questionid: QusService.qusItems[qusLocation.itemIndex].questions[qusLocation.qusIndex].id
    };
    var promise = httpService.infoPost("api/judgequestion", param);
    promise.then(function (data) {
        $scope.isSuss = data.message;
        $scope.isGoOver = false;
        var info = data.info;
        $scope.currentQus = info.questioninfo;

        if (testinfo.keyVisible == false) {
            var points = info.points;
            for (var i = 0; i < points.length; i++)
                points[i].key = "标准答案未开放";
            info.points = points;
        }
        var points = info.points;
        for (var i = 0; i < points.length; i++) {
             if(i == 0 )
                 points[i].isFirst = true;
            else
                points[i].isFirst = false;
            if (points[i].right)
                points[i].color = "green";
            else
                points[i].color = "red";

        }
        info.points = points;

        $scope.points = info.points;
        $scope.knowledge = QusService.qusItems[qusLocation.itemIndex].questions[qusLocation.qusIndex].knowledge;

    }, function (err) {
        $scope.isGoOver = false;
        myModal.deactivate();
        swal("提醒", err, "error");
    })
    $scope.closeMe = function () {
        myModal.deactivate();
    };

});