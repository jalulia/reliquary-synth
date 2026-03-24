interface Props {
  onUnlock: () => void;
}

export function AudioUnlockOverlay({ onUnlock }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void cursor-pointer riso-grain"
      onClick={onUnlock}
    >
      <div className="text-center animate-fade-in">
        <h1
          className="font-display text-gilt-bright mb-6"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
        >
          Reliquary Synth
        </h1>

        <div className="w-16 h-px bg-gilt-dim mx-auto mb-6" />

        <p className="font-label text-ink text-sm italic animate-breathe">
          Touch to Awaken
        </p>

        <div className="mt-12 text-faded font-data text-xs tracking-widest uppercase">
          Arcade Commons
        </div>
      </div>
    </div>
  );
}
