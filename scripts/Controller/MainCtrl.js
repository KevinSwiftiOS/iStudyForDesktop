/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.controller("LoadingCtrl",function ($scope,Loading,IsReset) {

    //首次加载题目
    $scope.des = "加载";

});
MainModel.controller("ResetLoadingCtrl",function ($scope,Loading,IsReset) {

    //重置office题目
    $scope.des = "重置";

});

MainModel.controller("MainCtrl", function (ResetLoading, $timeout,Loading, $window, $scope, $state, httpService, QusService, base64, myModal, IsReset, AnsCopy, $interval) {
    //获取参数
    //请求数据
    //已经选中的题型
    var itemsIndex = 0, qusIndex = 0;
    var ls = window.localStorage;
    //初始化
    var userInfo = angular.fromJson(ls.getItem("userInfo"));
    $scope.info = userInfo;
    //是否可以阅卷 试题的名称等等
    var testInfo = angular.fromJson(ls.getItem("testInfo"));
    var redraw = false;
    //是否重置抽题策略和重置的话 抽题策略怎么设计
    redraw = testInfo.redraw;
    var testid = testInfo.testid;
    var drawsetting = "";
    drawsetting = testInfo.drawsetting;
    //倒计时的时间
    var slideInterval = null;
    var timeSlide = null;
    //从本地提取timeSlide
    var timeSlides = [];
    //是否需要loading
    var needLoading = true;
    Loading.activate();

            //Loading显示1秒
            var showLoading = $interval(function () {

                if(!needLoading) {
                    Loading.deactivate();
                    $interval.cancel(showLoading);
                }
            },1000);
    //是否可以阅卷的按钮隐藏
    $scope.enableClientJudge = testInfo.enableClientJudge;
    timeSlides = angular.fromJson(ls.getItem("timeSlides"));
    if (timeSlides != null) {
        for (var i = 0; i < timeSlides.length; i++) {
            if (timeSlides[i].key == userInfo.username + "timeSlide" + testid) {
                timeSlide = timeSlides[i].value;
                break;
            }
        }
    }
    if (timeSlide != null) {
        calTimeSlided();
    }
    $scope.title = testInfo.title;
    //时间剩下总共有多少 倒计时
    //如果是考试的话 要显示准考证号
    if (testInfo.isTest) {
        $scope.username = "准考证号:" + userInfo.username;
        $scope.isTest = testInfo.isTest;
    }
    //左边的提醒点中和未点中是的样式
    var unSelStyle = {
        "background-color": "while",
    }
    var selStyle = {
        "background-color": "#C5DBFD",
    }
    var param = {
        authtoken: ls.getItem("authtoken"),
        testid: testid,
        redraw: redraw,
        drawsetting: drawsetting
    };
    var promise = httpService.infoPost("api/testinfo", param);

    promise.then(function (res) {
         needLoading = false;
        //禁止右键
        if (res.info.forbiddenMouseRightMenu) {
            $(document).bind("contextmenu", function (e) {
                return false;
            });

        }
        //禁止复制
        if (res.info.forbiddenCopy) {
            document.body.onselectstart = document.body.ondrag = function () {
                return false;
            }
            //监听ctrl c
            $(document).keydown(function () {
                return key(arguments[0]);
            })

        }

        qusIndex = 0;
        itemsIndex = 0;
        var data = res.items;
        if (data.length > 0)
            data[0].itemIndex = 0;
        for (var i = 1; i < data.length; i++) {
            data[i].icon = "fa fa-chevron-circle-right";
            data[i].isShow = false;
            data[i].itemIndex = i;
        }
        QusService.qusItems = data;
        initIcon(itemsIndex, qusIndex);

        $scope.items = QusService.qusItems;
        if(QusService.qusItems.length > 0)
        goToDiffState();
        else
            swal("无题目信息","请退出再次尝试进入本次做题","warning");

    }, function (err) {
        needLoading = false;

        $scope.items = [];
        QusService.qusItems = [];

        swal("请求失败", err, "error");
    })
    //keyDown事件
    function key(e) {
        var keynum = (e.keyCode) ||(e.which) || (e.charCode);
        var d = e.srcElement || e.target;

        //有疑问 文本框中的内容不可复制?
        if(d.tagName.toUpperCase() != 'INPUT' && d.tagName.toUpperCase() != 'TEXTAREA'){
            if(e.ctrlKey && keynum == 67){
              swal("提醒","禁止复制内容","warning");
            return false;
            }
        }

    }
    //监听值得变化
    $scope.$watch('items', function (newV, oldV) {
        if (newV != oldV) {
            $scope.items = newV;

        }
    }, true);
    //展现一种题型下的所有题目
    $scope.showQusList = function ($index) {
        var items = QusService.qusItems;
        if (items[$index].isShow == false) {
            items[$index].isShow = true;

            items[$index].icon = "fa fa-chevron-circle-down";
        } else {
            items[$index].icon = "fa fa-chevron-circle-right";
            items[$index].isShow = false;
        }
        QusService.qusItems = items;
        $scope.items = QusService.qusItems;
    }
    //展现一道题目
    $scope.showQus = function (_qusIndex, _itemsIndex) {
        qusIndex = _qusIndex;
        itemsIndex = _itemsIndex;
        initIcon(itemsIndex, qusIndex);
        //根据不同的题型到不同的view去
        goToDiffState();
    }
    //上一题与下一题
    $scope.forwardQus = function () {
        if (qusIndex > 0) {
            qusIndex--;
            initIcon(itemsIndex, qusIndex);
        } else {
            if (itemsIndex > 0) {
                var items = QusService.qusItems;
                itemsIndex--;
                var qus = items[itemsIndex].questions;
                qusIndex = qus.length - 1;
                initIcon(itemsIndex, qusIndex);
            } else
                swal("提醒", "已到达第一题", "warning");
        }
        goToDiffState();
    }
    $scope.nextQus = function () {
        if (qusIndex < QusService.qusItems[itemsIndex].questions.length - 1) {
            qusIndex++;
            initIcon(itemsIndex, qusIndex);
        } else {
            var items = QusService.qusItems;
            if (itemsIndex < items.length - 1) {
                itemsIndex++;
                qusIndex = 0;
                items[itemsIndex].isShow = true;
                items[itemsIndex].icon = "fa fa-chevron-circle-down";
                initIcon(itemsIndex, qusIndex);

            } else
                swal("提醒", "已到达最后一题", "warning");

        }
        goToDiffState();
    }
    //重置答案
    $scope.reset = function () {
        swal({
                title: "提醒",
                text: "重置后题目将回到初始状态，确定重置吗？",
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
                    //设计题的重置有不一样的重置方法 需调用jsapi
                    var type = QusService.qusItems[itemsIndex].type;
                    if (type == "OPENEXAM_OFC" || type == "OPENEXAM_INT" || type == "OPENEXAM_WIN") {
                        var reset = IsReset.reset;
                        reset.isReset = !reset.isReset;
                        ResetLoading.activate();

                        jsapi.resetQuestion(QusService.qusItems[itemsIndex].questions[qusIndex].id, 'resetOfficeQus');
                    }
                    else {
                        var data = {
                            testid: testid,
                            questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
                            answer: "",
                            answerfile: "",
                        }
                        var param = {
                            authtoken: ls.getItem("authtoken"),
                            data: base64.encode(angular.toJson(data)),
                        }
                        var promise = httpService.post("api/submitquestion", param);
                        promise.then(function (res) {
                            var reset = IsReset.reset;
                            reset.isReset = !reset.isReset;
                            QusService.qusItems[itemsIndex].questions[qusIndex].answer = "";

                            QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle-thin";
                        }, function (err) {
                            swal("重置失败", err, "error");
                        })
                    }
                }
            });
    }
    //重置office题目后的动作
    window.resetOfficeQus = function (result) {
        if (result.success) {
            //调用接口进行重置
            var data = {
                testid: testid,
                questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
                answer: "",
                answerfile: "",
            }
            var param = {
                authtoken: ls.getItem("authtoken"),
                data: base64.encode(angular.toJson(data)),
            }
            var promise = httpService.post("api/submitquestion", param);
            promise.then(function (res) {
                ResetLoading.deactivate();
                QusService.qusItems[itemsIndex].questions[qusIndex].answer = "";
                QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle-thin";
            }, function (err) {
                ResetLoading.deactivate();
                swal("重置失败", err, "error");
            })
        } else {
            ResetLoading.deactivate();
            swal("重置失败", result.message, "error");
        }
    }

    //阅卷
    $scope.goOver = function () {
        //当前试卷是否可以阅卷
        if (testInfo.enableClientJudge == false) {
            swal("提醒", "未开启阅卷功能", "warning");
        } else {
            //题目在第几个大题的第几个小题里面
            var qusLocation = {
                qusIndex: qusIndex,
                itemIndex: itemsIndex
            }
            ls.setItem("qusLocation", angular.toJson(qusLocation));
            myModal.activate();
        }
    }

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
        //一道小题目的分数
        $scope.score = QusService.qusItems[itemsIndex].questions[qusIndex].totalscore;
        //副本答案
        AnsCopy.ansCopy = QusService.qusItems[itemsIndex].questions[qusIndex].answer;
        var state = $scope.items[itemsIndex].type;
        switch (state) {
            case "JUDGE":
            case "SINGLE_CHIOCE":
                $state.go("SINGLE_CHOICE", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
            case "MULIT_CHIOCE":
                $state.go("MULIT_CHIOCE", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
            case "FILL_BLANK":
            case "PROGRAM_FILL_BLANK":
                $state.go("FILL_BLANK", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
            case "COMPLEX":
                $state.go("COMPLEX", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
            case "PROGRAM_DESIGN":
            case "PROGRAM_CORRECT":
            case "OPENEXAM_INPUT":
                $state.go("PROGRAM_DESIGN", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
            default:
                $state.go("DESIGN", {itemsIndex: itemsIndex, qusIndex: qusIndex, testid: testid});
                break;
        }
    }

    //提交作业
    $scope.submitHomeWork = function () {
        swal({
                title: "提醒",
                text: "您确认提交吗?",
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
                    //进行缓存的清理和跳转
                    submitHomeWork();

                }
            });

    }
    function submitHomeWork() {
        var param = {
            testid: testid,
            authtoken: ls.getItem("authtoken")
        }
        var promise = httpService.infoPost("api/submittest", param);
        promise.then(function (data) {
            var info = data.info;
            if (info.succ == true) {
                //进行清空 跳转

           //     ls.removeItem("courseInfo");

                if (timeSlides != null) {
                    for (var i = 0; i < timeSlides.length; i++) {
                        if (timeSlides[i].key == userInfo.username + "timeSlide" + testid) {
                            timeSlides.splice(i, 1);
                            break;
                        }
                    }
                    ls.setItem("timeSlides", angular.toJson(timeSlides));
                    $interval.cancel(slideInterval);
                }
                jsapi.endTest();
                ls.removeItem("qusLocation");
                ls.removeItem("exerciseItem");
                ls.removeItem("testInfo");
                return true;
            } else {
                swal("提交失败", "", "error");
            }
        }, function (err) {
            swal("提交失败", err, "error");
        })
    }


    //初始化icon 当第几个进来 随后第几个icon变颜色
    function initIcon(itemIndex, qusIndex) {
        var items = QusService.qusItems;
        for (var i = 0; i < items.length; i++) {
            var qus = items[i].questions;
            //第一行是默认展示的 随后都是默认不展示的
            if (i == itemIndex) {
                items[i].isShow = true;
                items[i].icon = "fa fa-chevron-circle-down";
            }
            for (var j = 0; j < qus.length; j++) {
                //每一行描述第几题 和是否已经完成
                qus[j].qusDesRow = "第" + (j + 1) + "题";
                if (qus[j].answer != null && qus[j].answer != "") {
                    qus[j].icon = "fa fa-circle";

                }
                else
                    qus[j].icon = "fa fa-circle-thin";

                if (i == itemIndex && j == qusIndex)
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
        var slideH = parseInt(timeSlide / 3600);
        var slideM = parseInt((timeSlide - slideH * 3600) / 60);

        var slideS = timeSlide - slideH * 3600 - slideM * 60;
        //随后进行倒计时
        slideInterval = $interval(function () {
            if (slideM <= 5 && slideH == 0) {
                $scope.remainLess = true;
            }
            //如果还有秒数的话
            if (slideS > 0) {
                slideS--;
            } else {
                if (slideM > 0) {
                    //如果还有分钟的话
                    slideM--;
                    slideS = 59;
                } else {
                    //如果还有小时的话
                    if (slideH > 0) {
                        slideH--;
                        slideM = 59;
                        slideS = 59;
                    } else {
                        slideH = 00;
                        slideM = 00;
                        slideS = 00;
                        $scope.remainLess = false;
                        //根据服务器请求的参数来判断是否自动交卷
                        swal({
                                title: "提醒",
                                text: "考试时间已经到了",
                                type: "warning",
                                height: 10000,
                                width: 100,
                            },
                            function () {
                                //根据api来确定是否要交卷
                                if (testInfo.forcesubmit)
                                    submitHomeWork();
                            });
                    }
                }
            }
            var realH = slideH;
            var realM = slideM;
            var realS = slideS;
            if (slideH < 10)
                realH = "0" + slideH;
            if (slideM < 10)
                realM = "0" + slideM;
            if (slideS < 10)
                realS = "0" + slideS;
            $scope.slideTimes = realH + ":" + realM + ":" + realS;
            //进行更新值
            for (var i = 0; i < timeSlides.length; i++) {
                if (timeSlides[i].key == userInfo.username + "timeSlide" + testid) {
                    timeSlides[i].value = slideH * 3600 + slideM * 60 + slideS;
                    break;
                }
            }
            ls.setItem("timeSlides", angular.toJson(timeSlides));
        }, 1000);
        //向服务器每3分钟发起一次请求 当前用掉的时间
        submitSlide = $interval(function () {
            //从localStorage取值
            var timeSlide;
            for (var i = 0; i < timeSlides.length; i++) {
                if (timeSlides[i].key == userInfo.username + "timeSlide" + testid) {
                    timeSlide = timeSlides[i].value;
                    break;
                }
            }
            var param = {
                testid: testid,
                authtoken: ls.getItem("authtoken"),
                slided: testInfo.timelimit * 60 - timeSlide,
            };
            var promise = httpService.infoPost("api/signslidetime", param);
            promise.then(function (data) {
            }, function (err) {
                swal("与服务器同步时间失败", err, "error");
            });
        }, 180000);
    }
})