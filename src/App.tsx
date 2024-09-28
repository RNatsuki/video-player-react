import "./App.css";
import VideoPlayer from "./components/VideoPlayer";
import video from "./videos/video.mp4";
const App = () => {
  return (
    <div className="content">
      <h1>SofiDev Video Player</h1>
      <VideoPlayer src={video} />
    </div>
  );
};

export default App;
