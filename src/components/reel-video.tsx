"use client";

import { useEffect, useRef } from "react";

// Plays when the reel is mostly on screen, pauses when you scroll away.
// It also keeps the address bar pointing at the reel on screen (#reel-<id>),
// so coming back from the comments page lands on the same reel.
export function ReelVideo({ src, reelId }: { src: string; reelId: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const anchor = `#reel-${reelId}`;
    if (window.location.hash === anchor) {
      video.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reelId]);

  // Safety net: only one reel may play at a time.
  function pauseOthers() {
    document.querySelectorAll("video").forEach((other) => {
      if (other !== ref.current) other.pause();
    });
  }

  return (
    <video
      ref={ref}
      src={src}
      onPlay={pauseOthers}
      className="h-full w-full object-cover"
      controls
      loop
      playsInline
      preload="metadata"
    />
  );
}
