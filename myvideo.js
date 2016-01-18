window.onload = init;
var video;
var effectFunction = null;
var dir = 'video/';
var videos = {
    video1: 'demovideo1',
    video2: 'demovideo2'
};

//set up video event handler je ovo
function setVideo(e) {
    var selectedVideo = e.target;
    var id = selectedVideo.id;
    if (id === 'video1') {
        video.src = dir + videos[id] + getExtention();
        play(video, true);
        pushUnpush(id, ['video2']);
    } else {
        video.src = dir + videos[id] + getExtention();
        play(video, true);
        pushUnpush(id, ['video1']);
    }
}

//helper for playing
function play(video, bool) {
    if (video.ended || bool) {
        video.load();
    }
    video.play();
    pushUnpush('play', ['pause']);
}

//helper for determin can it play
function getExtention() {
    var video = document.getElementById('video');
    if (video.canPlayType('video/webm') !== '') {
        return '.webm';
    } else if (video.canPlayType('video/mp4') !== '') {
        return '.mp4';
    } else {
        video.poster = 'images/technicaldifficulties.jpg';
    }
}

function init() {
    //setting up
    video = document.getElementById('video');
    video.src = dir + videos.video1 + getExtention();
    pushUnpush('video1', ['video2']);
    pushUnpush('normal', ['']);
    video.load();
    video.poster = 'images/prerollposter.jpg';

    addEventListener('click', handleControl);

    var videoSelection = document.getElementById('videoSelection');
    videoSelection.addEventListener('click', setVideo, false);

    var effects = document.getElementById('effects');
    effects.addEventListener('click', setEffect);

    video.addEventListener('play', processFrame, false);

    //unpushing button after video has ended
    video.addEventListener('ended', function () {
        pushUnpush('play', ['play']);
    }, false);
}

//taking care of effects
function setEffect(e) {
    var id = e.target.id;
    var effects = {
        normal: function () {
            pushUnpush('normal', ['western', 'noir', 'scifi']);
            effectFunction = null;
        },
        western: function () {
            pushUnpush('western', ['normal', 'noir', 'scifi']);
            effectFunction = western;

        },
        noir: function () {
            pushUnpush('noir', ['normal', 'western', 'scifi']);
            effectFunction = noir;

        },
        scifi: function () {

            pushUnpush('scifi', ['normal', 'western', 'noir']);
            effectFunction = scifi;
        }
    };
    //ugly way to invoke function
    effects[id]();

}

//ovo je moj event handler podesen na play
function processFrame() {
    var video = document.getElementById('video');
    var bufferC = document.getElementById('buffer');
    var displayC = document.getElementById('display');

    var buffer = bufferC.getContext('2d');
    var display = displayC.getContext('2d');

    //ubacujem frejm u buffer
    buffer.drawImage(video, 0, 0, bufferC.width, bufferC.height);

    // uzimam frejm iz buffera i sejvujem ga u varijabilu na daljnju obradu
    var frejm = buffer.getImageData(0, 0, bufferC.width, bufferC.height);

    //ustanovi koliko frejm ima pixlea da loopuje
    //data.length sadrzi sve vrijednosti pixela 1px ima 4 vrijednosti RGB/A
    //zato data.length sadrzi 4x vise vrijednosti nego pixela

    var numOfPixels = frejm.data.length / 4; // =>345 600
    for (var i = 0; i < numOfPixels; i++) {
        //this little shit have 4 values inside and it uses some fucked up type array
        // I mean other type of array
        var r = frejm.data[i * 4 + 0];
        var g = frejm.data[i * 4 + 1];
        var b = frejm.data[i * 4 + 2];
        var a = frejm.data[i * 4 + 3];
        var singlePixel = [r, g, b, a];
        if (effectFunction) {
            //ova funkcija obradjuje jedan piksel i treba ju pozvati 345k puta
            // za svaki frejm :) mind blown
            //prebacujem i referencu na objekt frejma tako da ga moze 'fizicki obraditi'
            effectFunction(i, r, g, b, frejm.data);
        }
    }
    display.putImageData(frejm, 0, 0);
    setTimeout(processFrame, 0);
}

function scifi(pos, r, g, b, data) {
    var offset = pos * 4;
    data[offset] = Math.round(255 - r);
    data[offset + 1] = Math.round(255 - g);
    data[offset + 2] = Math.round(255 - b);
}

function handleControl(e) {

    var ancore = e.target;
    var id = ancore.id;
    if (id === 'play') {
        //pusch play, unpush pause
        video.play();
        pushUnpush('play', ['pause']);

    } else if (id === 'pause') {
        // push pause, unpush play
        video.pause();
        pushUnpush('pause', ['play']);
    }

    if (id === 'mute') {
        //this can be push or unpushed no relation with others
        pushUnpush('mute', []);
        video.muted = !video.muted;
    }

    if (id === 'loop') {
        // unrelated to others
        pushUnpush('loop', []);
        video.loop = !video.loop;
    }
}

//handles interface of buttons pop up and down
function pushUnpush(id, arrayIds) {
    var ancore = document.getElementById(id);
    //DOMTokenList slicno node lst ali sa mnogo manje metoda, koje su mnogo mocne
    var classes = ancore.classList;
    if (classes.toggle('selected')) {
        ancore.style.backgroundImage = 'url(images/' + ancore.id + 'pressed.png)';
        if (arrayIds[0]) {
            for (var i = 0; i < arrayIds.length; i++) {
                var item = arrayIds[i];
                var el = document.getElementById(item);
                el.style.backgroundImage = '';
                classes.remove('selected');
            }
        }

    } else {
        ancore.style.backgroundImage = '';
    }
}


//this below is not mine code
function noir(pos, r, g, b, data) {
    var brightness = (3 * r + 4 * g + b) >>> 3;
    if (brightness < 0) brightness = 0;
    data[pos * 4 + 0] = brightness;
    data[pos * 4 + 1] = brightness;
    data[pos * 4 + 2] = brightness;
}

function bwcartoon(pos, r, g, b, outputData) {
    var offset = pos * 4;
    if (outputData[offset] < 120) {
        outputData[offset] = 80;
        outputData[++offset] = 80;
        outputData[++offset] = 80;
    } else {
        outputData[offset] = 255;
        outputData[++offset] = 255;
        outputData[++offset] = 255;
    }
    outputData[++offset] = 255;
    ++offset;
}

function western(pos, r, g, b, data) {
    var brightness = (3 * r + 4 * g + b) >>> 3;
    data[pos * 4 + 0] = brightness + 40;
    data[pos * 4 + 1] = brightness + 20;
    data[pos * 4 + 2] = brightness - 20;
    data[pos * 4 + 3] = 255; //220;
}
