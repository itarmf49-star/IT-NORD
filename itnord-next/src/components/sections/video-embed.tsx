"use client";

import { useState } from "react";
import Image from "next/image";

type VideoEmbedProps = {
  videoId: string;
  title: string;
};

export function VideoEmbed({ videoId, title }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnail = `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;

  return (
    <div className="video-card">
      {isPlaying ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="video-launch" onClick={() => setIsPlaying(true)} aria-label={`Play video: ${title}`}>
          <Image src={thumbnail} alt={`Preview for ${title}`} fill sizes="(max-width: 900px) 100vw, 900px" />
          <span className="play-button" aria-hidden>
            ▶
          </span>
        </button>
      )}
    </div>
  );
}
