/**
 * Created by hcnucai on 2016/12/20.
 */
//定义公有的http服务
MainModel.factory("httpService",
    function ($http, $q) {
        return {
            post: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: jsapi.getDomain() + suburl,
                }).success(function (data) {
                    if (data.retcode == 0) {
                        defer.resolve(data.items);
                    }
                    else
                        defer.reject(data.message);
                }).error(function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            },
            infoPost: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: jsapi.getDomain() + suburl,
                }).success(function (data) {
                    if (data.retcode == 0) {
                        defer.resolve(data);
                    }
                    else
                        defer.reject(data.message);
                }).error(function (data) {
                    defer.reject(data);
                });
                return defer.promise;
            },

        };

    });
/**
 * Created by hcnucai on 2016/12/21.
 */
MainModel.factory("QusService", function () {
    return {
        qusItems: null
    }
});

MainModel.factory('myModal', function (btfModal) {
    return btfModal({
        controller: 'MyModalCtrl',

        templateUrl: "QusType/Modal.html"
    });
});
MainModel.factory('Loading', function (btfModal) {
    return btfModal({
        controller: 'LoadingCtrl',

        templateUrl: "Loading.html"
    });
});

//答案的副本 在重置的时候有用
MainModel.factory("AnsCopy", function () {
    return {
        ansCopy: "",
    }
});
//是否重置
MainModel.factory("IsReset", function () {
    return {
        reset: {isReset: 0},
    }
});
//定时器的设置
MainModel.factory("Timer", function () {
    return {
        times: null
    }
})

MainModel.directive('resize', function ($window) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        }, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.resizeWithOffset = function (offsetH) {

                scope.$eval(attr.notifier);

                return {
                    'height': (newValue.h - offsetH) + 'px'
                    //,'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
})
MainModel.directive('widthresize', function ($window) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': w.height(),
                'w': w.width()
            };
        }, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.resizeWitdhWithOffset = function (offsetW) {

                scope.$eval(attr.notifier);

                return {
                    'width': (newValue.w - offsetW) + 'px'
                    //,'width': (newValue.w - 100) + 'px'
                };
            };

        }, true);

        w.bind('widthresize', function () {
            scope.$apply();
        });
    }
});



// MainModel.directive('fileModel', ['$parse', function ($parse) {
//     return {
//         restrict: 'A',
//         link: function (scope, element, attrs) {
//             element.bind('change', function () {
//                 $parse(attrs.fileModel).assign(scope, element[0].files)
//                 scope.$MainModelly();
//             });
//         }
//     }
// }]);


//定义保存的服务
