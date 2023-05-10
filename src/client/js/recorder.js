import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const handleDownload = async () => {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();// ffmpeg를 로드하는데 시간이 걸릴 수 있으므로 await를 사용하여 로드가 완료될 때까지 기다립니다.

  // ffmpeg는 브라우저에서 동작하는 것이 아니므로, 브라우저에서 사용할 수 있도록 wasm 파일을 다운로드 받아야 합니다.
  // fetchFile() 함수는 URL을 받아서 fetch() 함수를 사용하여 파일을 다운로드 받습니다.
  // fetch() 함수는 Promise를 반환하므로 await를 사용하여 파일 다운로드가 완료될 때까지 기다립니다.
  // fetchFile() 함수는 Uint8Array를 반환하므로, 이를 ffmpeg에 전달하기 위해 Uint8Array를 Blob으로 변환합니다.
  ffmpeg.FS('writeFile', 'recording.webm', await fetchFile(videoFile));

  // -i 옵션은 입력 파일을 지정합니다.
  // -r 옵션은 출력 파일의 프레임 레이트를 지정합니다.
  await ffmpeg.run('-i', 'recording.webm', '-r', '60', 'output.mp4');// 녹화된 비디오를 mp4로 변환

  // -ss 옵션은 입력 파일의 시작 시간을 지정합니다.
  // -frames:v 옵션은 출력 파일의 프레임 수를 지정합니다.
  await ffmpeg.run('-i', 'recording.webm', '-ss', '00:00:01', '-frames:v', '1', 'thumbnail.jpg');// 썸네일 생성

  // 파일을 읽어서 Uint8Array로 반환합니다.
  const mp4File = ffmpeg.FS('readFile', 'output.mp4');
  const thumbFile = ffmpeg.FS('readFile', 'thumbnail.jpg');

  // Uint8Array를 Blob으로 변환합니다.
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });

  // Blob을 URL로 변환합니다.
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  const a = document.createElement('a');
  a.href = mp4Url;
  // download 속성은 a 요소가 리소스를 다운로드할 때 사용할 파일 이름을 나타냅니다.
  // 이 속성은 href 또는 location 속성이 지정된 경우에만 사용할 수 있습니다.
  // 이 속성이 지정되지 않으면, 리소스의 URL이 사용됩니다.
  a.download = 'MyRecording.mp4';
  document.body.appendChild(a);
  a.click();

  const thumbA = document.createElement('a');
  thumbA.href = thumbUrl;
  thumbA.download = 'MyThumbnail.jpg';
  document.body.appendChild(thumbA);
  thumbA.click();

  // ffmpeg.FS('unlink', '파일명') 함수는 지정된 파일을 삭제합니다.
  ffmpeg.FS('unlink', 'recording.webm');
  ffmpeg.FS('unlink', 'output.mp4');
  ffmpeg.FS('unlink', 'thumbnail.jpg');

  // URL.revokeObjectURL() 메서드는 이전에 createObjectURL() 메서드로 생성한 URL 객체를 해제합니다.
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);
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
