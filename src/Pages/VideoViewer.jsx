import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "../../public/assets/css/VideoViewer.css"; // Import the CSS file

const VideoViewer = ({ videoUrl, videoName, previewUrl, autoPlay = false, muted = false, loop = false }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(!!previewUrl);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(error => {
          console.error("Playback failed:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenEnabled) return;

    const element = videoRef.current.parentElement;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen().catch(err => {
        console.error("Fullscreen request failed:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      setCurrentTime(currentTime);
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleSeek = (e) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsRef.current);
      controlsRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("click", togglePlay);
      video.addEventListener("mousemove", handleMouseMove);
      
      // Set initial volume
      video.volume = volume;
      video.muted = isMuted;
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("click", togglePlay);
        video.removeEventListener("mousemove", handleMouseMove);
        clearTimeout(controlsRef.current);
      }
    };
  }, [volume, isMuted]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!videoRef.current) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlay();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyM":
          toggleMute();
          break;
        case "ArrowLeft":
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case "ArrowRight":
          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
          break;
        case "ArrowUp":
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          setVolume(Math.max(0, volume - 0.1));
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [volume]);

  return (
    <div className={`video-viewer ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="video-container">
        <div className="video-header">
          <h2 className="video-title">{videoName}</h2>
        </div>

        <div className="video-wrapper">
          {showPreview && previewUrl ? (
            <div
              className="preview-section"
              onClick={() => {
                setShowPreview(false);
                if (autoPlay && videoRef.current) {
                  videoRef.current.play().catch(error => {
                    console.error("Autoplay failed:", error);
                  });
                }
              }}
            >
              <img
                src={previewUrl}
                alt="Video Preview"
                className="preview-image"
              />
              <button className="play-button">
                <span className="play-icon">▶</span>
                <span className="play-text">Preview</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                controls={false}
                width="100%"
                poster={previewUrl}
                autoPlay={autoPlay}
                muted={isMuted}
                loop={loop}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className={`video-controls ${showControls ? 'visible' : ''}`}>
                <div className="progress-bar" onClick={handleSeek}>
                  <div 
                    className="progress" 
                    style={{ width: `${progress}%` }}
                  />
                  <div className="progress-thumb" style={{ left: `${progress}%` }} />
                </div>
                
                <div className="control-buttons">
                  <button 
                    className="control-button play-pause"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>
                  
                  <div className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                  
                  <button 
                    className="control-button mute"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? "🔇" : volume > 0.5 ? "🔊" : "🔉"}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                  
                  <button 
                    className="control-button fullscreen"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? "⤢" : "⤡"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

VideoViewer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  videoName: PropTypes.string.isRequired,
  previewUrl: PropTypes.string,
  autoPlay: PropTypes.bool,
  muted: PropTypes.bool,
  loop: PropTypes.bool,
};

export default VideoViewer;