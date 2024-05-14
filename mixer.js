(function() {
    console.log("Script loaded");

    function loadBuffer(source, context, fn) {
        console.log("Loading buffer for source:", source);
        var request = new XMLHttpRequest();
        request.open('GET', 'audio/' + source, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            if (request.status === 200) {
                context.decodeAudioData(request.response, function(buff) {
                    console.log("Audio data decoded for source:", source);
                    fn(buff);
                }, function(error) {
                    console.error("Error decoding audio data for source:", source, error);
                });
            } else {
                console.error("Failed to load audio file:", source);
            }
        };
        request.onerror = function() {
            console.error("Request error for source:", source);
        };
        request.send();
    }

    function audioCtx() {
        var audioCtx = (window.AudioContext || window.webkitAudioContext ||
            window.mozAudioContext || window.oAudioContext ||
            window.msAudioContext);
        if (audioCtx) {
            return new audioCtx();
        } else {
            alert('Web Audio not supported in this browser. Please use a modern browser such as Chrome or Firefox');
            return;
        }
    }

    function Daw() {
        console.log("Initializing DAW");
        var self = this;
        this.ctx = audioCtx();
        this.tracks = [];
        this.buffered = 0;
        this.bufferTracks(function() {
            console.log("All tracks buffered");
            self.mixer = new Mixer(self.ctx, self.tracks);
            self.hideLoader();
            self.showMixer();
            $('#play').click();
            self.initHints();
        });
    }

    Daw.prototype.showMixer = function() {
        console.log("Showing mixer");
        $('#mixer').show();
    }

    Daw.prototype.hideLoader = function() {
        console.log("Hiding loader");
        $('#loader').hide();
    }

    Daw.prototype.bufferTracks = function(cb) {
        var self = this;
        if (cb) this.cb = cb;
        this.populateLoader();
        loadBuffer(sources[this.buffered], this.ctx, function(buffer) {
            self.updateLoader(self.buffered);
            self.tracks.push({ 'buffer': buffer, 'name': sources[self.buffered] });
            self.buffered++;
            if (self.tracks.length === sources.length) {
                self.cb();
            } else {
                self.bufferTracks();
            }
        });
    }

    Daw.prototype.populateLoader = function() {
        $('#loader span.total').text(sources.length);
        $('#loader').show();
    }

    Daw.prototype.updateLoader = function(current) {
        $('#loader span.current').text(current + 1);
    }

    Daw.prototype.initHints = function() {
        var hintsClone = $('#hints').clone();
        $('#mixer').prepend(hintsClone).show();
        hintsClone.show();
        hintsClone.find('li').hover(function() {
            $(this).find('div').show();
        }, function() {
            $(this).find('div').hide();
        });
    }

    function init() {
        console.log("Page loaded, initializing DAW");
        new Daw();
    }

    var sources = [
        'Acous_Gtr.mp3', 'Strings.mp3', 'Bass_&_Drums.mp3', 'Mellotron.mp3',
        'Bck_vox.mp3', 'Stylophone.mp3', 'Vox.mp3', 'Flute_&_Cello.mp3'
    ];

    var channelTemplate = '<div class="channel"></div>';
    var rotaryKnobTemplate = '<div class="dial-container"><div class="notches"></div><div class="dial"><div class="dial-inner"></div></div></div>';
    window.addEventListener('load', init, false);
})();