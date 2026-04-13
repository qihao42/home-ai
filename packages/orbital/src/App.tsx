import { useState, useEffect, useRef, useCallback } from 'react';
import { LedMatrix } from './components/LedMatrix';
import { ControlPanel } from './components/ControlPanel';
import { AnimationEngine } from './engine/AnimationEngine';
import { animations } from './engine/animations';
import type { Animation, Frame } from './engine/types';
import { createEmptyFrame } from './engine/types';

function App() {
  const engineRef = useRef<AnimationEngine | null>(null);
  const [frame, setFrame] = useState<Frame>(createEmptyFrame());
  const [currentAnimation, setCurrentAnimation] = useState<Animation>(animations[0]);
  const [brightness, setBrightness] = useState(0.85);
  const [hue, setHue] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);

  // Initialize engine
  useEffect(() => {
    const engine = new AnimationEngine();
    engineRef.current = engine;
    engine.setOnFrame(setFrame);
    engine.setAnimation(currentAnimation);
    engine.setBrightness(brightness);
    engine.setParams({ hue });
    engine.start();

    return () => engine.stop();
  }, []);

  const handleSelectAnimation = useCallback((anim: Animation) => {
    setCurrentAnimation(anim);
    const engine = engineRef.current;
    if (engine) {
      engine.setAnimation(anim);
      if (!engine.isRunning()) {
        setIsPlaying(true);
        engine.start();
      }
    }
  }, []);

  const handleBrightnessChange = useCallback((val: number) => {
    setBrightness(val);
    engineRef.current?.setBrightness(val);
  }, []);

  const handleHueChange = useCallback((val: number) => {
    setHue(val);
    engineRef.current?.setParams({ hue: val });
  }, []);

  const handleTogglePlay = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isRunning()) {
      engine.stop();
      setIsPlaying(false);
    } else {
      engine.start();
      setIsPlaying(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">Orbital</h1>
            <p className="text-white/40 text-xs">LED Sphere Simulator</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-white/30">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
            {isPlaying ? 'Running' : 'Paused'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* LED Matrix Display */}
          <div className="flex flex-col items-center gap-4">
            <LedMatrix frame={frame} size={420} />
            <p className="text-white/30 text-xs">
              {currentAnimation.icon} {currentAnimation.name} at {currentAnimation.fps}fps
            </p>
          </div>

          {/* Control Panel */}
          <div className="w-full lg:w-80 bg-white/[0.03] border border-white/10 rounded-2xl p-5 min-h-[420px] flex">
            <ControlPanel
              currentAnimation={currentAnimation}
              onSelectAnimation={handleSelectAnimation}
              brightness={brightness}
              onBrightnessChange={handleBrightnessChange}
              hue={hue}
              onHueChange={handleHueChange}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-3 text-center text-xs text-white/20">
        Project Orbital - Phase 1 Visual Simulator - ESP32-S3 + WS2812B
      </footer>
    </div>
  );
}

export default App;
