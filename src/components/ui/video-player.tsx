'use client';

import { cn } from '../../lib/utils';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  className?: string;
  /** 自动播放（一般要配合 muted） */
  autoPlay?: boolean;
  /** 默认静音 */
  muted?: boolean;
  /** 循环播放 */
  loop?: boolean;
  /** 点击下载按钮（提供时显示下载按钮） */
  onDownload?: () => void;
};

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const total = Math.floor(value);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const HIDE_CONTROLS_DELAY = 2200;

export function VideoPlayer({
  src,
  poster,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
  onDownload,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [adjustingVolume, setAdjustingVolume] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const bufferedRatio = duration > 0 ? Math.min(buffered / duration, 1) : 0;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, HIDE_CONTROLS_DELAY);
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (playing && !scrubbing && !adjustingVolume) {
      scheduleHideControls();
    } else {
      clearHideTimer();
    }
  }, [playing, scrubbing, adjustingVolume, scheduleHideControls, clearHideTimer]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  useEffect(() => {
    if (!playing || scrubbing || adjustingVolume || hovering) {
      clearHideTimer();
      setShowControls(true);
      return;
    }
    scheduleHideControls();
  }, [
    playing,
    scrubbing,
    adjustingVolume,
    hovering,
    scheduleHideControls,
    clearHideTimer,
  ]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      void v.play();
    } else {
      v.pause();
    }
  }, []);

  const seekTo = useCallback((ratio: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    v.currentTime = clamped * v.duration;
    setCurrentTime(v.currentTime);
  }, []);

  const onProgressPointerDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar) return;
      e.preventDefault();
      setScrubbing(true);
      const rect = bar.getBoundingClientRect();
      const apply = (clientX: number) => {
        const ratio = (clientX - rect.left) / rect.width;
        seekTo(ratio);
      };
      apply(e.clientX);

      const onMove = (ev: globalThis.MouseEvent) => apply(ev.clientX);
      const onUp = () => {
        setScrubbing(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [seekTo]
  );

  const setVolumeRatio = useCallback((ratio: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    v.volume = clamped;
    v.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const onVolumePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const bar = volumeRef.current;
      if (!bar) return;
      e.preventDefault();
      setAdjustingVolume(true);
      const rect = bar.getBoundingClientRect();
      const apply = (clientX: number) => {
        setVolumeRatio((clientX - rect.left) / rect.width);
      };
      apply(e.clientX);

      const onMove = (ev: globalThis.MouseEvent) => apply(ev.clientX);
      const onUp = () => {
        setAdjustingVolume(false);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [setVolumeRatio]
  );

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
    if (!v.muted && v.volume === 0) {
      v.volume = 1;
      setVolume(1);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      /* noop */
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        setHovering(true);
        revealControls();
      }}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        setHovering(false);
        if (playing) scheduleHideControls();
      }}
      className={cn(
        'group relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-black/10 dark:ring-white/10',
        isFullscreen && 'aspect-auto h-full rounded-none ring-0',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (!v) return;
          setDuration(v.duration || 0);
          setVolume(v.volume);
          setIsMuted(v.muted);
          setReady(true);
          setHasError(false);
        }}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (!v || scrubbing) return;
          setCurrentTime(v.currentTime);
        }}
        onProgress={() => {
          const v = videoRef.current;
          if (!v) return;
          try {
            if (v.buffered.length > 0) {
              setBuffered(v.buffered.end(v.buffered.length - 1));
            }
          } catch {
            /* ignore */
          }
        }}
        onPlay={() => {
          setPlaying(true);
          setWaiting(false);
        }}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onCanPlay={() => setWaiting(false)}
        onEnded={() => setPlaying(false)}
        onVolumeChange={() => {
          const v = videoRef.current;
          if (!v) return;
          setIsMuted(v.muted);
          setVolume(v.volume);
        }}
        onError={() => {
          setHasError(true);
          setWaiting(false);
          setReady(false);
        }}
        className="size-full bg-black object-contain"
      />

      {(!ready || waiting) && !hasError ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="size-10 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </div>
      ) : null}

      {hasError ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center text-sm text-white/90">
          视频加载失败
        </div>
      ) : null}

      {!playing && ready && !hasError ? (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-xl ring-1 ring-black/5 backdrop-blur transition group-hover:scale-105 dark:bg-white dark:text-gray-900">
            <svg viewBox="0 0 24 24" className="ml-1 size-7" fill="currentColor" aria-hidden>
              <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
            </svg>
          </span>
        </button>
      ) : null}

      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2 pt-8 transition-opacity duration-200',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div
          ref={progressRef}
          onMouseDown={onProgressPointerDown}
          className={cn(
            'pointer-events-auto group/progress relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-[height] hover:h-2',
            scrubbing && 'h-2'
          )}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30"
            style={{ width: `${bufferedRatio * 100}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white"
            style={{ width: `${progress * 100}%` }}
          />
          <span
            className={cn(
              'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow ring-2 ring-white/60 transition-opacity',
              (scrubbing || hovering) && 'opacity-100'
            )}
            style={{ left: `${progress * 100}%` }}
          />
        </div>

        <div className="pointer-events-auto mt-2 flex items-center gap-3 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-white/15"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="ml-0.5 size-5" fill="currentColor" aria-hidden>
                <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.29-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
              </svg>
            )}
          </button>

          <span className="select-none font-mono text-[11px] tabular-nums text-white/85">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <div className="group/vol relative flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="flex size-8 items-center justify-center rounded-full transition hover:bg-white/15"
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                    <path d="M12 4 7 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3l5 4Zm7.07.93-1.41 1.41L19.17 8 17.66 9.51l1.41 1.41L17.66 12.34l1.41 1.41L20.59 12.16l1.51 1.51 1.41-1.41-1.51-1.51 1.51-1.51-1.41-1.41-1.51 1.51Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                    <path d="M12 4 7 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3l5 4ZM16 8.5c1.2.9 2 2.3 2 3.9s-.8 3-2 3.9V8.5ZM18.5 5.5c2.4 1.5 4 4.1 4 7s-1.6 5.5-4 7v-2.3c1.5-1.1 2.5-2.8 2.5-4.7s-1-3.6-2.5-4.7V5.5Z" />
                  </svg>
                )}
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-[width,opacity] duration-200',
                  hovering || adjustingVolume ? 'w-20 opacity-100' : 'w-0 opacity-0'
                )}
              >
                <div
                  ref={volumeRef}
                  onMouseDown={onVolumePointerDown}
                  className="relative ml-1 h-1 w-16 cursor-pointer rounded-full bg-white/25"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {onDownload ? (
              <button
                type="button"
                onClick={onDownload}
                aria-label="Download"
                className="flex size-8 items-center justify-center rounded-full transition hover:bg-white/15"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              </button>
            ) : null}

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              className="flex size-8 items-center justify-center rounded-full transition hover:bg-white/15"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M9 4v5H4" />
                  <path d="M20 9h-5V4" />
                  <path d="M15 20v-5h5" />
                  <path d="M4 15h5v5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 9V4h5" />
                  <path d="M20 9V4h-5" />
                  <path d="M4 15v5h5" />
                  <path d="M20 15v5h-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
