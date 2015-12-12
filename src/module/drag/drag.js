var dragEvtHandler = function() {
    var dragEvtHandler = function(opts) {
        this.isLog = true;
        this.outer = opts.outer;
        this.log = function(msg) {
            if (this.isLog) {
                console.log(msg);
            }
        };
        this.bindHandler = function() {
            var outer = this.outer;
            var device = this._device();
            if (!device.hasTouch) {
                outer.style.cursor = 'pointer';
                outer.ondragstart = function(evt) {
                    if (evt) {
                        return false;
                    }
                    return true;
                };
            }
            outer.addEventListener(device.startEvt, this);
            outer.addEventListener(device.moveEvt, this);
            outer.addEventListener(device.endEvt, this);
            window.addEventListener('orientationchange', this);
        };
        this.handleEvent = function(evt) {
            var device = this._device();
            switch (evt.type) {
                case device.startEvt:
                    this.startHandler(evt);
                    break;
                case device.moveEvt:
                    this.moveHandler(evt);
                    break;
                case device.endEvt:
                    this.endHandler(evt);
                    break;
                case 'touchcancel':
                    this.endHandler(evt);
                    break;
                case 'orientationchange':
                    //this.orientationchangeHandler();
                    break;
                case 'focus':
                    //this.isAutoplay && this.play();
                    break;
                case 'blur':
                    //this.pause();
                    break;
            }
        };
        //
        this._device = function() {
            var hasTouch = !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
            var startEvt = hasTouch ? 'touchstart' : 'mousedown';
            var moveEvt = hasTouch ? 'touchmove' : 'mousemove';
            var endEvt = hasTouch ? 'touchend' : 'mouseup';
            return {
                hasTouch: hasTouch,
                startEvt: startEvt,
                moveEvt: moveEvt,
                endEvt: endEvt
            };
        };
        this.startHandler = function(evt) {
            evt.preventDefault();
            this._startHandler(evt);
            this.log("start");
        };
        this.moveHandler = function(evt) {
            evt.preventDefault();
            this._moveHandler(evt);
            this.log("isMoving:" + this.isMoving);

        };
        this.endHandler = function(evt) {
            evt.preventDefault();
            this._endHandler(evt);
            this.log("end:" + this.isMoving);
        };

        this.bindHandler();
    };

    dragEvtHandler.prototype.extend = function(plugin, main) {
        if (!main) {
            main = dragEvtHandler.prototype;
        }
        Object.keys(plugin).forEach(function(property) {
            Object.defineProperty(main, property, Object.getOwnPropertyDescriptor(plugin, property));
        });
    };

    return dragEvtHandler;
}();

dragEvtHandler.prototype.extend({
    _startHandler: function(evt) {
        var device = this._device();
        this.isMoving = true;
        this.startX = device.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
        this.startY = device.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;
    },
    _moveHandler: function(evt) {
        if (this.isMoving) {
            var device = this._device();

            var offset = {
                X: device.hasTouch ? evt.targetTouches[0].pageX - this.startX : evt.pageX - this.startX,
                Y: device.hasTouch ? evt.targetTouches[0].pageY - this.startY : evt.pageY - this.startY
            };

            // dom.style.webkitTransformOrigin = '2% 40%';
            this.outer.style.webkitTransition = 'all 0s ease';
            this.outer.style.webkitTransform = 'translate(' + offset.X + 'px,' + offset.Y + 'px)';
        }
    },
    _endHandler: function(evt) {
        this.isMoving = false;
        this.outer.style.webkitTransition = 'all .3s ease';
        this.outer.style.webkitTransform = 'translate(0px,0px)';
    }
});

angular.module('nd.drag', ['ngAnimate'])

.directive('ndDrag', function() {
    return {
        scope: {},
        link: function(scope, ele, attr, ctrl) {
            var _handler = new dragEvtHandler({
                outer: ele[0]
            });
        }
    };
});
