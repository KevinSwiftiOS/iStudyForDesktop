/**
 * Created by hcnucai on 2016/12/23.
 */
MainModel.controller("DesignCtrl",function ($scope,$stateParams,httpService,QusService,base64,$timeout,AnsCopy,IsReset,$document) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    var testid = $stateParams.testid;
    initView();
    function initView() {
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        $scope.content = qus.content;
        $scope.files = qus.files;
        //看是文件上传类型题目还是富文本题目
        $scope.files = qus.files;
        $scope.answerfiles = qus.answerfiles;
        //答案
        var answer = qus.answer;
        $scope.Ans = {
            answer:answer
        }


    }
    //开始答题 调用jsapi
$scope.startAnswer = function () {
     //第几题
    console.log(QusService.qusItems[itemsIndex]);
    console.log(QusService.qusItems[itemsIndex].questions[qusIndex]);
}
    var ls = window.localStorage;
    var authtoken = ls.getItem("authtoken");
    //保存的按钮
    $scope.save = function () {
        $scope.isSave = true;
        $scope.saveDes = {
            icon: "fa fa-spinner fa-spin",
            des: "正在保存答案"
        }
        var data = {
            testid:testid,
            questionid: QusService.qusItems[itemsIndex].questions[qusIndex].id,
            answer:AnsCopy.ansCopy.answer,
            answerfile:"",
        }
        var param = {
            authtoken:ls.getItem("authtoken"),
            data:base64.encode(angular.toJson(data)),
        }
        var promise = httpService.post("api/submitquestion",param);
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
            initView();
        },function (err) {
            $scope.isSave = false;
            swal("保存失败",err,"error");
        })
    }
    var data = {
        "testid": testid,
        "questionid": QusService.qusItems[itemsIndex].questions[qusIndex].id
    }





//答案的监听
    $scope.$watch('Ans',function (newV,oldV) {
        if(newV != oldV) {
            AnsCopy.ansCopy = newV;
        }
    },true);


//重置动作
    $scope.reset = IsReset.reset;
    $scope.$watch('reset',function (newV,oldV) {
        if(newV != oldV) {

            initView();
        }
    },true);
})