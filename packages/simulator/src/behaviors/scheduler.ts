export function createInterval(
  callback: () => void,
  minMs: number,
  maxMs: number
): { start(): void; stop(): void } {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let running = false;

  function scheduleNext(): void {
    if (!running) {
      return;
    }
    const delay = minMs + Math.random() * (maxMs - minMs);
    timerId = setTimeout(() => {
      if (!running) {
        return;
      }
      try {
        callback();
      } catch (error) {
        process.stdout.write(`[scheduler] Callback error: ${error}\n`);
      }
      scheduleNext();
    }, delay);
  }

  return {
    start(): void {
      running = true;
      scheduleNext();
    },
    stop(): void {
      running = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    },
  };
}
