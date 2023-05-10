// 필요한 라이브러리와 DOM 요소를 가져옵니다.
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const actionBtn = document.getElementById('actionBtn');
const video = document.getElementById('preview');

// 전역 변수를 정의합니다.
let stream;
let recorder;
let videoFile;

const files = {
  input: 'recording.webm',
  output: 'output.mp4',
  thumb: 'thumbnail.jpg',
};

// 파일을 다운로드하는 함수입니다.
const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

// 다운로드 버튼을 클릭 시 실행되는 함수입니다.
const handleDownload = async () => {
  actionBtn.removeEventListener('click', handleDownload);

  // UI를 업데이트합니다.
  actionBtn.innerText = 'Transcoding...';
  actionBtn.disabled = true;

  // FFmpeg 인스턴스를 생성하고 로드합니다.
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  // 파일을 메모리에 쓰고, 입력 파일로부터 출력 파일을 생성합니다.
  ffmpeg.FS('writeFile', files.input, await fetchFile(videoFile));

  await ffmpeg.run('-i', files.input, '-r', '60', files.output);

  // 썸네일을 생성합니다.
  await ffmpeg.run(
    '-i',
    files.input,
    '-ss',
    '00:00:01',
    '-frames:v',
    '1',
    files.thumb,
  );

  // 결과 파일을 읽어서 Blob으로 변환합니다.
  const mp4File = ffmpeg.FS('readFile', files.output);
  const thumbFile = ffmpeg.FS('readFile', files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });

  // Blob을 URL로 변환합니다.
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  // 파일을 다운로드합니다.
  downloadFile(mp4Url, 'MyRecording.mp4');
  downloadFile(thumbUrl, 'MyThumbnail.jpg');

  // 메모리에서 파일을 삭제하고, URL을 해제합니다.
  ffmpeg.FS('unlink', files.input);
  ffmpeg.FS('unlink', files.output);
  ffmpeg.FS('unlink', files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  // UI를 업데이트하고, 다시 녹화를 시작할 수 있게 합니다.
  actionBtn.disabled = false;
  actionBtn.innerText = 'Record Again';
  actionBtn.addEventListener('click', handleStart);
};

// 녹화를 시작하는 함수입니다.
const handleStart = () => {
  actionBtn.innerText = 'Recording';
  actionBtn.disabled = true;
  actionBtn.removeEventListener('click', handleStart);
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recorder.ondataavailable = (event) => {
    // 녹화가 끝나면 이벤트를 처리하고 미리보기를 설정합니다.
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();

    // 다운로드 버튼을 활성화하고 이벤트 리스너를 추가합니다.
    actionBtn.innerText = 'Download';
    actionBtn.disabled = false;
    actionBtn.addEventListener('click', handleDownload);
  };

  // 녹화를 시작하고, 5초 후에 자동으로 중지합니다.
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

// 애플리케이션을 초기화하는 함수입니다.
const init = async () => {
  // 사용자의 미디어 장치로부터 스트림을 가져옵니다.
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });

  // 비디오 요소에 스트림을 연결하고 재생합니다.
  video.srcObject = stream;
  video.play();
};

// 초기화 함수를 실행합니다.
init();

// 시작 버튼에 이벤트 리스너를 추가합니다.
actionBtn.addEventListener('click', handleStart);
