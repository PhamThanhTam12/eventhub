import { useState } from "react";

export default function EventImage({ src, alt, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageSrc = !src || failedSrc === src ? "/event-placeholder.svg" : src;

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      onError={() => setFailedSrc(src)}
    />
  );
}
