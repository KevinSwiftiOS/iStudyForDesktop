/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.controller("MainCtrl",function ($scope,$state,httpService,QusService,base64,myModal,IsReset,AnsCopy,Timer,$interval) {
    //获取参数
    //请求数据
    var ls = window.localStorage;
    //头像的参数
    $scope.avrarurlStyle =  style="width: 80px; height: 200px"
    //初始化
    $scope.info = angular.fromJson(ls.getItem("info"));
    //是否可以阅卷 试题的名称等等
    var testInfo = angular.fromJson(ls.getItem("testInfo"));
    var redraw = false;
    redraw = testInfo.redraw;
    var testid = testInfo.testid;
    var drawsetting = "";
    drawsetting = testInfo.drawsetting;
    //倒计时的时间
     var submitSlide = null;
     var slide = null;
     var timeSlide = null;
    var timeSlides = [];
     timeSlides = angular.fromJson(ls.getItem("timeSlides"));
    if(timeSlides != null) {
        for (var i = 0; i < timeSlides.length; i++) {
            if (timeSlides[i].key == ls.getItem("username") + "timeSlide" + testid) {
                timeSlide = timeSlides[i].value;
                break;
            }
        }
    }
    if(timeSlide != null) {
     calTimeSlided();
    }
    $scope.title = testInfo.title;
    //时间剩下总共有多少 倒计时

    var unSelStyle = {
        "background-color":"while",
    }
    var selStyle ={
        "background-color":"#C5DBFD",
    }
    //已经选中的题型
    var itemsIndex = 0,qusIndex = 0;
    var param = {
        authtoken:ls.getItem("authtoken"),
        testid:testid,
        redraw:redraw,
        drawsetting:drawsetting
    };
    var promise = httpService.post( "api/testinfo",param);
    $scope.hasQus = false;
    promise.then(function (data) {
        console.log(data);
        $scope.hasQus = true;
        qusIndex = 0;
        itemsIndex = 0;
        var totalTime = 2000;
        $interval(function () {
            $scope.totalTime = totalTime--;

        },1000);
        data[0].itemIndex = 0;
        for(var i = 1; i < data.length;i++) {
            data[i].icon = "fa fa-chevron-circle-right";
            data[i].isShow = false;
            data[i].itemIndex = i;
        }
        QusService.qusItems = data;
        initIcon(itemsIndex,qusIndex);
        $scope.items = QusService.qusItems;
        goToDiffState();

    },function (err) {
        $scope.hasQus = true;
        $scope.items = [];
        QusService.qusItems = [];

        swal("请求失败",err,"error");
    })
    //监听值得变化
    $scope.$watch('items',function (newV,oldV) {
        if(newV != oldV) {
            $scope.items = newV;

        }
    },true);
    //展现题目
   $scope.showQusList = function ($index) {
       var items = QusService.qusItems;
       if(items[$index].isShow == false){
           items[$index].isShow = true;

           items[$index].icon = "fa fa-chevron-circle-down";
       }else{
           items[$index].icon = "fa fa-chevron-circle-right";
           items[$index].isShow = false;
       }
       QusService.qusItems = items;
       $scope.items = QusService.qusItems;
   }
   $scope.showQus = function (_qusIndex,_itemsIndex) {
       qusIndex = _qusIndex;
       itemsIndex = _itemsIndex;
       initIcon(itemsIndex,qusIndex);
       //根据不同的题型到不同的view去
       goToDiffState();
   }
   //上一题与下一题
    $scope.forwardQus = function () {
        if(qusIndex > 0) {
            qusIndex--;
            initIcon(itemsIndex,qusIndex);
        }else{
            if(itemsIndex > 0) {
                var items =  QusService.qusItems;
                itemsIndex--;
                var qus = items[itemsIndex].questions;
                qusIndex = qus.length - 1;
              initIcon(itemsIndex,qusIndex);
            }else
                swal("提醒","已到达第一题","warning");
        }
        goToDiffState();
    }
    $scope.nextQus = function () {
        if(qusIndex < QusService.qusItems[itemsIndex].questions.length - 1){
             qusIndex++;
            initIcon(itemsIndex,qusIndex);
         }else{
            var items = QusService.qusItems;
             if(itemsIndex < items.length - 1){
                 itemsIndex++;
                 qusIndex = 0;
                 items[itemsIndex].isShow = true;
                 items[itemsIndex].icon = "fa fa-chevron-circle-down";
                 initIcon(itemsIndex,qusIndex);

             }else
                 swal("提醒","已到达最后一题","warning");

         }
        goToDiffState();
    }
   //重置答案
    $scope.reset = function () {
        var data = {
            testid:testid,
            questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
            answer:"",
            answerfile:"",
        }
        var param = {
            authtoken:ls.getItem("authtoken"),
            data:base64.encode(angular.toJson(data)),
        }
        var promise = httpService.post("api/submitquestion",param);
        promise.then(function (res) {
            swal("恭喜您","重置成功","success");
         var reset = IsReset.reset;
            reset.isReset = !reset.isReset;
            QusService.qusItems[itemsIndex].questions[qusIndex].answer = "";

            QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle-thin";
        },function (err) {
            swal("重置失败",err,"error");
        })
    }
    //阅卷
    $scope.goOver = function () {
       //当前试卷是否可以阅卷
        if(testInfo.enableClientJudge == false) {
            swal("提醒","未开启阅卷功能","warning");
        }else {
            //题目在第几个大题的第几个小题里面
            var qusLocation = {
                qusIndex: qusIndex,
                itemIndex: itemsIndex
            }
            ls.setItem("qusLocation", angular.toJson(qusLocation));
            myModal.activate();
        }
    }
    var timePromise;
    function goToDiffState() {
        //定时器的测试
        //分数变换掉
  // $interval.cancel(timePromise);
  //       var time = Timer.times[qusIndex];
  //       $scope.time = time;
  //       timePromise = $interval(function () {
  //           time--;
  //           $scope.time = time;
  //           Timer.times[qusIndex] = time;
  //       },1000);
       $scope.score = QusService.qusItems[itemsIndex].questions[qusIndex].totalscore;
        //副本答案
        AnsCopy.ansCopy =   QusService.qusItems[itemsIndex].questions[qusIndex].answer;
        var state =   $scope.items[itemsIndex].type;
        switch (state){
            case "JUDGE":
            case "SINGLE_CHIOCE":
                $state.go("SINGLE_CHOICE",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "MULIT_CHIOCE":
                $state.go("MULIT_CHIOCE",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "FILL_BLANK":
                $state.go("FILL_BLANK",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "PROGRAM_FILL_BLANK":
                $state.go("FILL_BLANK",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "COMPLEX":
                $state.go("COMPLEX",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "PROGRAM_DESIGN":
                $state.go("PROGRAM_DESIGN",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            case "PROGRAM_CORRECT":
                $state.go("PROGRAM_DESIGN",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
            default:
                $state.go("DESIGN",{itemsIndex:itemsIndex,qusIndex:qusIndex,testid:testid});
                break;
        }
    }
   //提交作业
    $scope.submitHomeWork = function () {
        var param = {
            testid:testid,
            authtoken:ls.getItem("authtoken")
        }
       var promise = httpService.infoPost("api/submittest",param);
        promise.then(function (data) {
            var info = data.info;
            console.log(info);
            if(info.succ == true) {
                //进行清空 跳转
                ls.removeItem("testInfo");
                ls.removeItem("courseid");
                ls.removeItem("coursename");
                 if(timeSlides != null) {
                     for (var i = 0; i < timeSlides.length; i++) {
                         if (timeSlides[i].key == ls.getItem("username") + "timeSlide" + testid) {
                             timeSlides.splice(i, 1);
                             break;
                         }
                     }

                     ls.setItem("timeSlides", angular.toJson(timeSlides));
                     $interval.cancel(slide);
                     $interval.cancel(submitSlide);
                 }
                swal({
                        title: "恭喜您",
                        text: "提交成功",
                        type: "success",
                        height: 10000,
                        width: 100,
                    },
                    function () {
                      window.location.href = "CourseAndTest.html";
                        return true;
                    });
            }
        })
    }

    //初始化icon 当第几个进来 随后第几个icon变颜色
     function initIcon(itemIndex,qusIndex) {
         var items = QusService.qusItems;
         for(var i = 0; i < items.length;i++) {
             var qus = items[i].questions;
             //第一行是默认展示的 随后都是默认不展示的
             if(i == itemIndex) {
                 items[i].isShow = true;
                 items[i].icon = "fa fa-chevron-circle-down";
             }
             for(var j = 0; j < qus.length;j++) {
                 //每一行描述第几题 和是否已经完成
                 qus[j].qusDesRow = "第" + (j + 1) + "题";
                 if (qus[j].answer != null && qus[j].answer != "")
                     qus[j].icon = "fa fa-circle";
                 else
                     qus[j].icon = "fa fa-circle-thin";

                 if(i == itemIndex && j == qusIndex)
                     qus[j].style = selStyle;
                 else
                     qus[j].style = unSelStyle;
             }

             items[i].questions = qus;
         }
         QusService.qusItems = items;
     }
    //进行总时间的计算
    function calTimeSlided() {
        var slideH =  parseInt(timeSlide / 3600);
        var slideM = parseInt((timeSlide - slideH * 3600) / 60);
        var slideS = timeSlide - slideH * 3600  - slideM * 60;
        //随后进行倒计时
        slide = $interval(function () {
         //如果还有秒数的话
            if(slideS > 0) {
                slideS--;
            }else{
                if(slideM > 0) {
                    //如果还有分钟的话
                    slideM--;
                    slideS = 59;
                }else {
                    //如果还有小时的话
                    if(slideH > 0) {
                        slideH--;
                        slideM = 59;
                        slideS = 59;
                    }else{
                        slideH = 00;
                        slideM = 00;
                        slideS = 00;
                    }
                }
            }
            $scope.timeLimited = slideH + ":" + slideM + ":" + slideS;
             //进行更新值
            for(var i = 0 ; i < timeSlides.length;i++) {
                if(timeSlides[i].key == ls.getItem("username") + "timeSlide" + testid) {
                    timeSlides[i].value = slideH * 3600 + slideM * 60 + slideS;
                break;
                }
            }
            ls.setItem("timeSlides",angular.toJson(timeSlides));
        },1000);
        //向服务器每5分钟发起一次请求 当前用掉的时间
         submitSlide = $interval(function () {
            var param = {
                testid:testid,
                authtoken:ls.getItem("authtoken"),
                slided: (ls.getItem(ls.getItem("username")+ "timelimted" + testid)) * 60 -  ls.getItem(ls.getItem("username") + "timeslide" + testid),
            };
            var promise = httpService.infoPost("api/signslidetime",param);
            promise.then(function (data) {
                console.log(data);
            },function (err) {
        console.log("提交时间失败",err,"error");
            });
        },180000);
     }
})