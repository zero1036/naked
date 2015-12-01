(function() {
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
