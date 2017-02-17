/**
 * Created by hcnucai on 2016/12/20.
 */
var CourseAndTestListModel = angular.module("CourseAndTestListModel", ['ngAnimate', 'ngSanitize', 'btford.modal']);
CourseAndTestListModel.controller("CourseAndTestLoadingCtrl",function ($scope) {
    $scope.des = "加载";
})
CourseAndTestListModel.controller("CourseAndTestListCtrl", function ($scope, httpService, subDate, $interval, Loading,$timeout) {
    var ls = window.localStorage;
    //总共的监控
    var totalStartInterval;
    //开始加载
    var courses = [];
    //选择了第几个考试
    var testIndex;
    var needLoading = true;
             Loading.activate();
            //Loading显示1秒
            var showLoading = $interval(function () {
                if(!needLoading) {
                    Loading.deactivate();
                    $interval.cancel(showLoading);
                }
            },1000);
    var authtoken = ls.getItem("authtoken");
    var userInfo = angular.fromJson(ls.getItem("userInfo"));
    $scope.name = userInfo.name;
    var param = {
        authtoken: authtoken
    }
    //定义课程 模态框的出现有用


    //先请求考试的数据 后请求练习的数据
    var testPromise = httpService.post("api/testquery", param);
    testPromise.then(function (data) {
        courseP();
        var tests = [];
        tests = data;
        //进行遍历 随后和当前时间进行比较看是否已经过期
        for (var i = 0; i < tests.length; i++) {
            if (i == tests.length - 1)
                tests[i].isLast = true;
            else
                tests[i].isLast = false;
            var dicStart = subDate.divedeToDay(tests[i].datestart);
            var dicEnd = subDate.divedeToDay(tests[i].dateend);

            tests[i].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day + " " + dicStart.hour + ":" + dicStart.min;
            tests[i].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day + " " + dicEnd.hour + ":" + dicEnd.min;
            var endDate = new Date(dicEnd.year, dicEnd.month - 1, dicEnd.day, dicEnd.hour, dicEnd.min, dicEnd.second);
            //开始的时间和现在比较
            var startDate = new Date(dicStart.year, dicStart.month - 1, dicStart.day, dicStart.hour, dicStart.min, dicStart.second);
            tests[i].startY = dicStart.year;
            tests[i].startM = dicStart.month;
            tests[i].startD = dicStart.day;
            tests[i].startH = dicStart.hour;
            tests[i].startMin = dicStart.min;
            tests[i].startValue = startDate.valueOf();
            tests[i].endValue = endDate.valueOf();
            //是否需要倒计时的功能
            var now = new Date();
            if (now.valueOf() > endDate.valueOf()) {
                tests[i].isEnd = true;
            } else {
                tests[i].isEnd = false;
            }

            //看考试是否已经开始
            if (now.valueOf() > startDate.valueOf()) {
                tests[i].isStart = true;
            } else {
                tests[i].isStart = false;
            }
        }
        //监视时间的变化
        $scope.tests = tests;


        //监控时间
        totalStartInterval = $interval(function () {
            showCoutDown();
        }, 1000);

    }, function (err) {
        needLoading = false;
        var tests = [];
        swal("请求失败", err, "error");

        $scope.tests = tests;
    })

    function showCoutDown() {
        var tests = $scope.tests;
        var i = 0;
        for (i = 0; i < tests.length; i++) {
            //如果需要倒计时的
            var now = new Date();
            var currentYear = now.getFullYear();
            var currentMonth = now.getMonth() + 1;
            var currentDay = now.getDate();
            var currentHour = now.getHours();
            var currentMin = now.getMinutes();
            if (currentYear == tests[i].startY && currentMonth == tests[i].startM && currentDay == tests[i].startD) {
                if (tests[i].startH == currentHour && tests[i].startMin - currentMin <= 5 && tests[i].startMin - currentMin > 0) {
                    $interval.cancel(totalStartInterval);
                    swal("提醒", tests[i].title + "快开始了", "warning");
                    $scope.courses = [];
                    break;
                }

                if (tests[i].startH - currentHour == 1 && 60 - currentMin <= 5) {
                    $interval.cancel(totalStartInterval);
                    $scope.courses = [];
                    swal("提醒", tests[i].title + "快开始了", "warning");
                    break;
                }
            }
        }
        //倒计时
        if (i < tests.length) {
            var now = new Date();
            var remainM = tests[i].startMin - now.getMinutes() - 1;
            var remainS = 60 - now.getSeconds();
            var countDownInterval = $interval(function () {
                $scope.courses = [];
                if (remainS > 0) {
                    remainS--;
                } else {
                    if (remainM > 0) {
                        remainM--;
                        remainS = 59;
                    } else {
                        remainM = 0;
                        remainS = 0;
                        //跟新test
                        $interval.cancel(countDownInterval);
                        updateTest();
                    }
                }
                var realM = remainM;
                var realS = remainS;
                if (remainM < 10)
                    realM = "0" + remainM;
                if (remainS < 10)
                    realS = "0" + remainS;
                $scope.remainM = realM;
                $scope.remainS = realS;
            }, 1000);
        }

    }

    function updateTest() {
        //再一次遍历 看看有没有到达时间的
        var tests = $scope.tests;
        for (var i = 0; i < tests.length; i++) {
            var now = new Date();
            if (now.valueOf() >= tests[i].startValue) {
                tests[i].isStart = true;
            }
        }
        $scope.tests = tests;
    }

    //随后再请求课程的数据
    function courseP() {
        var cousrePromise = httpService.post("api/coursequery", param);
        cousrePromise.then(function (data) {
            needLoading = false;
             courses = data;
            for (var i = 0; i < courses.length; i++) {
                if (i == courses.length - 1)
                    courses[i].isLast = true;
                else
                    courses[i].isLast = false;
                var rgb = courses[i].picbg;
                if (rgb != null) {
                    courses[i].style = {
                        "background-color": "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")",
                        "word-wrap": "break-word"
                    }
                }
            }
            $scope.courses = courses;
            //和当前的时间进行比较
        }, function (err) {
            needLoading = false;
            var courses = [];
            swal("请求失败", err, "error");

            $scope.courses = courses;
        })
    }
    //开始答题
    $scope.goToTest = function ($index) {
        //赋值
        var testInfo = {
            testid: $scope.tests[$index].id,
            title: $scope.tests[$index].title,
            enableClientJudge: false,
            keyVisible: false,
            viewOneWithAnswerKey: false,
            redraw: false,
            drawsetting: "",
            timelimit: $scope.tests[$index].timelimit,
            //是否是考试
            isTest: true,
            //是否自动交卷
            forcesubmit: $scope.tests[$index].forcesubmit
        }

        //剩余时间的检测
        var timeSlides = angular.fromJson(ls.getItem("timeSlides"));
        var timeSlideDic = {};
        if (timeSlides == null) {
            timeSlides = [];
            timeSlideDic = {
                key: userInfo.username + "timeSlide" + $scope.tests[$index].id,
                value: $scope.tests[$index].timelimit * 60 - $scope.tests[$index].timeslided
            }
            timeSlides.push(timeSlideDic);
            ls.setItem("timeSlides", angular.toJson(timeSlides));
        } else {
            //看看有没有值
            var timeSlide = null;
            for (var i = 0; i < timeSlides.length; i++) {
                if (timeSlides[i].key == userInfo.username + "timeSlide" + $scope.tests[$index].id) {
                    timeSlide = timeSlides[i].value;
                    break;
                }
            }
            //如果本地没有本次考试的剩余时间 就应该保存下来 本次时间
            if (timeSlide == null) {
                timeSlideDic = {
                    key: userInfo.username + "timeSlide" + $scope.tests[$index].id,
                    value: $scope.tests[$index].timelimit * 60 - $scope.tests[$index].timeslided
                }
                timeSlides.push(timeSlideDic);
            }
            ls.setItem("timeSlides", angular.toJson(timeSlides));
        }
        ls.setItem("testInfo", angular.toJson(testInfo));
        //页面跳转
        testIndex = $index;
        jsapi.goTestOne(angular.toJson($scope.tests[$index]));
        jsapi.setEvent_OnTestClosed("updateTestInfo");
    }
    window.updateTestInfo = function () {
        var param = {
            authtoken:ls.getItem("authtoken"),
            testid: $scope.tests[testIndex].id
        }
        var promise = httpService.infoPost("api/usertestinfo", param);
        promise.then(function (data) {
            //进行同步 不能进行整个的复制 只需覆盖状态 开始截止时间 和是否已经交卷 分数
            var info = data.info;
            $scope.tests[testIndex].status = info.status;
            $scope.tests[testIndex].issubmited = info.issubmited;
            $scope.tests[testIndex].myscore = info.myscore;
            $scope.tests[testIndex].datestart = info.datestart;
            $scope.tests[testIndex].dateend = info.dateend;
            var dicStart = subDate.divedeToDay($scope.tests[testIndex].datestart);
            var dicEnd = subDate.divedeToDay( $scope.tests[testIndex].dateend);

            $scope.tests[testIndex].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day + " " + dicStart.hour + ":" + dicStart.min;
            $scope.tests[testIndex].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day + " " + dicEnd.hour + ":" + dicEnd.min;
            var endDate = new Date(dicEnd.year, dicEnd.month - 1, dicEnd.day, dicEnd.hour, dicEnd.min, dicEnd.second);
            //开始的时间和现在比较
            var startDate = new Date(dicStart.year, dicStart.month - 1, dicStart.day, dicStart.hour, dicStart.min, dicStart.second);
            $scope.tests[testIndex].startY = dicStart.year;
            $scope.tests[testIndex].startM = dicStart.month;
            $scope.tests[testIndex].startD = dicStart.day;
            $scope.tests[testIndex].startH = dicStart.hour;
            $scope.tests[testIndex].startMin = dicStart.min;
            $scope.tests[testIndex].startValue = startDate.valueOf();
            $scope.tests[testIndex].endValue = endDate.valueOf();
            //是否需要倒计时的功能
            var now = new Date();
            if (now.valueOf() > endDate.valueOf()) {
                $scope.tests[testIndex].isEnd = true;
            } else {
                $scope.tests[testIndex].isEnd = false;
            }
            //看考试是否已经开始
            if (now.valueOf() > startDate.valueOf()) {
                $scope.tests[testIndex].isStart = true;
            } else {
                $scope.tests[testIndex].isStart = false;
            }
        }, function (err) {
           swal("请求失败",err,"error");
        })

    }

    $scope.goToStudy = function ($index) {
        var courseInfo = {
            courseid: $scope.courses[$index].id,
            coursename: $scope.courses[$index].title
        }
        ls.setItem("courseInfo", angular.toJson(courseInfo));
        window.location.href = "HomeWorkList.html";
    }
    //退出系统
    $scope.exit = function () {

        swal({
                title: "提醒",
                text: "您确认退出吗?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function (isConfirm) {
                if (isConfirm) {
                    ls.clear();
                    jsapi.exit();
                }
            }
        )
    };
})


