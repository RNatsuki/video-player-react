import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward, faVolumeUp, faVolumeMute, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import "./VideoPlayer.css"; // Asegúrate de tener este archivo CSS para estilos

interface VideoPlayerProps {
  src: string;
  width?: number;
  height?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<any>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateDuration);

    const savedTime = localStorage.getItem("videoPlayerCurrentTime");
    if (savedTime) {
      video.currentTime = parseFloat(savedTime);
    }

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("videoPlayerCurrentTime", currentTime.toString());
  }, [currentTime]);

  const handleFullScreenChange = useCallback(() => {
    const isFullScreenNow = document.fullscreenElement === containerRef.current;
    setIsFullScreen(isFullScreenNow);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [handleFullScreenChange]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const muted = !isMuted;
    videoRef.current.muted = muted;
    setIsMuted(muted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const seek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  const handleForward = () => {
    if (!videoRef.current) return;
    seek(Math.min(videoRef.current.currentTime + 10, videoRef.current.duration));
  };

  const handleRewind = () => {
    if (!videoRef.current) return;
    seek(Math.max(videoRef.current.currentTime - 10, 0));
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    const clickPosition = e.nativeEvent.offsetX / progressBarRef.current.offsetWidth;
    const newTime = clickPosition * videoRef.current.duration;
    seek(newTime);
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    setControlsTimeout(setTimeout(() => setControlsVisible(false), 3000));
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) { // Safari
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) { // Firefox
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) { // IE/Edge
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="video-container"
      onMouseMove={showControls}
      onMouseLeave={() => setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="video-element"
        onMouseOver={showControls}
        onMouseOut={() => setControlsVisible(false)}
        onTimeUpdate={() => setCurrentTime((videoRef.current?.currentTime ?? 0))}
      />
      {controlsVisible && (
        <div className="video-controls">
          <button onClick={handleRewind}>
            <FontAwesomeIcon icon={faBackward} />
          </button>
          <button onClick={togglePlayPause}>
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button onClick={handleForward}>
            <FontAwesomeIcon icon={faForward} />
          </button>
          <button onClick={toggleMute}>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={changeVolume}
            className="volume-slider"
          />
          <div
            ref={progressBarRef}
            className="progress-bar"
            onClick={handleProgressBarClick}
          >
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="duration-time">{formatTime(duration)}</span>
          <button onClick={toggleFullScreen}>
            <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
