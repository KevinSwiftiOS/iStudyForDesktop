/**
 * Created by hcnucai on 2016/12/22.
 */
MainModel.controller("MulitChoiceCtrl",function ($scope,$stateParams,httpService,QusService,base64,$timeout,AnsCopy,IsReset) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    //传过来的值还有testId
    var testid = $stateParams.testid;
    var keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
   var saveTrigger = null;
   //监听值改变

    $scope.answer  = function ($index) {
        $scope.options[$index].isSel = ! $scope.options[$index].isSel;
    }
    $scope.changed = function ($index) {
        $scope.options[$index].isSel = ! $scope.options[$index].isSel;
    }
//初始化界面
    initView();
    function initView() {
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        var answer = qus.answer;
        var content = qus.content;
        $scope.files = qus.files;
        $scope.content = content;
        //如果有匹配的就加上

        //进行比较看有几个 初始化
        var options = [];
        for (var i = 0; i < keys.length; i++) {
            var optionDic = {};
            var optionkey = "option" + keys[i];
            if (qus[optionkey] != "") {
                //题目内容
                optionDic.optionContent = keys[i].toUpperCase() + "." + qus[optionkey];
                //是否选中

                if (qus.answer != null && qus.answer.indexOf(keys[i].toUpperCase()) != -1)
                    optionDic.isSel = true;
                else
                    optionDic.isSel = false;
                options.push(optionDic);

            }

        }
        $scope.options = options;
    }


    $scope.isSave = false;
    $scope.saveDes = {
        icon:"fa fa-spinner fa-spin",
        des:"正在保存答案"
    }
    //保存的按钮
    $scope.reset = IsReset.reset;
    $scope.$watch('reset',function (newV,oldV) {
        if(newV != oldV) {

            initView();
        }
    },true);
    $scope.$watch('options',function (newV,oldV) {
        if(newV != oldV) {

            var options = $scope.options;
            var answer = "";
            var cnt = 1000;
            var arr = [];
            for (var i = 0; i < options.length; i++)
                if (options[i].isSel)
                    arr.push(keys[i].toUpperCase());
            answer = arr.join("&&&");
            AnsCopy.ansCopy = answer;
            if(saveTrigger != null) {
                clearTimeout(saveTrigger);
                saveTrigger = null;
            }
            saveTrigger = setTimeout(function () {
                $scope.isSave = true;

                var data = {
                    testid:testid,
                    questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
                    answer:AnsCopy.ansCopy,
                    answerfile:"",
                }

                var ls = window.localStorage;
                var param = {
                    authtoken:ls.getItem("authtoken"),
                    data:base64.encode(angular.toJson(data)),
                }
                var promise = httpService.post(  "api/submitquestion",param);
                promise.then(function (res) {

                    $scope.saveDes = {
                        icon:"fa  fa-check",
                        des:"保存成功"
                    }
                    $timeout(function () {
                        $scope.isSave = false;
                    }, 1000);
                    QusService.qusItems[itemsIndex].questions[qusIndex].answer = AnsCopy.ansCopy;
                    QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle";
                    clearTimeout(saveTrigger);
                    saveTrigger = null;
                },function (err) {
                    $scope.isSave = false;
                    swal("保存失败",err,"error");
                    clearTimeout(saveTrigger);
                    saveTrigger = null;
                })
            },2000);




        }
        },true);
    //保存

})