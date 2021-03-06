/**
 * Created by hcnucai on 2016/12/23.
 */
MainModel.controller("ProgramDesCtrl", function ($scope, QusService, httpService, $stateParams, IsReset, AnsCopy, myModal, base64, $timeout, $interval) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    //传过来的值还有testId
    var testid = $stateParams.testid;
    var saveTrigger = null;
    initView();
    function initView() {
        var pattern = new RegExp("^\[E\]([\s\S]*?)\[/E\]\r?");
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        var answer = qus.answer;
        $scope.files = qus.files;
        var content = qus.content;
        //默认的答案
        var defaultanswer = qus.defaultanswer;
        var type = QusService.qusItems[itemsIndex].type;
        var hase = false;
        //前一段和后一段
        var beforeE = "", afterE = "";

        if (defaultanswer != null && defaultanswer != "") {
            if (defaultanswer.indexOf("[E]") != -1 && defaultanswer.indexOf("[/E]") != -1) {
                hase = true;
                for (var i = 0; i < defaultanswer.indexOf("[E]"); i++)
                    beforeE += defaultanswer[i];
                for (var i = defaultanswer.indexOf("[/E]") + 4; i < defaultanswer.length; i++)
                    afterE += defaultanswer[i];

            }

        }

        if (hase) {
            $scope.beforeE = beforeE;

            $scope.afterE = afterE;
            if (answer != null && answer != "")
                $scope.answer = answer;
            else
                $scope.answer = "";
        } else {

            //看是程序改错题还是程序设计题
            if (type == "PROGRAM_CORRECT") {

                if (answer != null && answer != "") {
                    $scope.answer = answer;
                }
                else if (defaultanswer != null && defaultanswer != "") {
                    $scope.answer = defaultanswer;
                }
                else
                    $scope.answer = "";

            } else {
                $scope.beforeE = defaultanswer;
                if (answer != null && answer != "") {
                    $scope.answer = answer;
                } else {
                    $scope.answer = "";
                }
            }
        }

        $scope.content = content;
    }

    $scope.isSave = false;
    //保存的按钮 这里是直接阅卷
    //键盘的侦听事件
    $scope.keyDown = function () {
        if (saveTrigger != null) {
            clearTimeout(saveTrigger);
            saveTrigger = null;
        }
        saveTrigger = setTimeout(function () {
            $scope.isSave = true;
            $scope.saveDes = {
                icon: "fa fa-spinner fa-spin",
                des: "正在保存答案"
            }
            var data = {
                testid: testid,
                questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
                answer: AnsCopy.ansCopy,
                answerfile: "",
            }
            var ls = window.localStorage;
            var param = {
                authtoken: ls.getItem("authtoken"),
                data: base64.encode(angular.toJson(data)),
            }
            var promise = httpService.post("api/submitquestion", param);
            promise.then(function (res) {

                $scope.saveDes = {
                    icon: "fa  fa-check",
                    des: "保存成功"
                }
                $timeout(function () {
                    $scope.isSave = false;
                }, 1000);
                QusService.qusItems[itemsIndex].questions[qusIndex].answer = AnsCopy.ansCopy;
                QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle";
                clearTimeout(saveTrigger);
                saveTrigger = null;
            }, function (err) {
                $scope.isSave = false;
                swal(err, "请再次保存", "error");
                clearTimeout(saveTrigger);
                saveTrigger = null;
            })

        }, 2000);
    }
    $scope.reset = IsReset.reset;
    $scope.$watch('reset', function (newV, oldV) {
        if (newV != oldV) {

            initView();
        }
    }, true);
    $scope.$watch("answer", function (newV, oldV) {
        if (newV != oldV) {
            AnsCopy.ansCopy = newV;
        }
    })


})