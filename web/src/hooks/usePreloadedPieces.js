import { useEffect, useState } from 'react';
import { PIECE_IMAGE_SOURCES } from '../game/pieceAssets';

// Preloads every chess piece image into HTMLImageElement objects so that
// Konva can paint them to the canvas immediately (no flicker on first drag).
//
// Returns:
//   images: map of piece code -> HTMLImageElement (only once all are ready)
//   ready:  boolean indicating preloading is complete

export function usePreloadedPieces() {
  const [images, setImages] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const entries = Object.entries(PIECE_IMAGE_SOURCES);

    const loaders = entries.map(
      ([code, src]) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve([code, img]);
          // On error still resolve so one bad asset can't block the board.
          img.onerror = () => resolve([code, img]);
          img.src = src;
        })
    );

    Promise.all(loaders).then((loaded) => {
      if (cancelled) return;
      setImages(Object.fromEntries(loaded));
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { images, ready };
}
