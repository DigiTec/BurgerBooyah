var SoundManager = (function () {
    var _audioManager = {};
    var _singles = {};
    var _instances = {};
    var _currentSingle;
    var _currentInstances = [];

    function onEnded(evt) {
        var numInstances = _currentInstances.length; 
        for (var i = 0; i < numInstances; i++) {
            if ( _currentInstances[i] === evt.target ) {
                _currentInstances.splice(i, 1);
            }
        }
    }

    Object.defineProperties(_audioManager, {
        setupAudio: {
            value: function setupAudio(audioHostId, singlesContainerId, instancesContainerId) {
                this.audioHost = document.getElementById(audioHostId);

                var audioIterator = this.audioHost.firstElementChild;
                while (audioIterator !== null) {
                    switch(audioIterator.id) {
                        case singlesContainerId:
                            var singles = audioIterator.getElementsByTagName("audio");
                            if (singles) {
                                var numSingles = singles.length;
                                for (var i = 0; i < numSingles; i++) {
                                    var single = singles[i];
                                    if (!single.disabled)
                                    {
                                        _singles[single.id] = single;
                                    }
                                }
                            }
                            break;

                        case instancesContainerId:
                            var instances = audioIterator.getElementsByTagName("audio");
                            if (instances) {
                                var numInstances = instances.length;
                                for (var i = 0; i < numInstances; i++) {
                                    var instance = instances[i];
                                    _instances[instance.id] = instance;
                                }
                            }
                            break;
                    }
                    audioIterator = audioIterator.nextElementSibling;
                }
            }
        },
        play: {
            value: function playAudio(clipId) {
                if ( _singles[clipId] ) {
                    if ( _currentSingle ) {
                        _currentSingle.pause();
                        _currentSingle.currentTime = 0;
                        _currentSingle = undefined;
                    }
                
                    _currentSingle = _singles[clipId];
                    _currentSingle.currentTime = 0;
                    _currentSingle.volume = this.volumeSoundEffects;
                    _currentSingle.play();
                }
                else if ( _instances[clipId] ) {
                    var originalInstance = _instances[clipId];
                    var playInstance = originalInstance;
                    if ( this.soundInstancing ) {
                        playInstance = originalInstance.cloneNode(true);
                    }
                    else {
                        playInstance.currentTime = 0;
                    }

                    _currentInstances.push(playInstance);                    
                    playInstance.addEventListener("ended", onEnded);
                    playInstance.addEventListener("error", onEnded);
                    playInstance.volume = this.volumeSoundEffects;
                    playInstance.play();
                }
            }
        },
        stopAll: {
            value: function stopAll() {
                var localInstances = _currentInstances;
                _currentInstances = [];
                
                var numInstances = localInstances.length;
                for (var i = 0; i < numInstances; i++) {
                    var localInstance = localInstances[i];
                    localInstance.removeEventListener("ended", onEnded);
                    localInstance.removeEventListener("error", onEnded);
                    localInstance.pause();
                }
            },
        },
        hasSound: {
            value: function hasSound(clipId) {
                return (_singles[clipId] || _instances[clipId]);
            },
        },
        
        volumeMusic: {
            value: 1.0,
            writable: true
        },
        volumeSoundEffects: {
            value: 1.0,
            writable: true
        },
        
        soundInstancing: {
            value: false,
            writable: true
        }
    });
    return _audioManager;
})();