function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    window.player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'amfWIRasxtI',
        playerVars: {
            'autoplay': 1,
            'mute': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': 'amfWIRasxtI',
            'modestbranding': 1,
            'iv_load_policy': 3,
            'disablekb': 1,
            'fs': 0,
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player is ready');
    if (window.musicController) {
        window.musicController.player = window.player;
    }
}

function unmuteVideo() {
    if (window.player && window.player.unMute) {
        window.player.unMute();
    }
}

// Prevent user interaction
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

loadYouTubeAPI();
