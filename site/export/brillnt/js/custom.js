// custom code for rro
document.addEventListener('DOMContentLoaded', function() {
  // MENU CHANGE ON SCROLL
  const triggerElement = document.querySelector('[data-id="triggerMenuChange"]');
  const navElement = document.getElementById('nav');
  const triggerPoint = triggerElement.offsetTop; 
  const belowFoldClass = 'compact';

  window.addEventListener('scroll', function() {
    if (window.scrollY > triggerPoint) {
      // add blur class to nav
      navElement.classList.add(belowFoldClass);
    } else {
      // remove blur class from nav
      navElement.classList.remove(belowFoldClass);
    }
  });

  // HERO VIDEO
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  var ytPlayer;
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('pv-youtube-iframe', {
      height: '100%',
      width: '100%',
      videoId: 'CXr2BH3P_yA',
      playerVars: {
        'playsinline': 1,
        'autoplay': 0,
        'controls': 0,
        'showinfo': 0,
        'fs': 0,
        'color': 'white',
        'iv_load_policy': 3,
        'rel': 0,
        'widget_referrer': window.location.href,
        'modestbranding': 1,
      },
      events: { 'onReady': onPlayerReady }
    });

    window.ytPlayer = ytPlayer;
  }

  function onPlayerReady(event) {
    console.log('Player is ready');
    // event.target.playVideo();
  }

  const heroPlayButton = document.getElementById('vsm-play-button');

  heroPlayButton.addEventListener('click', function() {
    const pvUiElement = heroPlayButton.closest('.pv-ui');
    if (pvUiElement) {
      pvUiElement.style.display = 'none';
      const mediaBackgroundElement = pvUiElement.parentElement.querySelector('.media-background');
      if (mediaBackgroundElement) {
        mediaBackgroundElement.style.display = 'none';

        ytPlayer.playVideo();
      }
    }
  });  
});
