function AnimationOptions(timeToBlend) {
  this.timeToBlend = timeToBlend || 1000;
}

function BlendAnimationOptions(timeToBlend) {
  AnimationOptions.call(this, timeToBlend || 500);
}
BlendAnimationOptions.prototype = Object.create(AnimationOptions.prototype);
BlendAnimationOptions.prototype.constructor = BlendAnimationOptions;

function CardSwapAnimationOptions(timeToBlend) {
  AnimationOptions.call(this, timeToBlend || 1500);
}
CardSwapAnimationOptions.prototype = Object.create(AnimationOptions.prototype);
CardSwapAnimationOptions.prototype.constructor = CardSwapAnimationOptions;

function SwipeAnimationOptions(timeToBlend, swipeDirection, blendOpacity) {
  AnimationOptions.call(this, timeToBlend || 600);
  this.swipeDirection =
    swipeDirection || SwipeAnimationOptions.SWIPEDIRECTION_RIGHT;
  this.blendOpacity = blendOpacity;
}
SwipeAnimationOptions.prototype = Object.create(AnimationOptions.prototype);
SwipeAnimationOptions.prototype.constructor = SwipeAnimationOptions;

Object.defineProperties(SwipeAnimationOptions, {
  SWIPEDIRECTION_TOP: { value: 1 },
  SWIPEDIRECTION_LEFT: { value: 2 },
  SWIPEDIRECTION_RIGHT: { value: 3 },
  SWIPEDIRECTION_BOTTOM: { value: 4 }
});

function blendTransition(from, to, finalizer) {
  this.startTime = new Date();
  this.from = from;
  this.to = to;
  this.finalizer = finalizer;
  this.callback = blendTransitionCallback.bind(this);
  this.callback();
  window.setTimeout(this.callback, 16);
}

function blendTransitionCallback() {
  var offset = new Date() - this.startTime;
  var opacity = Math.min(1.0, 1.0 * (offset / this.timeToBlend));

  this.to.style.opacity = opacity;
  if (opacity == 1.0) {
    this.from.style.opacity = opacity;
    this.finalizer(this.from, this.to);
  } else {
    this.from.style.opacity = 1.0 - opacity;
    window.setTimeout(this.callback, 16);
  }
}

var SwipeTransition = (function() {
  var transitionFunc = function swipeTransition(from, to, finalizer) {
    this.startTime = new Date();
    this.from = from;
    this.from.style.zIndex = 0;
    this.to = to;
    this.to.style.zIndex = 1;
    this.finalizer = finalizer;
    this.startPositionX = 0;
    this.startPositionY = 0;
    switch (this.swipeDirection) {
      case SwipeAnimationOptions.SWIPEDIRECTION_TOP:
        this.startPositionY = -from.offsetHeight;
        break;
      case SwipeAnimationOptions.SWIPEDIRECTION_LEFT:
        this.startPositionX = -from.offsetWidth;
        break;
      case SwipeAnimationOptions.SWIPEDIRECTION_RIGHT:
        this.startPositionX = from.offsetWidth;
        break;
      case SwipeAnimationOptions.SWIPEDIRECTION_BOTTOM:
        this.startPositionY = from.offsetHeight;
        break;
    }
    this.callback = swipeTransitionCallback.bind(this);
    this.callback();
    window.setTimeout(this.callback, 16);
  };

  function swipeTransitionCallback() {
    var offset = new Date() - this.startTime;
    var offsetLerp = Math.min(1.0, 1.0 * (offset / this.timeToBlend));
    var currentX = this.startPositionX - this.startPositionX * offsetLerp;
    var currentY = this.startPositionY - this.startPositionY * offsetLerp;
    var currentOpacity = 1.0;
    if (this.blendOpacity) {
      currentOpacity = offsetLerp;
    }

    if (offsetLerp == 1.0) {
      this.to.style.left = "0px";
      this.to.style.top = "0px";
      this.to.style.zIndex = 0;
      this.to.style.opacity = 1.0;
      this.finalizer(this.from, this.to);
    } else {
      this.to.style.left = currentX + "px";
      this.to.style.top = currentY + "px";
      this.to.style.opacity = currentOpacity;
      window.setTimeout(this.callback, 16);
    }
  }

  return transitionFunc;
})();

var ScreenManager = (function() {
  var _currentScreen;
  var _screens = {};
  var _screenManager = {};

  function removeClass(classIn, classToRemove) {
    return classIn
      .split(" ")
      .filter(function(elem) {
        return elem != classToRemove;
      })
      .join(" ");
  }
  function addClass(classIn, classToAdd) {
    var classes = classIn.split(" ").filter(function(elem) {
      return elem != classToAdd;
    });
    classes.push(classToAdd);
    return classes.join(" ");
  }

  Object.defineProperties(_screenManager, {
    setupScreens: {
      value: function setupScreens(screenOwner, classScreen, classShow) {
        this.classShow = classShow;
        this.classScreen = classScreen;
        this.screenOwner = document.getElementById(screenOwner);

        var screenIterator = this.screenOwner.firstElementChild;
        while (screenIterator !== null) {
          if (
            screenIterator.className.split(" ").indexOf(this.classScreen) >= 0
          ) {
            _screens[screenIterator.id] = screenIterator;
            screenIterator.className = removeClass(
              screenIterator.className,
              classShow
            );
          }
          screenIterator = screenIterator.nextElementSibling;
        }
      }
    },
    transitionToScreen: {
      value: function transitionToScreen(screenName, transition) {
        var finalizeTransition = function finalizeTransition(from, to) {
          if (_currentScreen) {
            _currentScreen.className = removeClass(
              _currentScreen.className,
              this.classShow
            );
            _currentScreen = null;
          }

          if (to) {
            to.className = addClass(to.className, this.classShow);
            _currentScreen = to;
          }
        }.bind(this);

        var screen = _screens[screenName];
        if (transition) {
          screen.className = addClass(screen.className, this.classShow);
          transition(_currentScreen, screen, finalizeTransition);
        } else {
          finalizeTransition(_currentScreen, screen);
        }
      }
    },
    currentScreen: {
      get: function get_currentScreen() {
        return _currentScreen;
      }
    }
  });
  return _screenManager;
})();
