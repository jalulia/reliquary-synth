import { useEffect, useRef, useState } from 'react';

interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

export function useCanvasResize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState<CanvasSize>({ width: 800, height: 600, dpr: 1 });
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
        dpr,
      });
    };

    update();

    observerRef.current = new ResizeObserver(update);
    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);

  return size;
}
