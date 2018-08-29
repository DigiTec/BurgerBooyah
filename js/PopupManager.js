"use strict";

var PopupManager = (function () {
    var _popups = {};
    var _popupManager = {};


    function removeClass(classIn, classToRemove) {
        return classIn.split(' ').filter(function (elem) { return (elem != classToRemove); }).join(' ');
    }
    function addClass(classIn, classToAdd) {
        var classes = classIn.split(' ').filter(function (elem) { return (elem != classToAdd); });
        classes.push(classToAdd);
        return classes.join(' ');
    }
    
    Object.defineProperties(_popupManager, {
        setupPopups: {
            value: function setupPopups(popupOwner, popupClass) {
                this.popupClass = popupClass;
                this.popupOwner = document.getElementById(popupOwner);

                var popupIterator = this.popupOwner.firstElementChild;
                while (popupIterator !== null) {
                    if (popupIterator.className.split(' ').indexOf(this.popupClass) >= 0) {
                        _popups[popupIterator.id] = popupIterator;
                    }
                    popupIterator = popupIterator.nextElementSibling;
                }
            }
        },
        showPopup: {
            value: function showPopup(popupName, userCallbackOk, userCallbackCancel) {
                var popup = _popups[popupName];
                if (popup) {
                    var popupOwner = this.popupOwner;
                    var btnOk = popup.getElementsByClassName("popupButtonOk")[0];
                    var btnCancel = popup.getElementsByClassName("popupButtonCancel")[0];

                    var callbackOk = (function (evt) {
                        btnOk.removeEventListener("click", callbackOk);
                        btnCancel.removeEventListener("click", callbackCancel);
                        popup.className = removeClass(popup.className, "visible");
                        popupOwner.className = removeClass(popupOwner.className, "visible");

                        if (userCallbackOk) {
                            userCallbackOk(popup);
                        }
                    }).bind(this);
                    var callbackCancel = (function (evt) {
                        btnOk.removeEventListener("click", callbackOk);
                        btnCancel.removeEventListener("click", callbackCancel);
                        popup.className = removeClass(popup.className, "visible");
                        popupOwner.className = removeClass(popupOwner.className, "visible");

                        if (userCallbackCancel) {
                            userCallbackCancel(popup);
                        }
                    }).bind(this);

                    btnOk.addEventListener("click", callbackOk);
                    btnCancel.addEventListener("click", callbackCancel);

                    popup.className = addClass(popup.className, "visible");
                    popupOwner.className = addClass(popupOwner.className, "visible");
                }
            }
        }
    });
    return _popupManager;
})();