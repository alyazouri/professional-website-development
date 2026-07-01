import { useState, useRef, useEffect, useCallback } from "react";
import { useLang } from "./LanguageContext";

const MUSIC_MUTED_KEY = "alyazouri_music_muted";
const YOUTUBE_VIDEO_ID = "x-DJKKK8kns";

export function MusicPlayer() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUSIC_MUTED_KEY) === "true"; } catch { return false; }
  });
  const [ready, setReady] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
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

    if (!(window as unknown as { YT?: unknown }).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const checkReady = () => {
      const yt = (window as unknown as { YT?: { Player: new (id: string, opts: unknown) => YT.Player } }).YT;
      if (yt?.Player) createPlayer(yt.Player);
      else setTimeout(checkReady, 300);
    };

    (window as unknown as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = () => {
      const yt = (window as unknown as { YT: { Player: new (id: string, opts: unknown) => YT.Player } }).YT;
      createPlayer(yt.Player);
    };
    checkReady();

    return () => {
      try { playerRef.current?.destroy(); } catch { /* */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPlayer = useCallback((PlayerClass: new (id: string, opts: unknown) => YT.Player) => {
    if (playerRef.current) return;
    const player = new PlayerClass("yt-music-player", {
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID,
        controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0,
        showinfo: 0, iv_load_policy: 3, origin: window.location.origin,
      },
      events: {
        onReady: () => {
          playerRef.current = player;
          player.setVolume(40);
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
  }, [muted]);

  const startPlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try { player.setVolume(40); player.playVideo(); setPlaying(true); } catch { /* */ }
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
      player.setVolume(40); player.playVideo();
      setMuted(false); setPlaying(true);
      try { localStorage.setItem(MUSIC_MUTED_KEY, "false"); } catch { /* */ }
    } else {
      player.pauseVideo();
      setMuted(true); setPlaying(false);
      try { localStorage.setItem(MUSIC_MUTED_KEY, "true"); } catch { /* */ }
    }
  }, [muted, playing]);

  return (
    <button
      onClick={toggleMute}
      className="btn-ghost fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-2xl"
      title={isAr ? "الموسيقى" : "Music"}
    >
      <span className="text-lg">{playing && !muted ? "🎵" : "🔇"}</span>
      {playing && !muted && (
        <span className="flex gap-0.5">
          <span className="h-2 w-0.5 animate-pulse bg-orange-400" />
          <span className="h-3 w-0.5 animate-pulse bg-orange-400" style={{ animationDelay: "0.15s" }} />
          <span className="h-2 w-0.5 animate-pulse bg-orange-400" style={{ animationDelay: "0.3s" }} />
        </span>
      )}
    </button>
  );
}

declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    setVolume(vol: number): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    destroy(): void;
  }
}
