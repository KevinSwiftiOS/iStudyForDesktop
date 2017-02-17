/**
 * Created by hcnucai on 2016/12/27.
 */
HomeWorkListModel.controller("ExerciseCtrl", function ($window,$interval, $timeout,$scope, httpService, subDate, $state,myModal,Loading) {
    var ls = window.localStorage;
    var courseInfo = angular.fromJson(ls.getItem("courseInfo"));
    var param = {
        authtoken: ls.getItem("authtoken"),
        courseid: courseInfo.courseid
    }
    //是否需要loading
    var needLoading = true;
    //选择了第几项
    var index = 0;
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
    var items = [];
    var promise = httpService.post("api/exercisequery", param);
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
           //是否已经截止
            if (endDate.valueOf() > now.valueOf()) {
                items[i].isEnd = false;
            }
            else {
                items[i].isEnd = true;
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
    //跳转到答题界面 要传4个参数 testid 是否可以阅卷 阅卷后是否可以查看标准答案 查卷时是否答案可见 都是放到localStorage中的 这样可以存储多个 随后从里面取值即可
    $scope.continueLast = function ($index) {
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
        jsapi.goTestOne(angular.toJson($scope.items[$index]));
        jsapi.setEvent_OnTestClosed("updateTestInfo");
    }
    $scope.randomSel = function ($index) {
        var testInfo = {
            testid: $scope.items[$index].id,
            title: $scope.items[$index].title,
            enableClientJudge: $scope.items[$index].enableClientJudge,
            keyVisible: $scope.items[$index].keyVisible,
            viewOneWithAnswerKey: $scope.items[$index].viewOneWithAnswerKey,
            redraw: true,
            drawsetting: ""
        }
        ls.setItem("testInfo", angular.toJson(testInfo));
        index = $index;
        jsapi.goTestOne(angular.toJson($scope.items[$index]));
        jsapi.setEvent_OnTestClosed("updateTestInfo");

    }
    $scope.selfSel = function ($index) {
        var testInfo = {
            testid: $scope.items[$index].id,
            title: $scope.items[$index].title,
            enableClientJudge: $scope.items[$index].enableClientJudge,
            keyVisible: $scope.items[$index].keyVisible,
            viewOneWithAnswerKey: $scope.items[$index].viewOneWithAnswerKey,
            redraw: true
        }
        index = $index;
        ls.setItem("testInfo", angular.toJson(testInfo));
        //在自主选题中有用
        ls.setItem("exerciseItem",angular.toJson($scope.items[$index]));
        myModal.activate();
        jsapi.setEvent_OnTestClosed("updateTestInfo");
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
            //是否已经截止
            if (endDate.valueOf() > now.valueOf()) {
                $scope.items[index].isEnd = false;
            }
            else {
                $scope.items[index].isEnd = true;
            }
        }, function (err) {
            swal("请求失败",err,"error");
        })
    }
})