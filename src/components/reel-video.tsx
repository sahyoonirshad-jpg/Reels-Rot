"use client";

import { useEffect, useRef } from "react";

// Plays when the reel is mostly on screen, pauses when you scroll away.
export function ReelVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
  }, []);

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
