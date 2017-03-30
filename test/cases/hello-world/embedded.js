angular.module('test').directive('helloWorld', function () {
    return {
        restrict: 'E',
        templateUrl:'/cases/hello-world/template.html'
    };
});