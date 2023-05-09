const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleDownload = () => {
  const a = document.createElement('a');
  a.href = videoFile;
  // download 속성은 a 요소가 리소스를 다운로드할 때 사용할 파일 이름을 나타냅니다.
  // 이 속성은 href 또는 location 속성이 지정된 경우에만 사용할 수 있습니다.
  // 이 속성이 지정되지 않으면, 리소스의 URL이 사용됩니다.
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
  // MediaRecorder.ondataavailable 이벤트는 미디어 데이터를 사용할 수 있을 때마다 발생합니다.
  // 이 이벤트는 미디어 데이터를 포함하는 BlobEvent를 전달합니다.
  recorder.ondataavailable = (event) => {
    // createObjectURL() 메서드는 지정된 미디어 객체나 미디어 스트림을 가리키는 URL을 생성합니다.
    // 이 URL은 미디어의 내용을 나타내는 정적, 지속적인 링크를 생성합니다.
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;// 녹화가 끝나면 녹화된 비디오를 미리보기에서 제거
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  // navigator.mediaDevices.getUserMedia() 메서드는 사용자에게 미디어 입력 장치 사용 권한을 요청합니다.
  // 사용자가 요청을 허용하면, 이 메서드는 Promise를 반환하고 미디어 스트림을 포함하는 MediaStream 객체를 resolve합니다.
  // 사용자가 요청을 거부하거나, 요청한 미디어 유형이 사용자 에이전트에서 지원되지 않으면, Promise는 PermissionDeniedError 또는
  // NotAllowedError를 반환합니다.
  // 또한, 요청한 미디어 유형이 사용자 에이전트에서 지원되지 않으면, Promise는 OverconstrainedError를 반환합니다.
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });
  // HTMLMediaElement.srcObject 속성은 미디어 요소에 연결된 MediaStream, MediaSource, Blob, File, 또는 URL을 나타냅니다.
  // 이 속성은 미디어 요소가 재생할 미디어를 지정하는 데 사용됩니다.
  // 이 속성은 읽기/쓰기 속성이며, 미디어 요소가 재생 중이 아닐 때만 설정할 수 있습니다.
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
