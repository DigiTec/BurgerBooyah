function PlayScreen(element) {
    this._element = element;
    this._customers = new Array();
    this._entities = new Array();
    this._gameEngine = new GameEngine(this);
    this._firstCustomerPosition = 210;
    this._offsetPerCustomer = 280;
    this._playerBurger = new Array();
    this._burgerView = this._element.ownerDocument.getElementById("playerBurger");
    this._onIngredient = this.onIngredient.bind(this);
    this._onTrash = this.onTrash.bind(this);
    this._isGameOver = false;
    this._konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    this._konamiOffset = 0;
    
    var ingredientButtons = this._element.getElementsByClassName("ingredient");
    for (var i = 0; i < ingredientButtons.length; i++) {
        var ingredientButton = ingredientButtons[i];
        ingredientButton.addEventListener("click", this._onIngredient);
        switch(ingredientButton.id) {
            case "ingredientBunBottom":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_BUNBOTTOM;
                break;
            case "ingredientBunMiddle":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_BUNMIDDLE;
                break;
            case "ingredientBunTop":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_BUNTOP;
                break;
            case "ingredientPatty":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_PATTY;
                break;
            case "ingredientLettuce":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_LETTUCE;
                break;
            case "ingredientCheese":
                ingredientButton.ingredient = BurgerBuilder.INGREDIENT_CHEESE;
                break;
        }
    }
    
    // Connect up to the trash
    this._playerTrash = this._element.ownerDocument.getElementById("playerTrash");
    this._playerTrash.addEventListener("click", this._onTrash);
    
    // Connect up to the score
    this._playerScore = this._element.ownerDocument.getElementById("playerScore");
    this._playerScore.innerText = "$" + this._gameEngine._currentScore.toFixed(2);

    // Connect up to the level meter
    this._playerLevel = this._element.ownerDocument.getElementById("playerLevel");
    this._playerLevel.innerText = this._gameEngine.levelName;

    // Connect up to the player lives
    this._playerLives = this._element.ownerDocument.getElementById("playerLives");
    this._playerLives.innerText = this._gameEngine._currentLives;
    
    this._element.ownerDocument.addEventListener("keydown", this.onKeyDown.bind(this));
}

Object.defineProperties(PlayScreen.prototype, {
    update: {
        value: function update(elapsedTime) {
            if (!this._isGameOver) {
                this._gameEngine.update(elapsedTime);
            }

            for (var i = 0; i < this._entities.length; i++) {
                this._entities[i].update(elapsedTime);
            }

            // Determine the currently built player burger and update the burger view
            var background = "white";            
            if ( this._playerBurger && this._playerBurger.length > 0 ) {
                background = BurgerVisualizer.convertBurgerToCssBackground(this._playerBurger, 200);
            }
            this._burgerView.style.background = background;

            // Update the scoring UI
            this._playerScore.innerText = "$" + this._gameEngine._currentScore.toFixed(2);
            this._playerLevel.innerText = this._gameEngine.levelName;
            this._playerLives.innerText = this._gameEngine._currentLives;
        },
    },
    addEntity: {
        value: function _addCustomer(entity) {
            this._entities.push(entity);
        },
    },
    removeEntity: {
        value: function _removeCustomer(entity) {
            this._entities.splice(this._entities.indexOf(entity), 1);
        },
    },
    addCustomer: {
        value: function _addCustomer(customer) {
            customer.desiredX = this._firstCustomerPosition + (this._offsetPerCustomer * this._customers.length);
            this._customers.push(customer);
        },
    },
    removeCustomer: {
        value: function _removeCustomer(customer) {
            this._customers.splice(this._customers.indexOf(customer), 1);

            for (var i = 0; i < this._customers.length; i++) {
                this._customers[i].desiredX = this._firstCustomerPosition + (this._offsetPerCustomer * i);
            }
        },
    },
    addIngredient: {
        value: function addIngredient(ingredient) {
            var currentIngredient = BurgerBuilder.INGREDIENT_NONE;
            if (this._playerBurger.length > 0) {
                currentIngredient = this._playerBurger[this._playerBurger.length - 1];
            }
            
            if (BurgerBuilder.canStack(ingredient, currentIngredient)) {
                if ( ingredient === BurgerBuilder.INGREDIENT_PATTY ) {
                    SoundManager.play("burgerPatty");
                }
                else {
                    SoundManager.play("burgerIngredient");
                }
                this._playerBurger.push(ingredient);
            }
            else {
                SoundManager.play("burgerBadIngredient");
            }
        }
    },
    isCustomerSatisfiedWithOrder: {
        value: function isCustomerSatisfiedWithOrder(customer) {
            if (BurgerBuilder.isSameBurger(this._playerBurger, customer._burger)) {
                this._gameEngine.scoreCustomer(customer);
                this._playerBurger = [];
                return true;
            }
            
            return false;
        }
    },
    onIngredient: {
        value: function onIngredient(evt) {
            var originalButton = evt.target;
            if ( originalButton.ingredient ) {
                this.addIngredient(originalButton.ingredient);
            }
        }
    },
    onTrash: {
        value: function onTrash(evt) {
            if (this._playerBurger.length > 0) {
                this._playerBurger = [];

                if ( Math.random() >= 0.5 ) {
                    SoundManager.play("trashLater");
                }
                else {
                    SoundManager.play("trashPaycheck");
                }
            }
        }
    },
    onScoreUpdated: {
        value: function onScoreUpdated(newScore) {
            SoundManager.play("cashRegister");
        },
    },
    onLevelUpdated: {
        value: function onLevelUpdated(newLevel) {
            var levelClip = "level" + this._gameEngine._currentLevel;
            if (!SoundManager.hasSound(levelClip)) {
                levelClip = "levelup";
            }
            SoundManager.play(levelClip);
        },
    },
    onLostCustomer: {
        value: function onLostCustomer() {
            SoundManager.play("customerWalkOut");
            this._gameEngine.loseCustomer();
            if (this._gameEngine._currentLives === 0) {
                this.onGameOver();
            }
        },
    },
    onGameOver: {
        value: function onLostCustomer() {
            this._isGameOver = true;
            for (var i = this._customers.length - 1; i >= 0; i--) {
                this._customers[i].leaveStore();
            }

            SoundManager.stopAll();
            SoundManager.play("gameOverNormal");
            PopupManager.showPopup("gameOverPopup", null, null);
        },
    },
    onKeyDown: {
        value: function onKeyDown(evt) {
            if (ScreenManager.currentScreen === this._element) {
                if (evt.which === this._konamiCode[this._konamiOffset]) {
                    this._konamiOffset++;
                    if (this._konamiOffset === this._konamiCode.length) {
                        SoundManager.play("konami");
                        this._gameEngine._currentLives = 30;
                        this._konamiOffset = 0;
                    }
                }
                else {
                    if (this._konamiOffset >= 2) {
                        SoundManager.play("loser");
                    }
                    this._konamiOffset = 0;
                }
            }
        },
    },
    customerCount: {
        get: function get_customerCount() {
            return this._customers.length;
        },
    },
    element: {
        get: function get_element() {
            return this._element;
        },
    },
});