/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.controller("SingleChoiceCtrl", function ($scope, $stateParams, QusService, httpService, base64, $timeout, AnsCopy, IsReset) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    //传过来的值还有testId
    var testid = $stateParams.testid;
    var keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
    initView();
    //选择了某个选项 是自动保存的

    $scope.answer = function ($index) {
        $scope.isSave = true;
        $scope.saveDes = {
            icon: "fa fa-spinner fa-spin",
            des: "正在保存答案"
        }
        //请求服务器 保存答案 随后本地保存一份
        $scope.isSave = true;
        AnsCopy.ansCopy = keys[$index].toUpperCase();
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
            initView();
        }, function (err) {
            $scope.isSave = false;
            swal(err, "请再次保存", "error");
        })
    }
    function initView() {
        var oneQus = QusService.qusItems[itemsIndex].questions[qusIndex];
        var content = oneQus.content;
        $scope.content = content;
        $scope.files = oneQus.files;
        //单选题拿到后看有几个选项
        //进行比较看有几个
        var options = [];
        for (var i = 0; i < keys.length; i++) {
            var optionDic = {};
            var optionkey = "option" + keys[i];
            if (oneQus[optionkey] != "") {
                //题目内容
                optionDic.letter = keys[i].toUpperCase() + ".";
                optionDic.optionContent = keys[i].toUpperCase() + "." + oneQus[optionkey];
                //是否选中
                if (oneQus.answer == keys[i].toUpperCase())
                    optionDic.isSel = true;
                else
                    optionDic.isSel = false;
                options.push(optionDic);

            }

        }
        $scope.options = options;
    }
    $scope.reset = IsReset.reset;
    $scope.$watch('reset', function (newV, oldV) {
        if (newV != oldV) {
            initView();
        }
    }, true);
})