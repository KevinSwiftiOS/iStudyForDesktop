HomeWorkListModel.controller("HomeWorkCtrl",function ($scope,httpService,subDate,$state,cfpLoadingBar,hostip) {


    var ls = window.localStorage ;
    var courserInfo = angular.fromJson( ls.getItem("courseInfo"));
    var param = {
        authtoken:ls.getItem("authtoken"),
        courseid:courserInfo.courseid
    }

    var items = [];
    cfpLoadingBar.start();
    var promise = httpService.post("api/homeworkquery",param);
    promise.then(function (data) {
        cfpLoadingBar.complete();
        //分割日期并进行查看
        items = data;
        for(var i = 0; i < items.length;i++) {
            var dicStart = subDate.divedeToDay(items[i].datestart);
            var dicEnd = subDate.divedeToDay(items[i].dateend);

            items[i].datestart = dicStart.year + "-" + dicStart.month + "-" + dicStart.day;
            items[i].dateend = dicEnd.year + "-" + dicEnd.month + "-" + dicEnd.day;
            var endDate = new Date(dicEnd.year, dicEnd.month - 1, dicEnd.day, dicEnd.hour, dicEnd.min, dicEnd.second);
            var now = new Date();
            //还要看是否已经交卷
            if (endDate.valueOf() > now.valueOf()) {
                items[i].isEnd = false;
                items[i].btnTitle = "答题";
            }
            else {
                items[i].isEnd = true;
                items[i].btnTitle = "查看";
            }
        }
        $scope.items = items;
    },function (err) {
        cfpLoadingBar.complete();
        swal("请求失败",err,"error");
        $scope.items = items;
    })
    //跳转到答题界面 要传4个参数 testid 是否可以阅卷 阅卷后是否可以查看标准答案 查卷时是否答案可见 考虑放到indexdb中 这样可以存储多个 随后从里面取值即可
    $scope.answer = function ($index) {
        // window.windowpool = [];
        // var newWin = window.open("Main.html?testid=" + $scope.items[$index].id);
        // window.windowpool.push({
        //     window:newWin,
        //     parameter:"ccc
        // })
        if ($scope.items[$index].btnTitle == "答题") {
            var testInfo = {
                testid: $scope.items[$index].id,
                title: $scope.items[$index].title,
                enableClientJudge: $scope.items[$index].enableClientJudge,
                keyVisible: $scope.items[$index].keyVisible,
                viewOneWithAnswerKey: $scope.items[$index].viewOneWithAnswerKey,
                redraw: false,
                drawsetting: ""
            }

            ls.setItem("testInfo", angular.toJson(testInfo));
            window.location.href = "Main.html";

        }else{
            //调用jsapi 打开浏览器
            window.open(hostip + "Output/ViewOne/" + $scope.items[$index].usertestid);
        }

    }


    function getParam(paramName) {
        paramValue = "";
        isFound = false;
        if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
            arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&");
            i = 0;
            while (i < arrSource.length && !isFound) {
                if (arrSource[i].indexOf("=") > 0) {
                    if (arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase()) {
                        paramValue = arrSource[i].split("=")[1];
                        isFound = true;
                    }
                }
                i++;
            }
        }
        return paramValue;
    }

})