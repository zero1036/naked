/*
 * angular-ui-nd
 */
angular.module("ui.nd", ["nd.wall", "nd.sptable", "nd.rollback"]);

﻿angular.module('nd.rollback', [])

.directive('ndModelCommit', ["$parse", function($parse) {
    return {
        restrict: 'A',
        link: function(scope, el, attrs) {
            el.bind("click", function() {
                //回调动作
                var goAction = angular.isDefined(attrs.action) ? $parse(attrs.action) : angular.noop;
                //验证动作
                var validationAction = angular.isDefined(attrs.validation) ? $parse(attrs.validation) : angular.noop;
                var isCommit = angular.isDefined(attrs.commit) && attrs.commit === "true" ? true : false;

                // if (isCommit === true && angular.isDefined(attrs.validation)) {
                //     isCommit = validationAction(scope);
                // }

                //通知回滚
                scope.$emit("ngModelActionRollback", isCommit, validationAction);

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

            scope.$on("ngModelActionRollback", function(event, isEnter, validationAction) {
                if (isEnter) {
                    isEnter = validationAction(scope, {
                        vw: ngModel.$viewValue
                    });
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

﻿angular.module('nd.sptable', ['ngAnimate'])

.directive('ndSptable', function() {
    return {
        scope: {
            spArr: '=',
            spRow: '='
        },
        controller: 'ndSptableCtrl'
    }
})

.controller('ndSptableCtrl', ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {
    if (!angular.isDefined($attrs.rowField) || !angular.isDefined($attrs.scaleField) || !angular.isDefined($attrs.isdelField)) {
        return;
    }

    //是否汇报日志
    var _isLog = angular.isDefined($attrs.isLog);

    //刷新集合
    this.refreshArr = function(arr, oldArr) {
        if (arr === undefined) {
            arr = $scope.spArr;
            if (arr === undefined) {
                return;
            }
        }

        // var curCount = 0;
        $scope.spRow = 0;
        //目前最多支持10行
        for (var irow = 1; irow <= 10; irow++) {

            //获取当前行所有item集合
            var itemsInRowAll = arr.filter($attrs.rowField, irow);
            if (itemsInRowAll.length === 0) {
                break;
            }

            //计算每行items总量
            // curCount += itemsInRowAll.length;

            //过滤非删除的记录
            var itemsInRowNotDel = itemsInRowAll.filter($attrs.isdelField, false);
            if (itemsInRowNotDel.length !== 0) {
                //设置有效行数
                $scope.spRow += 1;
            }

            //获取所有非删除items所占scale总和
            var totalScale = getTotalScale(itemsInRowNotDel);

            for (var i = 0, en; en = itemsInRowAll[i++];) {

                if (en[$attrs.isdelField] === false) {
                    //计算每个非删除item项实际宽度
                    calculateWidth(en, totalScale);
                }

                //更新行号
                en[$attrs.rowField] = $scope.spRow;

                //更新item设置所在行的下一项索引
                // en.nextIndex = curCount;
            }
        }

        if (_isLog) {
            //汇报日志
            refreshDataLog(arr);
        }
    };

    //监听item集合变化
    $scope.$watchCollection('spArr', this.refreshArr);

    //获取最大比例
    function getTotalScale(arrInRow) {
        var totalScale = 0;
        for (var i = 0, en; en = arrInRow[i++];) {
            var curScale = en[$attrs.scaleField];

            totalScale += curScale;
        }
        return totalScale;
    }

    //计算item项实际宽度
    function calculateWidth(item, totalScale) {
        var itemScale = item[$attrs.scaleField];

        if (angular.isDefined($attrs.widthUnit) && angular.isDefined($attrs.widthPx) && $attrs.widthUnit === "px") {
            item.width = ((parseInt($attrs.widthPx) * itemScale) / totalScale);
            item.width = item.width + "px";
        } else {
            if (itemScale === totalScale && itemScale === 0) {
                item.width = "100%";
            } else {
                item.width = (itemScale / totalScale) * 100;
                item.width = item.width + "%";
            }
        }
    }

    //刷新数据日志
    function refreshDataLog(arr) {
        console.log("validate sptable");
        var lastRow = null;
        for (var i = 0, en; en = arr[i++];) {
            if (lastRow !== null && lastRow > en[$attrs.rowField]) {
                console.log("！！！！sptable数据异常！！！！");
            }

            lastRow = en[$attrs.rowField];

            console.log("i:" + i + " | row:" + en[$attrs.rowField] + " | isDel:" + en[$attrs.isdelField]);

            //验证scale是否为数值
            if (!(Object.prototype.toString.call(en[$attrs.scaleField]) == "[object Number]")) {
                console.log("！！！！对象属性" + $attrs.scaleField + "只能为数值！！！！");
            }
        }
    }
}])

.directive('ndSpitem', function() {
    return {
        require: ['?^ndSptable', '?^ndSpitem'],
        scope: {
            spItem: '='
        },
        controller: 'ndSpitemCtrl',
        link: function(scope, el, attr, ctrls) {
            ctrls[1].refreshParentArr = ctrls[0].refreshArr;

            var _origalWidth = "";

            // el.bind('mouseover', function() {
            //     var me = this;
            //     if (me.offsetWidth < 300) {
            //         _origalWidth = me.style.width;
            //         me.style.width = "300px";
            //         me.style.position = "absolute";
            //     }
            // });

            // el.bind('mouseleave', function(event) {
            //     var me = this;
            //     if (_origalWidth !== "") {
            //         // me.style.width = _origalWidth;
            //         me.style.position = "initial";
            //         ctrls[1].refreshParentArr();
            //         scope.$apply();
            //     }
            // });
        }
    };
})

.controller('ndSpitemCtrl', ['$scope', '$element', '$attrs', '$transclude', function($scope, $element, $attrs, $transclude) {

    this.refreshParentArr = angular.loop;
    var self = this;
    //监听item的宽度变化，并改变DOM样式
    $scope.$watch(function(scope) {
        return scope.spItem.width;
    }, function(wid) {
        //获取元素
        $element[0].style.width = wid;
    });

    //监听item的比例变化，并通知父指令全局刷新所有item
    $scope.$watch(function(scope) {
        return scope.spItem[$attrs.scaleField];
    }, function(scale, oscale) {
        if (scale !== oscale) {
            if (scale === 0) {
                return;
            }
            self.refreshParentArr();
        }
    });

    //监听item的删除键变化，并通知父指令全局刷新所有item
    $scope.$watch(function(scope) {
        return scope.spItem[$attrs.isdelField];
    }, function(isDel, oisDel) {
        if (isDel !== oisDel && isDel) {
            self.refreshParentArr();
        }
    });

}]);

﻿(function() {
    //过滤并获取符合条件单个对象
    Array.prototype.single = function(property, value) {
        for (var i = 0, en; en = this[i++];) {
            if (en[property] === value)
                return en;
        }
        return undefined;
    };

    //过滤并生成新的数组
    Array.prototype.filter = function(property, value) {
        var arr = [];
        for (var i = 0, en; en = this[i++];) {
            if (en[property] == value)
                arr.push(en);
        }
        return arr;
    };

    //获取对象在数组中的索引
    Array.prototype.indexOf4Pro = function(property, value) {
        for (var i = 0, en; en = this[i++];) {
            if (en[property] == value)
                return i - 1;
        }
        return -1;
    };

    //是否包含
    Array.prototype.contains = function(target) {
        return this.indexOf(target) >= 0;
    };

    //重排号
    Array.prototype.resortNumber = function(sortField, startIndex, filterFn) {
        for (var i = 0, en; en = this[i++];) {
            //过滤条件
            if (filterFn(en)) {
                en[sortField] = startIndex;
                startIndex += 1;
            } else {
                en[sortField] = -1;
            }
        }
    };

})();

﻿(function() {
    // 对Date的扩展，将 Date 转化为指定格式的String 
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
    // 例子： 
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
    Date.prototype.Format = function(fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

})();

﻿var ut = angular.module('nd.util', []);

ut.factory('$$util', function() {
    var service = {};

    //返回对象格式名称
    service.lastName = function(filepath, tp) {
        //获取欲上传的文件路径
        //var filepath = document.getElementById("file1").value;
        //为了避免转义反斜杠出问题，这里将对其进行转换
        var re = /(\\+)/g;
        var filename = filepath.replace(re, "#");
        //对路径字符串进行剪切截取
        var one = filename.split("#");
        //获取数组中最后一个，即文件名
        var two = one[one.length - 1];
        //再对文件名进行截取，以取得后缀名
        var three = two.split(".");
        //获取截取的最后一个字符串，即为后缀名
        var last = three[three.length - 1];
        //添加需要判断的后缀名类型
        //var tp = "jpg,gif,bmp,png,JPG,GIF,BMP,PNG";
        //返回符合条件的后缀名在字符串中的位置
        var rs = tp.indexOf(last);
        //如果返回的结果大于或等于0，说明包含允许上传的文件类型
        if (rs >= 0) {
            return true;
        } else {
            alert("您选择的上传文件不是有效的图片文件！");
            return false;
        }
    };

    //获取选中对象的属性，并生成以逗号连接的文本
    service.getChecked = function(list, key) {
        var selectIds = ""; //选中的ID
        if (list === null) {
            return "";
        }

        for (var i = 0, en; en = list[i++];) {
            if (en.isChecked) {
                selectIds += (en[key] + ",");
            }
        }

        if (selectIds.length > 0)
            selectIds = selectIds.substring(0, selectIds.length - 1); //去掉最后一个","
        return selectIds;
    };

    //根据实体的属性排序
    service.sort = function(array, attr) {
        return array.sort(function(a, b) {
            return a[attr] - b[attr];
        });
    };

    // 对Date的扩展，将 Date 转化为指定格式的String 
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
    // 例子： 
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
    Date.prototype.Format = function(fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    return service;
});

﻿angular.module('nd.wall', ['ngAnimate'])

.constant('wallConfig', {
    openClass: 'open'
})

.service('wallService', ['$document', '$rootScope', function ($document, $rootScope) {
    var openScope = null;

    this.open = function (dropdownScope, isOnly) {
        if (!openScope) {
            $document.bind('touchstart', closeDropdown);
            //$document.bind('keydown', keybindFilter);
        }

        //isOnly��true��������һ��������false�������������
        if (openScope && openScope !== dropdownScope && isOnly && isOnly == true) {
            openScope.isOpen = false;
        }

        openScope = dropdownScope;
    };

    this.close = function (dropdownScope) {
        if (openScope === dropdownScope) {
            openScope = null;
            $document.unbind('click', closeDropdown);
            //$document.unbind('keydown', keybindFilter);
        }
    };

    var closeDropdown = function (evt) {
        // This method may still be called during the same mouse event that
        // unbound this event handler. So check openScope before proceeding.
        if (!openScope) { return; }

        if (evt && openScope.getAutoClose() === 'disabled') { return; }

        var toggleElement = openScope.getToggleElement();
        if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
            return;
        }

        var dropdownElement = openScope.getDropdownElement();
        if (evt && openScope.getAutoClose() === 'outsideClick' &&
          dropdownElement && dropdownElement[0].contains(evt.target)) {
            return;
        }

        openScope.isOpen = false;

        if (!$rootScope.$$phase) {
            openScope.$apply();
        }
    };

    //var keybindFilter = function (evt) {
    //    if (evt.which === 27) {
    //        openScope.focusToggleElement();
    //        closeDropdown();
    //    } else if (openScope.isKeynavEnabled() && /(38|40)/.test(evt.which) && openScope.isOpen) {
    //        evt.preventDefault();
    //        evt.stopPropagation();
    //        openScope.focusDropdownEntry(evt.which);
    //    }
    //};
}])

.controller('ndWallCtrl', ['$scope', '$attrs', '$parse', 'wallConfig', 'wallService', '$animate', '$document', '$compile', '$templateRequest', function ($scope, $attrs, $parse, wallConfig, wallService, $animate, $document, $compile, $templateRequest) {
    var self = this,
      scope = $scope.$new(), // create a child scope so we are not polluting original one
      templateScope,
      openClass = wallConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
      //appendToBody = false,
      //keynavEnabled = false,
      //selectedOption = null,
      body = $document.find('body'),
      isOnly = angular.isDefined($attrs.isOnly) ? $attrs.isOnly : true;


    this.init = function (element) {
        self.$element = element;

        if ($attrs.isOpen) {
            getIsOpen = $parse($attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            $scope.$watch(getIsOpen, function (value) {
                scope.isOpen = !!value;
            });
        }

        //openClass = wallConfig.openClass,
    };

    this.toggle = function (open) {
        return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function () {
        return scope.isOpen;
    };

    scope.getToggleElement = function () {
        return self.toggleElement;
    };

    scope.getAutoClose = function () {
        return $attrs.autoClose || 'always'; //or 'outsideClick' or 'disabled'
    };

    scope.getElement = function () {
        return self.$element;
    };

    //scope.isKeynavEnabled = function () {
    //    return keynavEnabled;
    //};

    scope.getDropdownElement = function () {
        return self.dropdownMenu;
    };

    scope.focusToggleElement = function () {
        if (self.toggleElement) {
            self.toggleElement[0].focus();
        }
    };

    scope.$watch('isOpen', function (isOpen, wasOpen) {

        var openContainer = self.$element;

        $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, openClass).then(function () {
            if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
                toggleInvoker($scope, { open: !!isOpen });
            }
        });

        if (isOpen) {

            scope.focusToggleElement();
            wallService.open(scope, isOnly);
        } else {

            wallService.close(scope);
            //self.selectedOption = null;
        }

        if (angular.isFunction(setIsOpen)) {
            setIsOpen($scope, isOpen);
        }
    });

    $scope.$on('$locationChangeSuccess', function () {
        if (scope.getAutoClose() !== 'disabled') {
            scope.isOpen = false;
        }
    });

    var offDestroy = $scope.$on('$destroy', function () {
        scope.$destroy();
    });
    scope.$on('$destroy', offDestroy);
}])

.directive('ndWall', function () {
    return {
        controller: 'ndWallCtrl',
        link: function (scope, element, attrs, wallCtrl) {
            wallCtrl.init(element);
            element.addClass('nd-wall');
        }
    };
})

.directive('ndWallTogglePub', ["$parse", function ($parse) {
    return {
        //require: '?^ndWall',
        link: function (scope, element, attrs, ctrl) {
            if (!angular.isDefined(attrs.isOpen)) {
                return;
            }

            var getIsOpen,
                setIsOpen = angular.noop;

            getIsOpen = $parse(attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            var toggleDropdown1 = function (event) {
                event.preventDefault();
                event.stopPropagation();

                var isOpen = getIsOpen(scope);
                scope.$apply(function () {
                    setIsOpen(scope, !isOpen);
                });

            };

            element.bind('click', toggleDropdown1);
        }
    };
}])

.directive('ndWallToggle', function () {
    return {
        require: '?^ndWall',
        link: function (scope, element, attrs, wallCtrl) {
            if (!wallCtrl) {
                return;
            }

            element.addClass('nd-wall-toggle');

            wallCtrl.toggleElement = element;

            var toggleDropdown = function (event) {
                event.preventDefault();

                if (!element.hasClass('disabled') && !attrs.disabled) {
                    scope.$apply(function () {
                        wallCtrl.toggle();
                    });
                }
            };

            element.bind('click', toggleDropdown);

            // WAI-ARIA
            element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
            scope.$watch(wallCtrl.isOpen, function (isOpen) {
                element.attr('aria-expanded', !!isOpen);
            });

            scope.$on('$destroy', function () {
                element.unbind('click', toggleDropdown);
            });
        }
    };
});
