"use client";

import { useEffect, useRef } from "react";

const ON_SCREEN = 0.6; // a reel counts as "on screen" when at least 60% of it is visible

// Plays when the reel is mostly on screen, pauses when you scroll away.
// It also keeps the address bar pointing at the reel on screen (#reel-<id>),
// so coming back from the comments page lands on the same reel.
export function ReelVideo({ src, reelId }: { src: string; reelId: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const onScreen = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const anchor = `#reel-${reelId}`;
    if (window.location.hash === anchor) {
      video.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Use the visible percentage, not isIntersecting: isIntersecting stays true
        // while a reel is only a sliver on screen, which made off-screen reels play.
        onScreen.current = entry.intersectionRatio >= ON_SCREEN;

        if (onScreen.current) {
          // Update the address without reloading (keeps Next.js's own history info).
          window.history.replaceState(window.history.state, "", anchor);
          video.play().catch(() => {
            // Browsers block autoplay with sound until you've tapped the page once,
            // so start muted instead. The viewer can unmute with the controls.
            video.muted = true;
            video.play().catch(() => {});
          });
        } else {
          video.pause();
        }
      },
      { threshold: ON_SCREEN }
    );

    observer.observe(video);

    // Pause when the tab is hidden (switched tab, minimized window), so no reel
    // keeps playing somewhere you can't see it. When the tab comes back, Chrome
    // sometimes forgets to redraw the picture (sound only, empty box), so we
    // nudge the video to its own current time, which forces a fresh frame.
    function pauseWhenHidden() {
      if (!video) return;
      if (document.hidden) {
        video.pause();
      } else if (video.readyState > 0) {
        video.currentTime = video.currentTime;
      }
    }
    document.addEventListener("visibilitychange", pauseWhenHidden);
    window.addEventListener("pagehide", pauseWhenHidden);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      window.removeEventListener("pagehide", pauseWhenHidden);
    };
  }, [reelId]);

  function handlePlay() {
    const video = ref.current;
    if (!video) return;

    // Safety lock: a reel that isn't on screen is never allowed to play.
    if (!onScreen.current) {
      video.pause();
      return;
    }

    // Only one reel may play at a time.
    document.querySelectorAll("video").forEach((other) => {
      if (other !== video) other.pause();
    });
  }

  return (
    <video
      ref={ref}
      src={src}
      onPlay={handlePlay}
      className="h-full w-full object-cover"
      controls
      loop
      playsInline
      preload="metadata"
    />
  );
}
