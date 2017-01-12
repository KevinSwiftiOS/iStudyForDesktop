/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.controller("CompletionCtrl",function ($scope,$stateParams,QusService,httpService,base64,$timeout,AnsCopy,IsReset) {
    var itemsIndex = $stateParams.itemsIndex;
    var qusIndex = $stateParams.qusIndex;
    var testid = $stateParams.testid;
    var saveTrigger = null;
    initView();
    function initView() {
        var qus = QusService.qusItems[itemsIndex].questions[qusIndex];
        var answer = qus.answer;
        var content = qus.content;
        $scope.content = content;
        //标准答案
        var strandanswer = qus.strandanswer;
        //匹配有多少个&&&
        var regex = new RegExp("&&&", 'g');
        var result = strandanswer.match(regex);
        var count = (!result ? 0 : result.length) + 1;
        var options = [];
        $scope.options = [];
        //如果自己没有答题
        if (answer == "" || answer == null) {
            for (var i = 0; i < count; i++) {
                var dic = {};
                dic.value = "";
                //看是否有选项的描述
                var blank = "blank" + (i+1);
                if(qus[blank] != null && qus[blank] != "")
                    dic.blank = qus[blank];
                else
                    dic.blank = "";
                options.push(dic);
            }

            $scope.options = options;
        }
        else {
            //将自己答题的内容进行分割 随后填入options的数组中
            //进行遍历
            var arr = answer.split("&&&");
            for(var i = 0; i < arr.length;i++) {
                var dic = {};
                dic.value = arr[i];
                var blank = "blank" + (i+1);

                if(qus[blank] != null && qus[blank] != "")
                    dic.blank = qus[blank];
                else
                    dic.blank = "";
                options.push(dic);

            }
            $scope.options = options;
        }
    }

    //保存的按钮
    $scope.isSave = false;
    $scope.saveDes = {
        icon:"fa fa-spinner fa-spin",
        des:"正在保存答案"
    }
    $scope.save = function () {

    }
    //监听值有没有发生变化
    //重置

    $scope.reset = IsReset.reset;
    $scope.$watch('reset',function (newV,oldV) {
        if(newV != oldV) {

            initView();
        }
    },true);

    $scope.$watch('options',function (newV,oldV) {
        if(newV != oldV) {
            options = $scope.options;
            answer = "";
            for(var i = 0; i < options.length - 1;i++) {
                answer += options[i].value + "&&&";
            }
            answer += options[options.length - 1].value;
            AnsCopy.ansCopy = answer;
        }
    },true);

    //监听keyDown
    $scope.keyDown = function () {
        //清空
       if(saveTrigger != null) {
           clearTimeout(saveTrigger);
           saveTrigger = null;
       }
       saveTrigger = setTimeout(function () {
           $scope.isSave = true;
           //请求服务器 保存答案 随后本地保存一份
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
           var promise = httpService.post( "api/submitquestion",param);
           promise.then(function (res) {
               $scope.saveDes = {
                   icon:"fa  fa-check",
                   des:"保存成功"
               }
               clearTimeout(saveTrigger);
               saveTrigger = null;
               $timeout(function () {
                   $scope.isSave = false;
               }, 1000);
               QusService.qusItems[itemsIndex].questions[qusIndex].answer = AnsCopy.ansCopy;
               QusService.qusItems[itemsIndex].questions[qusIndex].icon = "fa fa-circle";
           },function (err) {
               $timeout(function () {
                   $scope.isSave = false;
               }, 1000);
               clearTimeout(saveTrigger);
               saveTrigger = null;
               $scope.isSave = false;
               swal("保存失败",err,"error");
           })
           //保存成功后 也要clearTimeout
       },1000);
    }




$scope.$on("$viewContentLoaded",function () {

})

    })