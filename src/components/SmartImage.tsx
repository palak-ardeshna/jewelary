"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

// next/image wrapper that shows a shimmer skeleton until the image decodes, then
// fades it in. Works with both `fill` and fixed-size usage. The parent element
// must be `position: relative` for the skeleton overlay to size correctly.
export function SmartImage({ style, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  const transition = [style?.transition, "opacity 500ms var(--ease-luxe, cubic-bezier(.22,1,.36,1))"]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {!loaded && (
        <span
          className="skeleton"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, borderRadius: "inherit", zIndex: 0 }}
        />
      )}
      <Image
        {...props}
        onLoad={(e) => { setLoaded(true); onLoad?.(e); }}
        style={{ ...style, opacity: loaded ? 1 : 0, transition }}
      />
    </>
  );
}
