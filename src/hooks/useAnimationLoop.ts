import { useEffect, useRef, useCallback } from 'react';

export function useAnimationLoop(callback: (time: number, dt: number) => void) {
  const rafId = useRef(0);
  const lastTime = useRef(0);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    const dt = lastTime.current ? (time - lastTime.current) / 1000 : 0.016;
    lastTime.current = time;
    callbackRef.current(time, Math.min(dt, 0.05)); // clamp dt to avoid spiral
    rafId.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [loop]);
}
