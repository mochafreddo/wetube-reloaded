import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const actionBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const files = {
  input: 'recording.webm',
  output: 'output.mp4',
  thumb: 'thumbnail.jpg',
};

/**
 * @param {string} fileUrl
 * @param {string} fileName
 * @returns {void}
 * @description
 * downloadFile() 함수는 fileUrl로 지정된 파일을 다운로드 받습니다.
 * 이 함수는 a 요소를 생성하여 href 속성에 fileUrl을, download 속성에 fileName을 지정합니다.
 * 그리고 a 요소를 body 요소에 추가한 후, click() 메서드를 사용하여 a 요소를 클릭합니다.
 * 이렇게 하면 브라우저는 a 요소의 href 속성에 지정된 URL로 이동합니다.
 * 이때, download 속성에 지정된 파일 이름으로 파일을 다운로드 받습니다.
 */
const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener('click', handleDownload);
  actionBtn.innerText = 'Transcoding...';
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();// ffmpeg를 로드하는데 시간이 걸릴 수 있으므로 await를 사용하여 로드가 완료될 때까지 기다립니다.

  // ffmpeg는 브라우저에서 동작하는 것이 아니므로, 브라우저에서 사용할 수 있도록 wasm 파일을 다운로드 받아야 합니다.
  // fetchFile() 함수는 URL을 받아서 fetch() 함수를 사용하여 파일을 다운로드 받습니다.
  // fetch() 함수는 Promise를 반환하므로 await를 사용하여 파일 다운로드가 완료될 때까지 기다립니다.
  // fetchFile() 함수는 Uint8Array를 반환하므로, 이를 ffmpeg에 전달하기 위해 Uint8Array를 Blob으로 변환합니다.
  ffmpeg.FS('writeFile', files.input, await fetchFile(videoFile));

  // -i 옵션은 입력 파일을 지정합니다.
  // -r 옵션은 출력 파일의 프레임 레이트를 지정합니다.
  await ffmpeg.run('-i', files.input, '-r', '60', files.output);// 녹화된 비디오를 mp4로 변환

  // -ss 옵션은 입력 파일의 시작 시간을 지정합니다.
  // -frames:v 옵션은 출력 파일의 프레임 수를 지정합니다.
  await ffmpeg.run('-i', files.input, '-ss', '00:00:01', '-frames:v', '1', files.thumb);// 썸네일 생성

  // 파일을 읽어서 Uint8Array로 반환합니다.
  const mp4File = ffmpeg.FS('readFile', files.output);
  const thumbFile = ffmpeg.FS('readFile', files.thumb);

  // Uint8Array를 Blob으로 변환합니다.
  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });

  // Blob을 URL로 변환합니다.
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, 'MyRecording.mp4');// 녹화된 비디오 다운로드
  downloadFile(thumbUrl, 'MyThumbnail.jpg');// 썸네일 다운로드

  // ffmpeg.FS('unlink', '파일명') 함수는 지정된 파일을 삭제합니다.
  ffmpeg.FS('unlink', files.input);
  ffmpeg.FS('unlink', files.output);
  ffmpeg.FS('unlink', files.thumb);

  // URL.revokeObjectURL() 메서드는 이전에 createObjectURL() 메서드로 생성한 URL 객체를 해제합니다.
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = 'Record Again';
  actionBtn.addEventListener('click', handleStart);
};

const handleStop = () => {
  actionBtn.innerText = 'Download Recording';
  actionBtn.removeEventListener('click', handleStop);
  actionBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const handleStart = () => {
  actionBtn.innerText = 'Stop Recording';
  actionBtn.removeEventListener('click', handleStart);
  actionBtn.addEventListener('click', handleStop);
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

actionBtn.addEventListener('click', handleStart);
