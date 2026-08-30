import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Video, AlertTriangle, Radio, Shield, Zap } from 'lucide-react';

interface LiveVideoPlayerProps {
  cameraId: string;
  streamId?: number | string;
  name?: string;
  location?: string;
  department?: string;
  vms?: string;
  protocol?: string;
  rtspUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  showOsd?: boolean;
  className?: string;
  onDetect?: (plate: string) => void;
}

export default function LiveVideoPlayer({
  cameraId,
  streamId,
  name,
  location,
  department,
  vms = 'Milestone XProtect',
  protocol = 'RTSP/HLS',
  rtspUrl,
  autoPlay = true,
  muted = true,
  showOsd = true,
  className = 'aspect-video w-full',
}: LiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [status, setStatus] = useState<'CONNECTING' | 'LIVE' | 'BUFFERING' | 'STANDBY'>('CONNECTING');
  const [time, setTime] = useState(new Date());

  // Derive stream ID (1 to 30)
  const numericId = typeof streamId === 'number'
    ? streamId
    : parseInt(String(cameraId).replace(/\D/g, ''), 10) || 1;
  const safeStreamId = ((numericId - 1) % 30) + 1;

  // Live Hackathon HLS stream URL from live.corp8.cloud
  const hlsUrl = `https://live.corp8.cloud/live/stream/${safeStreamId}/index.m3u8`;
  const defaultRtsp = rtspUrl || `rtsp://live.corp8.cloud:8554/stream/${safeStreamId}`;

  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 500);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setStatus('CONNECTING');

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 6,
        liveDurationInfinity: true,
        lowLatencyMode: true,
        maxBufferLength: 8,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => {
          setIsPlaying(true);
          setStatus('LIVE');
        }).catch(() => {
          setStatus('STANDBY');
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            setHasError(true);
            setStatus('STANDBY');
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => {
          setIsPlaying(true);
          setStatus('LIVE');
        }).catch(() => {
          setStatus('STANDBY');
        });
      });
    } else {
      setHasError(true);
      setStatus('STANDBY');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [hlsUrl]);

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden select-none ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isPlaying && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Fallback Simulation Background if camera stream is offline/loading */}
      {(!isPlaying || hasError) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-sentinel-dark/70 to-black/90 flex items-center justify-center p-4">
          <div className="text-center">
            <Video className="w-10 h-10 text-sentinel-accent mx-auto mb-2 animate-pulse" />
            <div className="text-xs font-black text-white font-mono uppercase tracking-wider">
              {status === 'CONNECTING' ? 'CONNECTING LIVE STREAM...' : 'RTSP STREAM CARRIER STANDBY'}
            </div>
            <div className="text-[10px] text-sentinel-muted mt-1 font-mono">
              Gateway: live.corp8.cloud • Stream #{safeStreamId}
            </div>
            <div className="text-[9px] text-sentinel-accent mt-1 font-mono">
              TCP RTSP: {defaultRtsp}
            </div>
          </div>
        </div>
      )}

      {/* Real-time OSD Overlay (On-Screen Display) */}
      {showOsd && (
        <>
          {/* Top Left: Camera ID & Live status */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-sentinel-accent font-mono font-black text-[10px] border border-white/10">
              {cameraId || `CAM-${String(safeStreamId).padStart(3, '0')}`}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-600/90 text-white font-black text-[9px] tracking-wider flex items-center gap-1 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
            <span className="px-1.5 py-0.5 rounded bg-black/60 text-white/80 text-[8px] font-mono">
              PTS SYNC
            </span>
          </div>

          {/* Top Right: Real-time Date/Time Timestamp */}
          <div className="absolute top-2 right-2 z-20 text-right pointer-events-none bg-black/70 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
            <div className="text-xs font-bold text-white font-mono leading-none">
              {time.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="text-[8px] text-sentinel-muted font-mono leading-none mt-0.5">
              {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {/* Simulated ANPR Bounding Box for Demo Cameras */}
          {safeStreamId % 3 === 0 && (
            <div className="absolute top-1/3 left-1/4 z-10 border-2 border-sentinel-accent rounded px-2 py-1 bg-sentinel-accent/15 pointer-events-none animate-pulse-slow">
              <span className="text-[8px] font-bold text-sentinel-accent font-mono block">ANPR 96.8%</span>
              <span className="text-xs font-black text-white font-mono">GJ01AB1234</span>
            </div>
          )}

          {/* Bottom Bar: Location & Ingestion Info */}
          <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded border border-white/10 text-xs">
            <div className="truncate mr-2">
              <div className="text-white font-bold text-[11px] truncate">
                {name || `Camera ${safeStreamId}`} — {location || 'Gujarat Traffic Junction'}
              </div>
              <div className="text-[9px] text-sentinel-muted truncate font-mono">
                {department || 'Gujarat Police'} • {vms} • {protocol}
              </div>
            </div>
            <span className="text-[9px] font-bold text-sentinel-green px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 shrink-0">
              TCP RTSP ACTIVE
            </span>
          </div>
        </>
      )}
    </div>
  );
}
