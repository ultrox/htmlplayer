window.onload = init;
var video;
function init() {
    var controls = document.getElementById('controls');
    addEventListener('click', handleControl);
}

function handleControl(e) {
    video = document.getElementById('video');

    var ancore = e.target;
    var id = ancore.id;

    if (id === 'play') {
        //pusch play, unpush pause
        video.play();
        pushUnpush(e, ['pause']);

    } else if (id === 'pause') {
        // push pause, unpush play
        video.pause();
        pushUnpush(e, ['play']);
  
    }

    if (id === 'mute') {
        //this can be push or unpushed no relation with others
        pushUnpush(e, []);
        video.muted = !video.muted;
        console.log(video.muted);
    }

    if (id === 'loop') {
        // unrelated to others
        pushUnpush(e, []);
        video.loop = !video.loop;
        console.log(video.loop);


    }
}

function pushUnpush(e, arrayIds) {
    var ancore = e.target;
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
