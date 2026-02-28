import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Maximize2, Minimize2, Volume2, VolumeX, Play, Pause, RotateCcw, Settings, Loader2, PictureInPicture2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

// Extract Google Drive file ID from various URL formats
function getGoogleDriveId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /docs\.google\.com\/file\/d\/([^/]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function buildDrivePlyrUrl(fileId: string): string {
  const payload = JSON.stringify({ id: [fileId] });
  const encoded = btoa(payload);
  return `https://sh20raj.github.io/DrivePlyr/fluid.html?id=${encoded}`;
}

const VideoPlayer = ({ url, title }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [playbackMode, setPlaybackMode] = useState<'hls' | 'native' | ''>('');

  const isHlsUrl = (u: string) => {
    const lower = u.toLowerCase();
    return lower.includes('.m3u8') || lower.includes('.m3u') || lower.includes('m3u8');
  };

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  // Try native playback as fallback
  const tryNativePlayback = useCallback((video: HTMLVideoElement, src: string) => {
    destroyHls();
    setPlaybackMode('native');
    setError('');
    setIsBuffering(true);
    video.src = src;
    video.load();
    video.play().catch(() => {});
  }, [destroyHls]);

  // Try HLS playback
  const tryHlsPlayback = useCallback((video: HTMLVideoElement, src: string) => {
    destroyHls();
    setPlaybackMode('hls');
    setError('');
    setIsBuffering(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1,
        xhrSetup: (xhr) => {
          xhr.timeout = 15000;
        },
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          // HLS failed — fall back to native
          console.warn('HLS fatal error, falling back to native playback');
          tryNativePlayback(video, src);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
      }, { once: true });
    } else {
      // No HLS support, try native
      tryNativePlayback(video, src);
    }
  }, [destroyHls, tryNativePlayback]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setError('');
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsBuffering(true);

    // Decide strategy: if URL looks like HLS, try HLS first; otherwise try native first
    if (isHlsUrl(url)) {
      tryHlsPlayback(video, url);
    } else {
      tryNativePlayback(video, url);
    }

    return () => {
      destroyHls();
    };
  }, [url, tryHlsPlayback, tryNativePlayback, destroyHls]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const onDurationChange = () => {
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
      }
    };
    const onError = () => {
      // If native playback fails and we haven't tried HLS, try HLS
      if (playbackMode === 'native' && isHlsUrl(url)) {
        tryHlsPlayback(video, url);
        return;
      }
      // If both fail
      if (playbackMode === 'native') {
        setError('Failed to load stream. The channel may be offline or the format is unsupported.');
      }
      setIsBuffering(false);
    };
    const onEnded = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('error', onError);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('error', onError);
      video.removeEventListener('ended', onEnded);
    };
  }, [playbackMode, url, tryHlsPlayback]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
      videoRef.current.muted = val === 0;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current || !isFinite(duration) || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pct * duration;
  };

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    setError('');
    if (isHlsUrl(url)) {
      tryHlsPlayback(video, url);
    } else {
      tryNativePlayback(video, url);
    }
  };

  const formatTime = (t: number) => {
    if (!isFinite(t) || t < 0) return '--:--';
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break;
        case 'f': e.preventDefault(); toggleFullscreen(); break;
        case 'm': e.preventDefault(); toggleMute(); break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current && isFinite(duration)) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [duration]);

  const controlsVisible = showControls || !isPlaying || isBuffering;

  // Google Drive: render iframe instead of video player
  const driveId = getGoogleDriveId(url);
  if (driveId) {
    const embedUrl = buildDrivePlyrUrl(driveId);
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {title && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10">
            <p className="text-white font-semibold text-sm truncate">{title}</p>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          scrolling="no"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black rounded-lg overflow-hidden cursor-pointer select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {error ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-2xl">📡</span>
            </div>
            <p className="text-white font-medium mb-4">{error}</p>
            <button
              onClick={retry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {/* Buffering spinner */}
      {isBuffering && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={false}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Top bar */}
      {title && (
        <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <p className="text-white font-semibold text-sm truncate">{title}</p>
        </div>
      )}

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Progress bar */}
        {duration > 0 && (
          <div
            ref={progressRef}
            className="w-full h-1.5 bg-white/20 cursor-pointer group/progress hover:h-2.5 transition-all mx-0"
            onClick={handleSeek}
          >
            <div className="h-full bg-primary rounded-r-full relative" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-primary h-1 cursor-pointer"
              />
            </div>

            {duration > 0 && (
              <span className="text-white/80 text-xs font-mono ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (videoRef.current && document.pictureInPictureEnabled) {
                  if (document.pictureInPictureElement) {
                    document.exitPictureInPicture().catch(() => {});
                  } else {
                    videoRef.current.requestPictureInPicture().catch(() => {});
                  }
                }
              }}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
