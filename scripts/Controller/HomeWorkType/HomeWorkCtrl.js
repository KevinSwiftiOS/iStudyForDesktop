HomeWorkListModel.controller("HomeWorkCtrl", function ($interval, $timeout,$scope, httpService, subDate, $state,Loading) {
    var ls = window.localStorage;
    var courserInfo = angular.fromJson(ls.getItem("courseInfo"));
    var param = {
        authtoken: ls.getItem("authtoken"),
        courseid: courserInfo.courseid
    }
    var items = [];
    var index;
    //是否需要loading
    var needLoading = true;
    var loadingTimeOut = $timeout(function () {
        if(needLoading) {
            Loading.activate();
            //Loading至少显示1.5秒
            var showLoading = $interval(function () {
                if(!needLoading) {
                    Loading.deactivate();
                    $interval.cancel(showLoading);
                }
            },1500);
        }
    },1000);
    var promise = httpService.post("api/homeworkquery", param);
    promise.then(function (data) {
        needLoading = false;
        //分割日期并进行查看
        items = data;
        for (var i = 0; i < items.length; i++) {
            var dicStart = subDate.divedeToDay(items[i].datestart);
            var dicEnd = subDate.divedeToDay(items[i].dateend);
            items[i].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day;
            items[i].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day;
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
            //判断是否是最后一题
            if(i != items.length - 1)
                items[i].isLast = false;
            else
                items[i].isLast = true;
        }
        $scope.items = items;
    }, function (err) {
       needLoading = false;

        swal("请求失败", err, "error");
        $scope.items = items;
    })
    //跳转到答题界面 要传4个参数 testid 是否可以阅卷 阅卷后是否可以查看标准答案 查卷时是否答案可见 都放到localStorage中 这样可以存储多个 随后从里面取值即可
    $scope.answer = function ($index) {
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
            index = $index;
            ls.setItem("testInfo", angular.toJson(testInfo));
            jsapi.goTestOne(angular.toJson($scope.items[$index]));
            jsapi.setEvent_OnTestClosed("updateTestInfo");
        } else {
            //调用jsapi 打开浏览器
			jsapi.openWindowsDefaultBrowser(jsapi.getDomain() + "Output/ViewOne/" + $scope.items[$index].usertestid);
        }
    }
    window.updateTestInfo = function () {
        var param = {
            authtoken:ls.getItem("authtoken"),
            testid: $scope.items[index].id
        }
        var promise = httpService.infoPost("api/usertestinfo", param);
        promise.then(function (data) {
            var info = data.info;
            //进行同步 是否可以阅卷 阅卷后答案是否可见 开始截止时间更新
            $scope.items[index].enableClientJudge = info.enableClientJudge;
            $scope.items[index].keyVisible = info.keyVisible;
            $scope.items[index].forbiddenMouseRightMenu = info.forbiddenMouseRightMenu;
            $scope.items[index].forbiddenCopy = info.forbiddenCopy;
            $scope.items[index].firstTimeDo = info.firstTimeDo;
            $scope.items[index].datestart = info.datestart;
            $scope.items[index].dateend = info.dateend;
            $scope.items[index].myscore = info.myscore;
            var dicStart = subDate.divedeToDay($scope.items[index].datestart);
            var dicEnd = subDate.divedeToDay($scope.items[index].dateend);
            $scope.items[index].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day;
            $scope.items[index].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day;
            var endDate = new Date(dicEnd.year, dicEnd.month - 1, dicEnd.day, dicEnd.hour, dicEnd.min, dicEnd.second);
            var now = new Date();
            //还要看是否已经交卷
            if (endDate.valueOf() > now.valueOf()) {
                $scope.items[index].isEnd = false;
                $scope.items[index].btnTitle = "答题";
            }
            else {
                $scope.items[index].isEnd = true;
                $scope.items[index].btnTitle = "查看";
            }
        }, function (err) {
            swal("请求失败",err,"error");
        })
    }
})