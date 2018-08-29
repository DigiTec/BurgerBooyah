function CustomerEntity(burger, screen) {
    this._burger = burger;
    this._screen = screen;
    this._positionX = 1400;
    this._positionY = 218;
    this._desiredX = -250;
    this._speed = 500;
    this._removeOnArrival = false;
    this._totalElapsedTime = 0;
    this._happinessElapsedTime = 0;
    this._happiness = CustomerEntity.HAPPINESS_HAPPY;

    var ownerDocument = this._screen.element.ownerDocument
    this._sprite = ownerDocument.createElement("div");
    this._head = ownerDocument.createElement("div");

    this._sprite.className = "customerEntity";
    this._sprite.style.left = this._positionX + "px";
    this._sprite.style.top = this._positionY + "px";
    
    this._head.className = "customerHead boy";
    this._sprite.appendChild(this._head);
    
    var offset = parseInt(Math.random()*5)*-280;
    
    this._sprite.style.background = "url('images/character_bodies_boy.png') " + offset + "px 0px no-repeat";
    this._screen.element.appendChild(this._sprite);

    this._sprite.addEventListener("click", this.onPointerDown.bind(this));

    this._screen.addEntity(this);
    this._screen.addCustomer(this);
}

Object.defineProperties(CustomerEntity, {
    HAPPINESS_HAPPY: {
        value: 1.2
    },
    HAPPINESS_ANNOYED: {
        value: 1.1
    },
    HAPPINESS_ANGRY: {
        value: 1.0
    },
});

Object.defineProperties(CustomerEntity.prototype, {
    update: {
        value: function update(elapsedTime) {

            var deltaDist = this._speed * elapsedTime / 1000;

            if (this._positionX > this._desiredX) {
                this._positionX = Math.max(this._positionX - deltaDist, this._desiredX);
            }
            else if (this._positionX < this._desiredX) {
                this._positionX = Math.min(this._positionX + deltaDist, this._desiredX);
            }

            if (this._positionX === this._desiredX) {
                if (this._removeOnArrival) {
                    // Arrived at the "removal" position (offscreen) so do final cleanup
                    this._screen.element.removeChild(this._sprite);
                    this._screen.removeEntity(this);
                }
                else if (this._orderContainer == null) {
                    // Arrived at original destination, show the order bubble
                    this.showOrder();
                }
            }

            this._sprite.style.left = this._positionX + "px";
            this._sprite.style.top = this._positionY + "px";
            this._totalElapsedTime += elapsedTime;

            var annoyedLimit = 8000;
            var angryLimit = 15000;
            var lostCustomerLimit = 22000;

            if ( this._orderContainer ) {
                this._happinessElapsedTime += elapsedTime;
                if (this._happinessElapsedTime < annoyedLimit) {
                    this._happiness = CustomerEntity.HAPPINESS_HAPPY;
                }
                else if (this._happinessElapsedTime < angryLimit) {
                    if ( this._happiness !== CustomerEntity.HAPPINESS_ANNOYED ) {
                        this._happiness = CustomerEntity.HAPPINESS_ANNOYED;
                        this._sprite.className = "customerEntity annoyed";
                        SoundManager.play("customerAnnoyed");
                    }
                }
                else if (this._happinessElapsedTime < lostCustomerLimit) {
                    if ( this._happiness !== CustomerEntity.HAPPINESS_ANGRY ) {
                        this._happiness = CustomerEntity.HAPPINESS_ANGRY;
                        this._sprite.className = "customerEntity angry";
                        SoundManager.play("customerAngry");
                    }
                }
                else {
                    this._screen.onLostCustomer();
                    this._sprite.className = "customerEntity leaving";
                    this.leaveStore();
                }
            }
        },
    },
    sprite: {
        get: function get_sprite() {
            return this._sprite;
        }
    },
    desiredX: {
        get: function get_desiredX() {
            return this._desiredX;
        },
        set: function set_desiredX(v) {
            this._desiredX = v;
        }
    },
    onPointerDown: {
        value: function _onPointerDown() {
            if (!this._removeOnArrival) {
                if (this._orderContainer && this._screen.isCustomerSatisfiedWithOrder(this)) {
                    this._sprite.className = "customerEntity satisfied";
                    this.leaveStore();
                }
            }
        }
    },
    leaveStore: {
        value: function leaveStore() {
            this._desiredX = -250;
            this._speed = 300;
            this._removeOnArrival = true;
            this._screen.removeCustomer(this);
            this.hideOrder();
        }
    },
    showOrder: {
        value: function _showOrder() {
            this._orderContainer = this._sprite.ownerDocument.createElement("div");
            this._orderContainer.className = "burgerOrderContainer";
            this._orderContainer.style.left = "-64px";
            this._orderContainer.style.top = "-64px";
            this._sprite.appendChild(this._orderContainer);

            var burgerHeight = BurgerVisualizer.computeBurgerHeight(this._burger);
            var bg = BurgerVisualizer.convertBurgerToCssBackground(this._burger, burgerHeight);

            var burgerOrder = this._sprite.ownerDocument.createElement("div");
            var padding = 20;
            burgerOrder.style.width = "64px";
            burgerOrder.style.height = burgerHeight + "px";
            burgerOrder.style.left = "34px";
            burgerOrder.style.top = padding + "px";
            burgerOrder.style.position = "absolute";
            burgerOrder.style.background = bg;
            this._orderContainer.appendChild(burgerOrder);

            this._orderContainer.style.height = burgerHeight + 2 * padding + "px";
        }
    },

    hideOrder: {
        value: function _hideOrder() {
            if (this._orderContainer) {
                this._sprite.removeChild(this._orderContainer);
                delete this._orderContainer;
            }
        }
    },
});