const domElements = {
  video: document.querySelector('video'),
  playBtn: document.getElementById('play'),
  muteBtn: document.getElementById('mute'),
  volumeRange: document.getElementById('volume'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  timeline: document.getElementById('timeline'),
  fullScreenBtn: document.getElementById('fullScreen'),
  videoContainer: document.getElementById('videoContainer'),
  videoControls: document.getElementById('videoControls'),
};

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
domElements.video.volume = volumeValue;

const handlePlayClick = () => {
  domElements.video.paused ? domElements.video.play() : domElements.video.pause();
  domElements.playBtn.innerText = domElements.video.paused ? 'Play' : 'Pause';
};

const handleMute = () => {
  domElements.video.muted = !domElements.video.muted;
  domElements.muteBtn.innerText = domElements.video.muted ? 'Unmute' : 'Mute';
  domElements.volumeRange.value = domElements.video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const { target: { value } } = event;
  if (domElements.video.muted) {
    domElements.video.muted = false;
    domElements.muteBtn.innerText = 'Mute';
  }
  volumeValue = value;
  domElements.video.volume = value;
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const handleLoadedMetadata = () => {
  domElements.totalTime.innerText = formatTime(Math.floor(domElements.video.duration));
  domElements.timeline.max = Math.floor(domElements.video.duration);
};

const handleTimeUpdate = () => {
  domElements.currentTime.innerText = formatTime(Math.floor(domElements.video.currentTime));
  domElements.timeline.value = Math.floor(domElements.video.currentTime);
};

const handleTimelineChange = (event) => {
  const { target: { value } } = event;
  domElements.video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    domElements.fullScreenBtn.innerText = 'Enter Full Screen';
  } else {
    domElements.videoContainer.requestFullscreen();
    domElements.fullScreenBtn.innerText = 'Exit Full Screen';
  }
};

const hideControls = () => domElements.videoControls.classList.remove('showing');

const handleMouseMove = () => {
  clearTimeout(controlsTimeout);
  clearTimeout(controlsMovementTimeout);
  domElements.videoControls.classList.add('showing');
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

domElements.playBtn.addEventListener('click', handlePlayClick);
domElements.muteBtn.addEventListener('click', handleMute);
domElements.volumeRange.addEventListener('change', handleVolumeChange);
domElements.video.addEventListener('loadedmetadata', handleLoadedMetadata);
domElements.video.addEventListener('timeupdate', handleTimeUpdate);
domElements.timeline.addEventListener('input', handleTimelineChange);
domElements.fullScreenBtn.addEventListener('click', handleFullScreen);
domElements.video.addEventListener('mousemove', handleMouseMove);
domElements.video.addEventListener('mouseleave', handleMouseLeave);
