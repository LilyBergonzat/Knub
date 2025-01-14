type InternalQueueFn = () => Promise<void>;
type AnyFn = (...args: any[]) => any;

const DEFAULT_TIMEOUT = 10 * 1000;

export class Queue<TQueueFunction extends AnyFn = AnyFn> {
  protected running = false;
  protected queue: InternalQueueFn[] = [];
  protected timeout: number;

  constructor(timeout = DEFAULT_TIMEOUT) {
    this.timeout = timeout;
  }

  public add(fn: TQueueFunction): Promise<void> {
    const promise = new Promise<void>((resolve, reject) => {
      this.queue.push(async () => {
        await Promise.resolve(fn()).then(resolve).catch(reject);
      });

      if (!this.running) this.next();
    });

    return promise;
  }

  public next(): void {
    this.running = true;

    if (this.queue.length === 0) {
      this.running = false;
      return;
    }

    const fn = this.queue.shift()!;
    void new Promise((resolve) => {
      // Either fn() completes or the timeout is reached
      void fn().then(resolve);
      setTimeout(resolve, this.timeout);
    }).then(() => this.next());
  }

  public clear(): void {
    this.queue.splice(0, this.queue.length);
  }
}
