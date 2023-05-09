const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement('a');
  a.href = videoFile;
  // download 속성은 a 요소가 리소스를 다운로드할 때 사용할 파일 이름을 나타냅니다.
  a.download = 'MyRecording.webm';
  document.body.appendChild(a);
  a.click();
};

const handleStop = () => {
  startBtn.innerText = 'Download Recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = 'Stop Recording';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    // createObjectURL() 메서드는 지정된 미디어 객체나 미디어 스트림을 가리키는 URL을 생성합니다.
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
