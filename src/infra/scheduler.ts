export class Scheduler {
  constructor(private job: () => Promise<void>, private intervalMs: number) {}

  start() {
    this.job(); // run once
    setInterval(() => this.job().catch(console.error), this.intervalMs);
  }
}
