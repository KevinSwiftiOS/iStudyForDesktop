/**
 * Created by hcnucai on 2016/12/20.
 */
var CourseAndTestListModel = angular.module("CourseAndTestListModel",['angular-loading-bar','ngAnimate','ngSanitize']);
CourseAndTestListModel.constant("hostip","http://dodo.hznu.edu.cn/");
CourseAndTestListModel.controller("CourseAndTestListCtrl",function ($scope,cfpLoadingBar,httpService,subDate,$interval) {
    var ls = window.localStorage;
    cfpLoadingBar.start();
    var authtoken = ls.getItem("authtoken");
    var param = {
        authtoken:authtoken
    }
    //先请求考试的数据 后请求练习的数据
    var testPromise = httpService.post("api/testquery",param);
    testPromise.then(function (data) {
        var  tests = [];
        tests = data;
        //进行遍历 随后和当前时间进行比较看是否已经过期
        for(var i = 0; i < tests.length;i++){
            var dicStart = subDate.divedeToDay(tests[i].datestart);
            var dicEnd = subDate.divedeToDay(tests[i].dateend);

            tests[i].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day + " " + dicStart.hour + ":" + dicStart.min;
            tests[i].dateend =   dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day + " " + dicEnd.hour + ":" + dicEnd.min;
            var endDate = new Date(dicEnd.year,dicEnd.month - 1,dicEnd.day,dicEnd.hour,dicEnd.min,dicEnd.second);
            //开始的时间和现在比较
            var startDate = new Date(dicStart.year,dicStart.month - 1,dicStart.day,dicStart.hour,dicStart.min,dicStart.second);
            tests[i].startY = dicStart.year;
            tests[i].startM = dicStart.month;
            tests[i].startD = dicStart.day;
            tests[i].startH = dicStart.hour;
            tests[i].startMin = dicStart.min;
            var now = new Date();
            //还要看是否已经交卷
            if(now.valueOf() > startDate.valueOf()) {
                   tests[i].isStart = true;
            }else{
                tests[i].isStart = false;
            }
            if(tests[i].isEnd == true) {
                //本次还未截止
                 //看本次时间
                //剩余时间还有多少数组
                var timeSlides = angular.fromJson(ls.getItem("timeSlides"));
                if(timeSlides == null) {
                    //根据服务器返回的剩余时间和总共时间的多少进行判断
                    if($scope.tests[i].timelimit * 60 - $scope.tests[i].timeslided > 100)
                        tests[i].isEnd = false;
                }else{
                    //看看截止时间
                    var timeSlide = null;
                    for(var i = 0; i < timeSlides.length;i++) {
                        if(timeSlides[i].key == ls.getItem("username") + "timeSlide" + tests[i].id) {
                            timeSlide = timeSlides[i].value;
                        break;
                        }
                    }
                    //判断
                    if(timeSlide == null) {
                        //根据服务器返回的剩余时间和总共时间的多少进行判断
                        if($scope.tests[i].timelimit * 60 - $scope.tests[i].timeslided > 100)
                            tests[i].isEnd = false;
                    }else{
                        if(timeSlide > 100)
                            tests[i].isEnd = false;
                    }
                }
            }

        }
     //监视时间的变化



        $scope.tests = tests;






  //随后再请求课程的数据
        var cousrePromise = httpService.post(  "api/coursequery",param);
        cousrePromise.then(function (data) {
            cfpLoadingBar.complete();
            var courses = data;

            for (var i = 0; i < courses.length; i++) {
                var rgb = courses[i].picbg;
                courses[i].style = {
                    "background-color": "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")",
                    "word-wrap": "break-word"
                }
            }
            $scope.courses = courses;
                //和当前的时间进行比较
            },function (err) {
            var courses = [];
            swal("请求失败",err,"error");
            cfpLoadingBar.complete();
            $scope.courses = courses;
        })

    },function (err) {
        var tests = [];
        swal("请求失败",err,"error");
        cfpLoadingBar.complete();
        $scope.tests = tests;
    })
    //开始答题
    $scope.goToTest = function ($index) {
        //赋值
        var testInfo = {
            testid:$scope.tests[$index].id,
            title:$scope.tests[$index].title,
            enableClientJudge:true,
            keyVisible:false,
            viewOneWithAnswerKey:false,
            redraw:false,
           drawsetting:""
        }
        //剩余时间还有多少数组
        var timeSlides = angular.fromJson(ls.getItem("timeSlides"));
        var timeSlideDic = {};
        if(timeSlides == null) {
            timeSlides = [];
            timeSlideDic = {
                key: ls.getItem("username") + "timeSlide" + $scope.tests[$index].id,
                value: $scope.tests[$index].timelimit * 60 - $scope.tests[$index].timeslided
            }
            timeSlides.push(timeSlideDic);
            ls.setItem("timeSlides",angular.toJson(timeSlides));
        }else{
            //看看看有没有值
            var timeSlide = null;
          for(var i = 0; i < timeSlides.length;i++) {
              if (timeSlides[i].key == ls.getItem("username") + "timeSlide" + $scope.tests[$index].id) {
                  timeSlide = timeSlides[i].value;
                  break;
              }
          }
            if(timeSlide == null) {
                timeSlideDic = {
                    key: ls.getItem("username") + "timeSlide" + $scope.tests[$index].id,
                    value: $scope.tests[$index].timelimit * 60 - $scope.tests[$index].timeslided
                }
                timeSlides.push(timeSlideDic);
            }
            ls.setItem("timeSlides",angular.toJson(timeSlides));
        }
        ls.setItem("testInfo",angular.toJson(testInfo));
        //页面跳转
     window.location.href = "Main.html";

    }
    $scope.goToStudy = function ($index) {
        ls.setItem("courseid", $scope.courses[$index].id);
        ls.setItem("coursename",$scope.courses[$index].title);
        window.location.href = "HomeWorkList.html";
    }
    var isSwal = false;
   var totalInterval =  $interval(function () {
        var tests = $scope.tests;
        //监视考试
        for(var i = 0; i < $scope.tests.length;i++) {
            var year =   tests[i].startY;
            var month =   tests[i].startM;
            var day =  tests[i].startD;
            var hour =  tests[i].startH;
            var min =  tests[i].startMin;
            var now  = new Date();
            var currentYear = now.getFullYear();
            var currentMonth = now.getMonth() + 1;
            var currentDay = now.getDate();
            var currentHour = now.getHours();
            var currentMin = now.getMinutes();
            var needCountDown = false;
            //判断是否需要倒计时
            if(currentYear == year && currentMonth == month && currentDay == day) {
                   if(hour == currentHour && min - currentMin < 5 && min - currentMin > 0)
                       needCountDown = true;
                if(hour - currentHour == 1 && 60 - currentMin < 5)
                    needCountDown = true;
            }
            if(needCountDown) {
                if(!isSwal) {
                    swal("提醒", tests[i].title + "快开始了", "warning");
                    isSwal = true;
                }
                //设置一个定时器
                var remainM = min - currentMin - 1;
                var remainS = now.getSeconds();
                var startInterval = $interval(function () {
                    $interval.cancel(totalInterval);
                    if(remainS > 0)
                        remainS--;
                    else {
                        if(remainM > 0) {
                            remainM--;
                            remainS = 59;
                        }else{
                            remainM = 0;
                            remainS = 0;
                            $interval.cancel(startInterval);

                            isSwal = false;
                        }
                    }
                    $scope.remainS = remainS;
                    $scope.remainM = remainM;
                },1000);
            }
        if(isSwal == false && needCountDown) {
            tests[i].isStart = true;
        }
        }
    },1000);










})