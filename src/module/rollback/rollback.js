angular.module('nd.rollback', [])

.directive('ndModelCommit', ["$parse", function($parse) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            el.bind("click", function() {
                //回调动作
                var goAction = angular.isDefined(attrs.action) ? $parse(attrs.action) : angular.noop;
                //验证动作
                var validationAction = angular.isDefined(attrs.validation) ? $parse(attrs.validation) : angular.noop;
                //是否提交
                var isCommit = angular.isDefined(attrs.commit) && attrs.commit === "true" ? true : false;

                //通知回滚
                scope.$emit("ngModelActionRollback" + attrs.ndModelCommit, isCommit, validationAction);

                //提交成功回调
                goAction(scope);

                scope.$apply();
            });
        }
    };
}])

.directive('ndModelRollback', function() {
    return {
        restrict: 'A',
        scope: false,
        require: "?ngModel",
        priority: 20,
        link: function(scope, el, attrs, ngModel) {
            var pViewVaulue = null;

            scope.$on("ngModelActionRollback" + attrs.ndModelRollback, function(event, isEnter, validationAction) {
                if (isEnter) {
                    isEnter = validationAction(scope, {
                        vm: ngModel.$viewValue
                    });
                    isEnter = isEnter === undefined ? true : isEnter;
                }

                if (isEnter) {
                    ngModel.$commitViewValue();
                    ngModel.$render();
                    scope.$apply();
                } else {
                    ngModel.$rollbackViewValue();
                    ngModel.$render();
                }
            });

            el.bind('blur', function(e) {
                pViewVaulue = ngModel.$viewValue;

                ngModel.$rollbackViewValue();

                ngModel.$setViewValue(pViewVaulue);
                ngModel.$render();
            });
        }
    };
});
