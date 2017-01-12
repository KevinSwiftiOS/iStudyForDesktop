/**
 * Created by hcnucai on 2016/12/20.
 */
var CourseAndTestListModel = angular.module("CourseAndTestListModel",['angular-loading-bar','ngAnimate','ngSanitize']);
CourseAndTestListModel.constant("hostip","http://dodo.hznu.edu.cn/");
CourseAndTestListModel.controller("CourseAndTestListCtrl",function ($scope,cfpLoadingBar,httpService,subDate) {
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
            var now = new Date();
            //还要看是否已经交卷
            if(endDate.valueOf() > now.valueOf())
               tests[i].canEdit = true;
         else
             //看是否可以进入
              if(tests[i].timelimit*60 - tests[i].timeslided >100) {
                  tests[i].canEdit = true;
              }else {
                  tests[i].canEdit = false;
              }
            //和当前的时间进行比较
        }

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
            redraw:false
        }
        if(ls.getItem("timeslide" + $scope.tests[$index].id) == null)
        ls.setItem("timeslide" + $scope.tests[$index].id,$scope.tests[$index].timelimit * 60 - $scope.tests[$index].timeslided);

        ls.setItem("timelimted" + $scope.tests[$index].id,$scope.tests[$index].timelimit);
        ls.setItem("testInfo",angular.toJson(testInfo));
        console.log($scope.tests[$index].timelimit);
        console.log($scope.tests[$index].timeslided);

        //页面跳转
      window.location.href = "Main.html";

    }
    $scope.goToStudy = function ($index) {



        ls.setItem("courseid", $scope.courses[$index].id);
        window.location.href = "HomeWorkList.html";
    }

})