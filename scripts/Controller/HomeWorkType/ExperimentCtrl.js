HomeWorkListModel.controller("ExperimentCtrl", function (hostip, $scope, httpService, subDate, $state, cfpLoadingBar) {
    var ls = window.localStorage;
    var courseInfo = angular.fromJson(ls.getItem("courseInfo"));
    var param = {
        authtoken: ls.getItem("authtoken"),
        courseid: courseInfo.courseid
    }
    var items = [];
    cfpLoadingBar.start();
    var promise = httpService.post("api/exprementquery", param);
    promise.then(function (data) {
        cfpLoadingBar.complete();
        //分割日期并进行查看
        items = data;
        for (var i = 0; i < items.length; i++) {
            var dicStart = subDate.divedeToDay(items[i].datestart);
            var dicEnd = subDate.divedeToDay(items[i].dateend);
            items[i].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day + " " + dicStart.hour + ":" + dicStart.min;
            items[i].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day + " " + dicStart.hour + ":" + dicStart.min;
            var endDate = new Date(dicEnd.year, dicEnd.month - 1, dicEnd.day, dicEnd.hour, dicEnd.min, dicEnd.second);
            var now = new Date();
            //还要看是否已经交卷
            if (endDate.valueOf() > now.valueOf()) {
                items[i].isEnd = false;
                items[i].btnTitle = "答题";
            }
            else {
                items[i].isEnd = true;
                items[i].btnTitle = "查看";
            }
        }
        $scope.items = items;
    }, function (err) {
        cfpLoadingBar.complete();
        swal("请求失败", err, "error");
        $scope.items = items;
    })
    //跳转到答题界面 要传4个参数 testid 是否可以阅卷 阅卷后是否可以查看标准答案 查卷时是否答案可见 都放在localStorage中 这样可以存储多个 随后从里面取值即可
    $scope.answer = function ($index) {
        //看是查看还是答题
        if ($scope.items[$index].btnTitle == "答题") {
            var testInfo = {
                testid: $scope.items[$index].id,
                title: $scope.items[$index].title,
                enableClientJudge: $scope.items[$index].enableClientJudge,
                keyVisible: $scope.items[$index].keyVisible,
                viewOneWithAnswerKey: $scope.items[$index].viewOneWithAnswerKey,
                redraw: false,
                drawsetting: ""
            }
            ls.setItem("testInfo", angular.toJson(testInfo));
            window.location.href = "Main.html";
        } else {
            //调用jsapi 打开浏览器
            window.open(hostip + "Output/ViewOne/" + $scope.items[$index].usertestid);
        }
    }


})