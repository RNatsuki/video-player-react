import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faForward,
  faBackward,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
} from "@fortawesome/free-solid-svg-icons";
import "./VideoPlayer.css"; // Asegúrate de tener este archivo CSS para estilos

interface VideoPlayerProps {
  src: string;
  thumbnail?: string; // Agregar propiedad thumbnail
  width?: number;
  height?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, thumbnail }) => {
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

  // Añadido para controlar si el video ha comenzado
  const [hasStarted, setHasStarted] = useState(false);

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

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("playing", () => setHasStarted(true)); // Marca que el video ha comenzado

    const savedTime = localStorage.getItem("videoPlayerCurrentTime");
    if (savedTime) {
      video.currentTime = parseFloat(savedTime);
    }

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("playing", () => setHasStarted(true)); // Limpiar el evento al desmontar
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("videoPlayerCurrentTime", currentTime.toString());
  }, [currentTime]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const fullScreenElement =
        document.fullscreenElement || (document as any).webkitFullscreenElement; // Safari
      setIsFullScreen(fullScreenElement === videoRef.current);
      setControlsVisible(fullScreenElement === videoRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange); // Safari

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange
      );
    };
  }, []);

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
    seek(
      Math.min(videoRef.current.currentTime + 10, videoRef.current.duration)
    );
  };

  const handleRewind = () => {
    if (!videoRef.current) return;
    seek(Math.max(videoRef.current.currentTime - 10, 0));
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressBarRef.current) return;
    const clickPosition =
      e.nativeEvent.offsetX / progressBarRef.current.offsetWidth;
    const newTime = clickPosition * videoRef.current.duration;
    seek(newTime);
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
  };

  const hideControls = () => {
    // Iniciamos un nuevo timeout al intentar ocultar los controles.
    // Esto asegura que los controles solo se oculten después de 3 segundos sin actividad del ratón
    const newTimeout = setTimeout(() => {
      if (!isFullScreen) {
        // Solo ocultamos los controles si no estamos en pantalla completa
        setControlsVisible(false);
      }
    }, 3000);
    setControlsTimeout(newTimeout);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${padZero(minutes)}:${padZero(secs)}`;
  };

  const padZero = (num: number): string => {
    return num < 10 ? `0${num}` : num.toString();
  };

  const toggleFullScreen = () => {
    const videoContainer = videoRef.current?.parentElement;

    if (!document.fullscreenElement && videoContainer) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  return (
    <div
      className="video-container"
      onMouseMove={showControls}
      onMouseLeave={hideControls}
    >
      {/* Mostrar thumbnail solo si está en el minuto 0 y está pausado */}
      {currentTime === 0 && !isPlaying && thumbnail && (
        <img
          src={thumbnail}
          alt="Thumbnail"
          className="video-thumbnail"
          onClick={togglePlayPause} // Play video when thumbnail is clicked
        />
      )}
      <video
        ref={videoRef}
        src={src}
        className="video-element"
        controls={false}
        onMouseOver={showControls}
        onMouseOut={hideControls}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
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
            <div className="progress" style={{ width: `${progress}%` }}>
              <div
                className="time-tooltip"
                style={{ transform: `translateX(-50%)`, left: `${progress}%` }}
              >
                {formatTime(currentTime)}
              </div>
            </div>
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
