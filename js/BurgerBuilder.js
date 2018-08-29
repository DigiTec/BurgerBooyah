function BurgerBuilder()
{
}

BurgerBuilder.prototype = Object.create(null);
BurgerBuilder.prototype.constructor = BurgerBuilder;

(function () {
    var _ingredientNone = 0;
    var _ingredientBunBottom = 1;
    var _ingredientBunMiddle = 2;
    var _ingredientBunTop = 3;
    var _ingredientPatty = 4;
    var _ingredientLettuce = 5;
    var _ingredientCheese = 6;

    var _ingredientCombos = [
        [ _ingredientBunBottom ],
        [ _ingredientPatty ],
        [ _ingredientPatty ],
        [ ],
        [ _ingredientBunMiddle, _ingredientBunTop, _ingredientPatty, _ingredientLettuce, _ingredientCheese ],
        [ _ingredientBunMiddle, _ingredientBunTop ],
        [ _ingredientBunMiddle, _ingredientBunTop, _ingredientLettuce ]
    ];

    Object.defineProperties(BurgerBuilder, {
        INGREDIENT_NONE: {
            value: _ingredientNone
        },
        INGREDIENT_MIN: {
            value: _ingredientBunBottom
        },
        INGREDIENT_BUNBOTTOM: {
            value: _ingredientBunBottom
        },
        INGREDIENT_BUNMIDDLE: {
            value: _ingredientBunMiddle
        },
        INGREDIENT_BUNTOP: {
            value: _ingredientBunTop
        },
        INGREDIENT_PATTY: {
            value: _ingredientPatty
        },
        INGREDIENT_LETTUCE: {
            value: _ingredientLettuce
        },
        INGREDIENT_CHEESE: {
            value: _ingredientCheese
        },
        INGREDIENT_MAX: {
            value: _ingredientCheese
        },
        INGREDIENT_NAMES: {
            value: [ "", "bottom bun", "middle bun", "top bun", "patty", "lettuce", "cheese" ]
        },

        BURGER_PLAIN: {
            value: 0
        },
        BURGER_CHEESE: {
            value: 1
        },
        BURGER_SALAD: {
            value: 2
        },
        BURGER_DOUBLE: {
            value: 3
        },
        BURGER_BIGMAC: {
            value: 4
        },
        BURGER_MAX: {
            value: 5
        },
        BURGER_NAMES: {
            value: [ "plain burger", "cheeseburger", "salad burger", "double burger", "big mac" ]
        },
        
        MIN_INGREDIENTS: {
            value: 3
        },

        CUSTOM_BURGERS: {
            value: [
                [ _ingredientBunBottom, _ingredientPatty, _ingredientBunTop ],
                [ _ingredientBunBottom, _ingredientPatty, _ingredientCheese, _ingredientBunTop ],
                [ _ingredientBunBottom, _ingredientPatty, _ingredientCheese, _ingredientLettuce, _ingredientBunTop ],
                [ _ingredientBunBottom, _ingredientPatty, _ingredientPatty, _ingredientCheese, _ingredientLettuce, _ingredientBunTop ],
                [ _ingredientBunBottom, _ingredientPatty, _ingredientBunMiddle, _ingredientPatty, _ingredientCheese, _ingredientLettuce, _ingredientBunTop ],
            ]
        },

        canStack: {
            value: function canStack(newIngredient, currentIngredient) {
                switch(newIngredient)
                {
                    case BurgerBuilder.INGREDIENT_BUNBOTTOM:
                        switch(currentIngredient)
                        {
                            case BurgerBuilder.INGREDIENT_NONE:
                                return true;
                            default:
                                return false;
                        }
                        break;

                    case BurgerBuilder.INGREDIENT_BUNMIDDLE:
                    case BurgerBuilder.INGREDIENT_BUNTOP:
                        switch(currentIngredient)
                        {
                            case BurgerBuilder.INGREDIENT_PATTY:
                            case BurgerBuilder.INGREDIENT_CHEESE:
                            case BurgerBuilder.INGREDIENT_LETTUCE:
                                return true;
                            default:
                                return false;
                        }
                        break;

                    case BurgerBuilder.INGREDIENT_PATTY:
                        switch(currentIngredient)
                        {
                            case BurgerBuilder.INGREDIENT_BUNBOTTOM:
                            case BurgerBuilder.INGREDIENT_BUNMIDDLE:
                            case BurgerBuilder.INGREDIENT_PATTY:
                                return true;
                            default:
                                return false;
                        }
                        break;

                    case BurgerBuilder.INGREDIENT_LETTUCE:
                        switch(currentIngredient)
                        {
                            case BurgerBuilder.INGREDIENT_PATTY:
                            case BurgerBuilder.INGREDIENT_CHEESE:
                                return true;
                            default:
                                return false;
                        }
                        break;

                    case BurgerBuilder.INGREDIENT_CHEESE:
                        switch(currentIngredient)
                        {
                            case BurgerBuilder.INGREDIENT_PATTY:
                                return true;
                            default:
                                return false;
                        }
                        break;

                    default:
                        throw "Invalid New Ingredient";
                }
            },
        },

        isSameBurger: {
            value: function isSameBurger(burgerLeft, burgerRight) {
                if ( burgerLeft.length !== burgerRight.length )
                {
                    return false;
                }

                for (var i = 0; i < burgerLeft.length; i++)
                {
                    if ( burgerLeft[i] !== burgerRight[i] )
                    {
                        return false;
                    }
                }
                return true;
            }
        },

        knownBurger: {
            value: function knownBurger(burgerType) {
                return BurgerBuilder.CUSTOM_BURGERS[burgerType].slice(0);
            },
        },

        randomIngredientBurger: {
            value: function randomIngredientBurger(minIngredients, maxIngredients) {
                var burger = [];
                if ( minIngredients < 3 ) {
                    throw "You have to have at least 3 ingredients to build a burger.";
                }
                var trueMax = Math.max(maxIngredients || minIngredients, minIngredients);
                var randMax = Math.round((Math.random()*(trueMax - minIngredients))+minIngredients);

                var currentIngredient = BurgerBuilder.INGREDIENT_NONE;
                while (burger.length < randMax)
                {
                    var currentIngredientList = _ingredientCombos[currentIngredient];
                    var newIngredient = currentIngredientList[parseInt(Math.random()*currentIngredientList.length)];
                    if (!BurgerBuilder.canStack(newIngredient, currentIngredient))
                    {
                        throw "Our ingredientCombos are messed up!";
                    }
                    
                    // The last two items have to mesh well for a good burger!
                    if ( burger.length == randMax - 2 )
                    {
                        if (BurgerBuilder.canStack(BurgerBuilder.INGREDIENT_BUNTOP, newIngredient))
                        {
                            burger.push(newIngredient);
                        }
                        burger.push(BurgerBuilder.INGREDIENT_BUNTOP);
                        break;
                    }
                    else if ( newIngredient != BurgerBuilder.INGREDIENT_BUNTOP )
                    {
                        currentIngredient = newIngredient;
                        burger.push(newIngredient);
                    }
                }
                return burger;
            }
        },
    });
})();

function BurgerVisualizer()
{
}

BurgerVisualizer.prototype = Object.create(null);
BurgerVisualizer.prototype.constructor = BurgerVisualizer();

var _ingredientToImageMap = [
    "",
    "url(images/bun_bottom.png)",
    "url(images/bun_middle.png)",
    "url(images/bun_top.png)",
    "url(images/patty.png)",
    "url(images/lettuce.png)",
    "url(images/cheese.png)"
];

Object.defineProperties(BurgerVisualizer, {
    convertBurgerToCssBackground: {
        value: function convertBurgerToCssBackground(burger, targetHeight) {
            var currentOffset = targetHeight - 40;
            var images = new Array();
            for (var i = 0; i < burger.length; i++)
            {
                images.push(_ingredientToImageMap[burger[i]] + "0px " + currentOffset + "px no-repeat");
                currentOffset -= 10;
            }
            images.reverse();
            return images.join(",");
        }
    },
    
    computeBurgerHeight: {
        value: function computeBurgerHeight(burger) {
            return (40 + burger.length * 10);
        }
    },
});