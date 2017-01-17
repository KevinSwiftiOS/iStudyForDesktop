/**
 * Created by hcnucai on 2016/12/21.
 */
//头像的路径
//时间日期的分割
HomeWorkListModel.factory("httpService",
    function ($http, $q, hostip) {
        return {
            post: function (suburl, params) {
                var defer = $q.defer();
                $http({
                    method: 'POST',
                    params: params,
                    url: hostip + suburl,
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
                    url: hostip + suburl,
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
HomeWorkListModel.factory("subDate", function () {
    return {

        divedeToDay: function (date) {

            var year = date.substr(0, 4);
            var month = date.substr(4, 2);
            var day = date.substr(6, 2);
            var hour = date.substr(8, 2);
            var min = date.substr(10, 2);
            var second = date.substr(12, 2);
            return {year: year, month: month, day: day, hour: hour, min: min, second: second};
        }
    }
})
    HomeWorkListModel.factory('myModal', function (btfModal) {
        return btfModal({
            controller: 'SelfSelQusCtrl',

            templateUrl: "HomeWorkType/SelfSelQus.html"
        });
    });
HomeWorkListModel.directive('resizediv', function ($window) {
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

        w.bind('resizediv', function () {
            scope.$apply();
        });
    }
})