import React, { useEffect, useRef, useState } from "react";

const VideoViewer = ({ videoUrl, videoName, previewUrl }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(!!previewUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const togglePlay = () => {
    if (videoRef.current && !showPreview) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          setError("Failed to play video: " + err.message);
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err);
      });
    } else {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    }
  };

  const handlePreviewClick = () => {
    setShowPreview(false);
    setIsLoading(true);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => setIsPlaying(false);

    const handleLoadStart = () => setIsLoading(true);

    const handleCanPlay = () => setIsLoading(false);

    const handleError = (e) => {
      setError("Video failed to load");
      setIsLoading(false);
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("loadstart", handleLoadStart);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("error", handleError);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("loadstart", handleLoadStart);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("error", handleError);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle keyboard shortcuts when the video container has focus or we're in fullscreen
      if (isFullscreen || document.activeElement === containerRef.current) {
        if (event.code === "Space") {
          event.preventDefault();
          togglePlay();
        } else if (event.code === "KeyF") {
          event.preventDefault();
          toggleFullscreen();
        } else if (event.code === "Escape" && isFullscreen) {
          event.preventDefault();
          document.exitFullscreen();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="text-red-600 font-medium mb-2">Video Error</div>
        <div className="text-red-800">{error}</div>
        <button
          onClick={() => setError(null)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-black rounded-lg overflow-hidden shadow-lg max-w-4xl mx-auto ${
        isFullscreen ? "fixed inset-0 z-50 max-w-none rounded-none" : ""
      }`}
      tabIndex={0}
    >
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <h2 className="text-xl font-semibold truncate">
          {videoName || "Video Player"}
        </h2>
      </div>

      {/* Video Container */}
      <div className="relative bg-black">
        {showPreview && previewUrl ? (
          <div
            className="relative cursor-pointer group"
            onClick={handlePreviewClick}
          >
            <img
              src={previewUrl}
              alt="Video Preview"
              className="w-full h-auto max-h-96 object-contain mx-auto block"
              onError={(e) => {
                e.target.style.display = "none";
                setShowPreview(false);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-colors">
              <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-gray-800 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                <div className="text-white">Loading...</div>
              </div>
            )}
            <video
              ref={videoRef}
              controls
              className="w-full h-auto max-h-96 object-contain mx-auto block"
              poster={previewUrl}
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/webm" />
              <source src={videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>

      {/* Custom Controls */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            disabled={showPreview}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
              ) : (
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
              )}
            </svg>
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="bg-gray-800 text-gray-400 text-xs p-2 text-center">
        Keyboard shortcuts: Space (play/pause), F (fullscreen), Esc (exit
        fullscreen)
      </div>
    </div>
  );
};

export default VideoViewer;
