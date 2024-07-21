import React, { useRef, useEffect } from 'react';
import './App.css';
import { Howl, Howler } from 'howler';
import soundURL from './assets/Giong-nu-noi-xin-chao-www_tiengdong_com.mp3';

// var sound = new Howl({
//   src: [soundURL]
// });

//sound.play();

function App() {

  const videoRef = useRef(null);

  const init = async () => {
    console.log('init...');
    await setupCamera();
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      const getUserMedia = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;

      // if (getUserMedia) {
      //   getUserMedia.call(navigator.mediaDevices || navigator, { video: true }) // quyen truy cap
      //     .then(stream => {
      //       if (videoRef.current) { 
      //         videoRef.current.srcObject = stream;
      //         videoRef.current.addEventListener('loadeddate',resolve)
      //       }
      //       resolve();
      //     })
      //     .catch(error => reject(error));
      // } else {
      //   reject(new Error("getUserMedia is not supported in this browser"));
      // }
    });
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
        <button className='btn'>Train 1</button>
        <button className='btn'>Train 2</button>
        <button className='btn'>Run</button>
      </div>
    </div>
  );
}

export default App;
