import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { Howl, Howler } from 'howler';
import { initNotifications, notify } from '@mycv/f8-notification';
import soundURL from './assets/Giong-nu-noi-xin-chao-www_tiengdong_com.mp3';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

var sound = new Howl({
  src: [soundURL]
});

const NOT_TOUCH_LABLE = 'not_touch';
const TOUCHED_LABLE = 'touched';
const TRAINING_TIMES = 50; // học 50 lần
const TOUCHED_CONFIDENCES = 0.8; // đủ mức độ tin cậy đưa ra quyết định

function App() {
  const videoRef = useRef(null);
  const classifer = useRef(null);
  const canPlaySound = useRef(true);
  const mobileNetModule = useRef(null);
  const [touched, setTouched] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [stage, setStage] = useState(0); // 0: loading, 1: train 1, 2: train 2, 3: run
  const [isTraining, setIsTraining] = useState(false); //nút train
  const [isRunning, setIsRunning] = useState(false); //nút run

  const init = async () => {
    console.log('init...');
    await setupCamera();
    console.log('setup camera success') 
    classifer.current = knnClassifier.create();

    mobileNetModule.current = await mobilenet.load();
    console.log('setup done');
    console.log('không sờ tay lên mặt và bấm Train 1')
    initNotifications({ cooldown: 3000 });
    setStage(1); 
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      const getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;

      if (getUserMedia) {
        getUserMedia.call(navigator.mediaDevices || navigator, { video: true })
          .then(stream => {
            if (videoRef.current) { 
              videoRef.current.srcObject = stream;
              videoRef.current.addEventListener('loadeddata', resolve);
            }
            resolve();
          })
          .catch(error => reject(error));
      } else {
        reject(new Error("getUserMedia is not supported in this browser"));
      }
    });
  }

  const train = async label => {
    console.log('Đang train !')
    setIsTraining(true);
    for (let i = 0; i < TRAINING_TIMES; ++i) {
      console.log(`Progress ${parseInt((i+1) / TRAINING_TIMES * 100)}%`);
      setTrainingProgress(parseInt((i+1) / TRAINING_TIMES * 100));
      await training(label);
    }
    setIsTraining(false);

    if (stage === 1) {
      setStage(2);
    } else if (stage === 2) {
      setStage(3);
    }
  }

  const training = label => {
    return new Promise(async resolve => {
      const emdedding = mobileNetModule.current.infer(//chup hinh dua vao du lieu
        videoRef.current,
        true
      );
      classifer.current.addExample(emdedding, label);//hoc máy
      await sleep(100); 
      resolve();
    });
  }

  const run = async () => {
    setIsRunning(true); //set trạng thái run là true, khi đó, ở dưới ẩn nút run
    const emdedding = mobileNetModule.current.infer( //chup hinh dua vao du lieu
      videoRef.current,
      true
    );
    const result = await classifer.current.predictClass(emdedding);

    if(result.label === TOUCHED_LABLE && result.confidences[result.label] > TOUCHED_CONFIDENCES) {
      console.log('Touched');
      if(canPlaySound.current){
        canPlaySound.current = false;
        sound.play();
      }
      notify('Bỏ tay ra!', { body: 'Bạn vừa chạm tay vào mặt!' });
      setTouched(true);
    } else {
      console.log('Not Touch');
      setTouched(false);
    }

    await sleep(200);
    run();
  }

  const sleep = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    init();
    sound.on('end', function() {
      canPlaySound.current = true;
    }); 
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, []);

  return (
    <div className={`main ${touched ? 'touched' : ''}`}>
      <h1>Trải nghiệm AI phát hiện sờ tay lên mặt.</h1>
      <video
        ref={videoRef}
        className='video'
        autoPlay
      />
      <div className='control'>
        {stage === 0 && (
          <p>Xin chờ setup camera...</p>
        )}
        {stage === 1 && (
          <>
            {!isTraining && <p>Hãy nhấn nút để máy học lần 1 khi bạn không đưa tay lên mặt.</p>}
            {!isTraining && <button className='btn' onClick={() => train(NOT_TOUCH_LABLE)}>Học lần 1</button>}
            {isTraining && <p>Đang học... {trainingProgress}%</p>}
          </>
        )}
        {stage === 2 && (
          <>
            {!isTraining && <p>Hãy nhấn nút để máy học lần 2 khi bạn đang đưa tay lên mặt.</p>}
            {!isTraining && <button className='btn' onClick={() => train(TOUCHED_LABLE)}>Học lần 1</button>}
            {isTraining && <p>Đang học... {trainingProgress}%</p>}
          </>
        )}
        {stage === 3 && (
          <>
            {!isRunning && <p>Đã học xong! Hãy nhấn nút khởi động để trải nghiệm.</p>}
            {!isRunning && <button className='btn' onClick={() => run()}>Khởi động</button>}
            {isRunning && <p>AI đang theo dõi bạn</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
