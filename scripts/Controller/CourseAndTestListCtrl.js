/**
 * Created by hcnucai on 2016/12/20.
 */
var CourseAndTestListModel = angular.module("CourseAndTestListModel", ['angular-loading-bar', 'ngAnimate', 'ngSanitize']);
CourseAndTestListModel.constant("hostip", "http://dodo.hznu.edu.cn/");
CourseAndTestListModel.controller("CourseAndTestListCtrl", function ($scope, cfpLoadingBar, httpService, subDate, $interval) {
    var ls = window.localStorage;
    //总共的监控
    var totalStartInterval;
    cfpLoadingBar.start();
    var authtoken = ls.getItem("authtoken");
    var userInfo = angular.fromJson(ls.getItem("userInfo"));
    $scope.name = userInfo.name;
    var param = {
        authtoken: authtoken
    }
    //先请求考试的数据 后请求练习的数据
    var testPromise = httpService.post("api/testquery", param);
    testPromise.then(function (data) {
        cfpLoadingBar.complete();
        var tests = [];
        tests = data;
        //进行遍历 随后和当前时间进行比较看是否已经过期
        for (var i = 0; i < tests.length; i++) {
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
            //是否需要倒计时的功能
            var now = new Date();
            //看考试是否已经开始
            if (now.valueOf() > startDate.valueOf()) {
                tests[i].isStart = true;
            } else {
                tests[i].isStart = false;
            }
            if (tests[i].isEnd == true) {
                //本次还未截止
                //看本次时间
                //剩余时间还有多少
                var timeSlides = angular.fromJson(ls.getItem("timeSlides"));
                if (timeSlides == null) {
                    //根据服务器返回的剩余时间和总共时间的多少进行判断
                    if ($scope.tests[i].timelimit * 60 - $scope.tests[i].timeslided > 100)
                        tests[i].isEnd = false;
                } else {
                    //看看截止时间
                    var timeSlide = null;
                    for (var i = 0; i < timeSlides.length; i++) {
                        if (timeSlides[i].key == userInfo.username + "timeSlide" + tests[i].id) {
                            timeSlide = timeSlides[i].value;
                            break;
                        }
                    }
                    //判断
                    if (timeSlide == null) {
                        //根据服务器返回的剩余时间和总共时间的多少进行判断
                        if ($scope.tests[i].timelimit * 60 - $scope.tests[i].timeslided > 100)
                            tests[i].isEnd = false;
                    } else {
                        if (timeSlide > 100)
                            tests[i].isEnd = false;
                    }
                }
            }

        }
        //监视时间的变化
        $scope.tests = tests;
        //监控时间
        totalStartInterval = $interval(function () {
            showCoutDown();
        }, 1000);

    }, function (err) {
        var tests = [];
        swal("请求失败", err, "error");
        cfpLoadingBar.complete();
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
                    break;
                }
            }
            if (tests[i].startH - currentHour == 1 && 60 - currentMin <= 5) {
                $interval.cancel(totalStartInterval);
                swal("提醒", tests[i].title + "快开始了", "warning");
                break;
            }
        }
        //倒计时
        if (i < tests.length) {
            var now = new Date();
            var remainM = tests[i].startMin - now.getMinutes() - 1;
            var remainS = 60 - now.getSeconds();
            var countDownInterval = $interval(function () {
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
                $scope.remainM = remainM;
                $scope.remainS = remainS;
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
    var cousrePromise = httpService.post("api/coursequery", param);
    cousrePromise.then(function (data) {
        cfpLoadingBar.complete();
        var courses = data;
        for (var i = 0; i < courses.length; i++) {
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
        var courses = [];
        swal("请求失败", err, "error");
        cfpLoadingBar.complete();
        $scope.courses = courses;
    })

    //开始答题
    $scope.goToTest = function ($index) {
        //赋值
        var testInfo = {
            testid: $scope.tests[$index].id,
            title: $scope.tests[$index].title,
            enableClientJudge: true,
            keyVisible: false,
            viewOneWithAnswerKey: false,
            redraw: false,
            drawsetting: "",
            timelimit: $scope.tests[$index].timelimit,
            //是否是考试
            isTest: true
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
            //如果本地没有本村该次考试的剩余时间 就应该保存下来 本次时间
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
        window.location.href = "Main.html";
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
        ls.clear();
        window.location.href = "Login.html";
    }
})


