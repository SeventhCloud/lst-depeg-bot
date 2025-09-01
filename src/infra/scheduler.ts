/**
 * Simple scheduler to run an asynchronous job at a fixed interval.
 */
export class Scheduler {
  /**
   * @param job - Async function to execute periodically
   * @param intervalMs - Interval in milliseconds between executions
   */
  constructor(private job: () => Promise<void>, private intervalMs: number) {}

  /**
   * Starts the scheduler:
   * 1. Executes the job immediately once
   * 2. Sets up a repeating interval, logging any errors
   */
  start() {
    this.job(); // Run immediately on start
    setInterval(() => this.job().catch(console.error), this.intervalMs); // Schedule repeating execution
  }
}
