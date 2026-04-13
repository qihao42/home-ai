import { useRef, useEffect } from 'react';
import type { Frame } from '../engine/types';
import { GRID_SIZE } from '../engine/types';

interface LedMatrixProps {
  frame: Frame;
  size?: number;
}

export function LedMatrix({ frame, size = 400 }: LedMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const cellSize = size / GRID_SIZE;
    const ledRadius = cellSize * 0.38;

    // Clear with dark background
    ctx.fillStyle = '#0d0d12';
    ctx.fillRect(0, 0, size, size);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(size, i * cellSize);
      ctx.stroke();
    }

    // Draw LEDs
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const [r, g, b] = frame[y][x];
        const cx = x * cellSize + cellSize / 2;
        const cy = y * cellSize + cellSize / 2;
        const isLit = r > 5 || g > 5 || b > 5;

        if (isLit) {
          // Glow effect
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, ledRadius * 2);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(cx - ledRadius * 2, cy - ledRadius * 2, ledRadius * 4, ledRadius * 4);

          // LED body
          ctx.beginPath();
          ctx.arc(cx, cy, ledRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fill();

          // Specular highlight
          ctx.beginPath();
          ctx.arc(cx - ledRadius * 0.2, cy - ledRadius * 0.2, ledRadius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, 0.25)`;
          ctx.fill();
        } else {
          // Unlit LED
          ctx.beginPath();
          ctx.arc(cx, cy, ledRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#15151f';
          ctx.fill();
        }
      }
    }
  }, [frame, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-2xl border border-white/5 shadow-2xl"
      style={{ imageRendering: 'auto' }}
    />
  );
}
