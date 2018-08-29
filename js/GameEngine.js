function GameEngine(screen) {
  this._screen = screen;

  this._spawnElapsed = 3 * 1000; // The first spawn will come early
  this._currentScore = 0.0;
  this._maxCustomers = 4;
  this._currentLevel = 1;
  this._currentLives = 1;
}

(function() {
  var _scoreToLevelConverter = [
    0,
    24.75,
    51.15,
    79.2,
    123.75,
    170.775,
    233.475,
    296.175,
    380.655,
    476.685,
    584.485
  ];
  // var _scoreToLevelConverter = [ 0, 42, 90, 146, 210, 284, 362, 446, 535, 632, 740 ];
  var _levelToTileConverter = [
    "Tutorial",
    "Just Burgers",
    "In Comes the Big Cheese!",
    "It's On the House!",
    "Make Mine a Double!!",
    "You're the Mac Daddy!",
    "Training Wheels Off",
    "Your Burger, Your Way!",
    "Shoot for a High Score!!!"
  ];

  Object.defineProperties(GameEngine.prototype, {
    update: {
      value: function update(elapsedTime) {
        this._spawnElapsed += elapsedTime;

        if (
          this._spawnElapsed >= this.currentSpawnDuration &&
          this._screen.customerCount < this._maxCustomers
        ) {
          var burger;
          if (this._currentLevel <= 5 || Math.random() < 0.8) {
            var knownBurgerMax = Math.min(
              BurgerBuilder.CUSTOM_BURGERS.length,
              this._currentLevel
            );
            burger = BurgerBuilder.knownBurger(
              parseInt(Math.random() * knownBurgerMax)
            );
          } else {
            var maxIngredients = Math.min(this._currentLevel, 10);
            burger = BurgerBuilder.randomIngredientBurger(
              BurgerBuilder.MIN_INGREDIENTS,
              maxIngredients
            );
          }

          var customer = new CustomerEntity(burger, this._screen);
          this._spawnElapsed = 0;
        }
      }
    },

    scoreCustomer: {
      value: function scoreCustomer(customer) {
        this._currentScore +=
          (3 + customer._burger.length * 0.25) * customer._happiness;
        this._screen.onScoreUpdated(this._currentScore);

        var targetScore = _scoreToLevelConverter[this._currentLevel];
        if (targetScore < this._currentScore) {
          this._currentLevel++;

          // Add another level for the user.
          if (_scoreToLevelConverter[this._currentLevel] === undefined) {
            _scoreToLevelConverter.push(targetScore * 1.25);
          }
          this._screen.onLevelUpdated(this._currentLevel);
        }
      }
    },

    loseCustomer: {
      value: function loseCustomer() {
        if (this._currentLives > 0) {
          this._currentLives--;
        }
      }
    },

    currentSpawnDuration: {
      get: function get_currentSpawnDuration() {
        if (this._currentLevel <= BurgerBuilder.CUSTOM_BURGERS.length) {
          return 5000;
        }

        return Math.max(
          3000,
          5000 -
            (this._currentLevel - BurgerBuilder.CUSTOM_BURGERS.length) * 200
        );
      }
    },

    levelName: {
      get: function get_levelName() {
        if (this._currentLevel < _levelToTileConverter.length) {
          return _levelToTileConverter[this._currentLevel];
        } else {
          return _levelToTileConverter[_levelToTileConverter.length - 1];
        }
      }
    }
  });
})();
