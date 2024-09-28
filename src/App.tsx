import "./App.css";
import VideoPlayer from "./components/VideoPlayer";
import video from "./videos/sofi.mp4";
import thumbnail from "./thumbnails/image.png";
const App = () => {
  return (
    <div className="content">
      <h1>SofiDev Video Player</h1>
      <VideoPlayer src={video} thumbnail={thumbnail} />
    </div>
  );
};

export default App;
