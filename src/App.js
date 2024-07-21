
import './App.css';
import {Howl, Howler} from 'howler';
import soundURL from './assets/Giong-nu-noi-xin-chao-www_tiengdong_com.mp3'

// var sound = new Howl({
//   src: [soundURL]
// });

//sound.play();

function App() {
  return (
    <div className="main">
      <video
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
