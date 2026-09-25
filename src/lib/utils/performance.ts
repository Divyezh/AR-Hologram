export class FPSTracker {
  private frameCount = 0;
  private lastTime = performance.now();
  private currentFps = 60;

  public tick(): number {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTime;

    if (elapsed >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastTime = now;
    }
    return this.currentFps;
  }

  public getFPS(): number {
    return this.currentFps;
  }
}
