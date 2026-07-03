import { useState, useRef, useCallback } from "react";
import { useLang } from "./LanguageContext";

const MUSIC_MUTED_KEY = "alyazouri_music_muted";
const YOUTUBE_VIDEO_ID = "x-DJKKK8kns";
const MUSIC_VOLUME = 15;

export function MusicPlayer() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(MUSIC_MUTED_KEY) === "true"; } catch { return false; }
  });
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ---- LAZY: only load YouTube when user first clicks ----
  const initPlayer = useCallback(() => {
    if (loaded) return;
    setLoaded(true);

    const div = document.createElement("div");
    div.id = "yt-music-player";
    div.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(div);
    containerRef.current = div;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const create = (PC: any) => {
      if (playerRef.current) return;
      const p = new PC("yt-music-player", {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: { autoplay: 0, loop: 1, playlist: YOUTUBE_VIDEO_ID, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3, origin: window.location.origin },
        events: {
          onReady: () => {
            playerRef.current = p;
            p.setVolume(MUSIC_VOLUME);
            unmute(p);
          },
          onStateChange: (e: { data: number }) => { if (e.data === 0) { p.seekTo(0, true); p.playVideo(); } },
          onError: () => {},
        },
      });
    };

    w.onYouTubeIframeAPIReady = () => { if (w.YT) create(w.YT.Player); };

    if (!w.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const check = () => { if (w.YT?.Player) create(w.YT.Player); else setTimeout(check, 200); };
    check();
  }, [loaded]);

  const unmute = useCallback((p?: any) => {
    const player = p ?? playerRef.current;
    if (!player) return;
    try { player.setVolume(MUSIC_VOLUME); player.playVideo(); } catch { /* */ }
    setMuted(false);
    setPlaying(true);
    try { localStorage.setItem(MUSIC_MUTED_KEY, "false"); } catch { /* */ }
  }, []);

  const mute = useCallback(() => {
    const player = playerRef.current;
    if (!player) { setMuted(true); try { localStorage.setItem(MUSIC_MUTED_KEY, "true"); } catch { /* */ } return; }
    try { player.pauseVideo(); } catch { /* */ }
    setMuted(true);
    setPlaying(false);
    try { localStorage.setItem(MUSIC_MUTED_KEY, "true"); } catch { /* */ }
  }, []);

  const toggle = () => {
    if (!loaded) { initPlayer(); return; }
    if (muted) unmute(); else mute();
  };

  return (
    <button
      onClick={toggle}
      title={isAr ? "موسيقى الخلفية" : "Background music"}
      className={`fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border text-lg shadow-2xl backdrop-blur-lg transition-all ${
        playing && !muted
          ? "border-orange-400/50 bg-orange-500/20 text-orange-300"
          : "border-white/10 bg-[#0a0a14]/80 text-white/60 hover:text-white"
      }`}
    >
      {playing && !muted ? "🎵" : "🔇"}
    </button>
  );
}
