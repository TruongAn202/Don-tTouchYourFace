import React, { useRef, useEffect } from 'react';
import './App.css';
import { Howl, Howler } from 'howler';
import soundURL from './assets/Giong-nu-noi-xin-chao-www_tiengdong_com.mp3';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
// var sound = new Howl({
//   src: [soundURL]
// });

//sound.play();

const NOT_TOUCH_LABLE = 'not_touch';
const TOUCHED_LABLE = 'touched';
const  TRAINING_TIMES = 50; //học 50 lần
function App() {

  const videoRef = useRef(null);
  const classifer = useRef(null);
  const mobileNetModule = useRef(null);

  const init = async () => {
    console.log('init...');
    await setupCamera();
    console.log('settup camera success') 
    classifer.current = knnClassifier.create();

    mobileNetModule.current = await mobilenet.load();
    console.log('setup done');
    console.log('không sờ tay lên mặt và bấm Train 1')
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      const getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;

      if (getUserMedia) {
        getUserMedia.call(navigator.mediaDevices || navigator, { video: true }) // quyen truy cap
          .then(stream => {
            if (videoRef.current) { 
              videoRef.current.srcObject = stream;
              videoRef.current.addEventListener('loadeddate',resolve)
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
    for (let i = 0; i < TRAINING_TIMES; ++i) {
    console.log(`Progress ${parseInt((i+1) / TRAINING_TIMES * 100)}%`);
    await training(label);
    }
  }

  const training = label =>{
    return new Promise(async resolve=>{
      const emdedding = mobileNetModule.current.infer( //chup hinh dua vao du lieu
        videoRef.current,
        true
      );
        classifer.current.addExample(emdedding,label); //hoc máy
        await sleep(100); 
        resolve();
     });
  }

  const sleep = (ms = 0 ) => {
    return new Promise (resolve => setTimeout(resolve, ms))
  }


  useEffect(() => {
    init();

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    }
  }, []);

  return (
    <div className="main">
      <video
        ref={videoRef}
        className='video'
        autoPlay
      />
      <div className='control'>
        <button className='btn' onClick={()=>train(NOT_TOUCH_LABLE)}>Train 1</button>
        <button className='btn' onClick={()=>train(TOUCHED_LABLE)}>Train 2</button>
        <button className='btn' onClick={()=>{}}>Run</button>
      </div>
    </div>
  );
}

export default App;
