(function () {
  const video = document.querySelector('video');
  const playBtn = document.getElementById('play');
  const muteBtn = document.getElementById('mute');
  const volumeRange = document.getElementById('volume');
  const currentTime = document.getElementById('currenTime');
  const totalTime = document.getElementById('totalTime');
  const timeline = document.getElementById('timeline');
  const fullScreenBtn = document.getElementById('fullScreen');
  const videoContainer = document.getElementById('videoContainer');
  const videoControls = document.getElementById('videoControls');

  let controlsTimeout = null;
  let controlsMovementTimeout = null;
  let volumeValue = 0.5;
  video.volume = volumeValue;

  const toggleIconClass = (element, class1, class2) => {
    const icon = element.querySelector('i');
    icon.classList.toggle(class1);
    icon.classList.toggle(class2);
  };

  const handlePlayClick = () => {
    if (video.paused) {
      video.play().catch((error) => {
        console.error('Error playing the video: ', error);
      });
    } else {
      video.pause();
    }
    toggleIconClass(playBtn, 'fa-play', 'fa-pause');
  };

  const handleMuteClick = () => {
    video.muted = !video.muted;
    toggleIconClass(muteBtn, 'fa-volume-mute', 'fa-volume-up');
    volumeRange.value = video.muted ? 0 : volumeValue;
  };

  const handleVolumeChange = (event) => {
    const {
      target: { value },
    } = event;
    volumeValue = value;
    video.volume = value;

    if (value === '0') {
      video.muted = true;
      const icon = muteBtn.querySelector('i');
      if (!icon.classList.contains('fa-volume-mute')) {
        toggleIconClass(muteBtn, 'fa-volume-mute', 'fa-volume-up');
      }
    } else if (video.muted) {
      video.muted = false;
      const icon = muteBtn.querySelector('i');
      if (!icon.classList.contains('fa-volume-up')) {
        toggleIconClass(muteBtn, 'fa-volume-up', 'fa-volume-mute');
      }
    }
  };

  const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(14, 5);

  const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
  };

  const handleTimeUpdate = () => {
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
  };

  const handleTimelineChange = (event) => {
    const {
      target: { value },
    } = event;
    video.currentTime = value;
  };

  const handleFullscreen = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
      document.exitFullscreen();
    } else {
      videoContainer.requestFullscreen();
    }
    toggleIconClass(fullScreenBtn, 'fa-expand', 'fa-compress');
  };

  const hideControls = () => videoControls.classList.remove('showing');

  const handleMouseMove = () => {
    clearTimeout(controlsTimeout);
    clearTimeout(controlsMovementTimeout);
    videoControls.classList.add('showing');
    controlsMovementTimeout = setTimeout(hideControls, 3000);
  };

  const handleMouseLeave = () => {
    controlsTimeout = setTimeout(hideControls, 3000);
  };

  playBtn.addEventListener('click', handlePlayClick);
  muteBtn.addEventListener('click', handleMuteClick);
  volumeRange.addEventListener('input', handleVolumeChange);
  video.addEventListener('loadeddata', handleLoadedMetadata);
  video.addEventListener('timeupdate', handleTimeUpdate);
  videoContainer.addEventListener('mousemove', handleMouseMove);
  videoContainer.addEventListener('mouseleave', handleMouseLeave);
  timeline.addEventListener('input', handleTimelineChange);
  fullScreenBtn.addEventListener('click', handleFullscreen);
  video.addEventListener('click', handlePlayClick);

  // Add tabindex and aria-label attributes for better accessibility
  playBtn.setAttribute('tabindex', 0);
  muteBtn.setAttribute('tabindex', 0);
  fullScreenBtn.setAttribute('tabindex', 0);
  timeline.setAttribute('tabindex', 0);
  volumeRange.setAttribute('tabindex', 0);

  playBtn.setAttribute('aria-label', 'Play');
  muteBtn.setAttribute('aria-label', 'Mute');
  fullScreenBtn.setAttribute('aria-label', 'Fullscreen');
  timeline.setAttribute('aria-label', 'Timeline');
  volumeRange.setAttribute('aria-label', 'Volume');

  // press spacebar to play or pause
  document.body.onkeyup = (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault(); // prevent scrolling on spacebar press
      handlePlayClick();
    }
  };

  // Add error handling
  video.addEventListener('error', (event) => {
    console.error('An error occurred while playing the video: ', event);
  });

  // Feature detection for fullscreen
  if (!document.fullscreenEnabled) {
    console.warn('Fullscreen is not supported in this browser.');
    fullScreenBtn.style.display = 'none';
  }
}());
