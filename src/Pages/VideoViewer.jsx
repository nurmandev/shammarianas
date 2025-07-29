import React, { useEffect, useRef, useState } from "react";

const VideoViewer = ({ videoUrl, videoName, previewUrl }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreview, setShowPreview] = useState(!!previewUrl);
  const [isMounted, setIsMounted] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => console.error("Play failed:", e));
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(err => {
        console.error("Fullscreen request failed:", err);
      });
    }
  };

  // Handle video events
  useEffect(() => {
    if (!videoRef.current) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setShowPreview(false);
    };
    
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleFullscreenChange = () => {
      if (document.fullscreenElement === containerRef.current) {
        // Focus video when entering fullscreen for keyboard controls
        videoRef.current.focus();
      }
    };

    const video = videoRef.current;
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts (local to component)
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (event) => {
      // Only handle keys when component is focused or in fullscreen
      if (!document.activeElement.closest('.video_viewer_main') && 
          !document.fullscreenElement) return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          togglePlay();
          break;
        case "KeyF":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          event.preventDefault();
          setShowPreview(prev => !prev);
          break;
        case "Escape":
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => setIsMounted(false);
  }, []);

  return (
    <div 
      className="video_viewer_main"
      ref={containerRef}
      tabIndex={0}
      aria-label={`Video player for ${videoName}`}
    >
      <div className="container">
        <div className="header">
          <h2>{videoName}</h2>
          <div className="keyboard-hints">
            <kbd>Space</kbd> Play/Pause • <kbd>F</kbd> Fullscreen • <kbd>M</kbd> Preview
          </div>
        </div>

        <div className="video_wrapper">
          {showPreview && previewUrl ? (
            <div
              className="preview_section"
              onClick={() => {
                setShowPreview(false);
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.error("Play failed:", e));
                }
              }}
              aria-label="Preview image, click to play video"
            >
              <img
                src={previewUrl}
                alt="Video Preview"
                className="preview_image"
              />
              <button className="play_button" aria-label="Play video">
                ▶ Play Video
              </button>
            </div>
          ) : (
            <video 
              ref={videoRef}
              controls 
              width="100%"
              aria-label={videoName}
              tabIndex={0}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="controls">
          <button 
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
          
          <button 
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            {document.fullscreenElement ? "⤢ Exit Fullscreen" : "⤡ Fullscreen"}
          </button>
          
          {previewUrl && (
            <button 
              onClick={() => setShowPreview(prev => !prev)}
              aria-label={showPreview ? "Hide preview" : "Show preview"}
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoViewer;