import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "./LanguageContext";

const MUSIC_MUTED_KEY = "alyazouri_music_muted";
const YOUTUBE_VIDEO_ID = "x-DJKKK8kns";
const MUSIC_VOLUME = 15; // low ambient background music (0–100)

type PlayerHandle = {
  setVolume(vol: number): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  destroy(): void;
};

export function MusicPlayer() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUSIC_MUTED_KEY) === "true"; } catch { return false; }
  });
  const [ready, setReady] = useState(false);
  const playerRef = useRef<PlayerHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const div = document.createElement("div");
    div.id = "yt-music-player";
    div.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(div);
    containerRef.current = div;

    const w = window as unknown as { YT?: { Player: new (id: string, opts: unknown) => PlayerHandle }; onYouTubeIframeAPIReady?: () => void };

    if (!w.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const createPlayer = (PlayerClass: new (id: string, opts: unknown) => PlayerHandle) => {
      if (playerRef.current) return;
      const player = new PlayerClass("yt-music-player", {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID, controls: 0, disablekb: 1,
          fs: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3, origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerRef.current = player;
            player.setVolume(MUSIC_VOLUME);
            setReady(true);
            if (!muted) startPlayback();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === 1) setPlaying(true);
            else if (event.data === 0) { player.seekTo(0, true); player.playVideo(); }
          },
          onError: () => {},
        },
      });
    };

    const checkReady = () => {
      const yt = w.YT;
      if (yt?.Player) createPlayer(yt.Player);
      else setTimeout(checkReady, 300);
    };
    w.onYouTubeIframeAPIReady = () => {
      const yt = w.YT;
      if (yt) createPlayer(yt.Player);
    };
    checkReady();

    return () => {
      try { playerRef.current?.destroy(); } catch { /* */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.setVolume(MUSIC_VOLUME);
      player.playVideo();
      setPlaying(true);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    if (!ready || muted) return;
    const handler = () => { startPlayback(); };
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("touchstart", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [ready, muted, startPlayback]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) {
      setMuted((m) => {
        const next = !m;
        try { localStorage.setItem(MUSIC_MUTED_KEY, String(next)); } catch { /* */ }
        return next;
      });
      return;
    }
    if (muted || !playing) {
      player.setVolume(MUSIC_VOLUME);
      player.playVideo();
      setMuted(false);
      setPlaying(true);
      try { localStorage.setItem(MUSIC_MUTED_KEY, "false"); } catch { /* */ }
    } else {
      player.pauseVideo();
      setMuted(true);
      setPlaying(false);
      try { localStorage.setItem(MUSIC_MUTED_KEY, "true"); } catch { /* */ }
    }
  }, [muted, playing]);

  return (
    <button
      onClick={toggleMute}
      title={isAr ? "موسيقى الخلفية" : "Background music"}
      className={`fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border text-lg shadow-2xl backdrop-blur-lg transition-all ${
        playing && !muted
          ? "border-orange-400/50 bg-orange-500/20 text-orange-300 pulse-glow"
          : "border-white/10 bg-[#0a0a14]/80 text-white/60 hover:text-white"
      }`}
    >
      {playing && !muted ? "🎵" : "🔇"}
      {playing && !muted && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
        </span>
      )}
    </button>
  );
}
