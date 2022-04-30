import Heap from 'heap';

type CacheEntry<T> = {
  timestamp: number,
  key: string,
  value: T
};

function compare<T>(a: CacheEntry<T>, b: CacheEntry<T>) {
  return a.timestamp - b.timestamp;
}

export class Cache<T> {
  public constructor({
    free,
    maxSize = 0
  }: {
    free?: (value: T) => void,
    maxSize?: number
  }) {
    this.free = free;
    this.maxSize = maxSize;
  }

  public set(key: string, timestamp: number, value: T) {
    const entry = { timestamp, key, value };

    // Make sure we're not exceeding the maximum cache size
    if (this.maxSize > 0 && this.entries.size >= this.maxSize) {
      const entry = this.stats.pop();  // Remove oldest entry
      this.entries.delete(entry.key);
      this.free?.(entry.value);
    }

    this.entries.set(key, entry);
    this.stats.push(entry);
  }

  public get(key: string) {
    return this.entries.get(key)?.value;
  }

  public clear() {
    this.entries.forEach(({ value }) => this.free?.(value));
    this.entries.clear();

    this.stats = new Heap(compare);
  }

  public setMaxSize(maxSize: number) {
    // Make sure we're not exceeding the new cache size
    if (maxSize > 0 && this.entries.size > maxSize) {
      this.stats.heapify();  // Rebuild heap to account for entry updates
      do {  // Remove entry with least amount of cache hits
        const entry = this.stats.pop();
        this.entries.delete(entry.key);
        this.free?.(entry.value);
      } while (this.entries.size > maxSize);
    }

    this.maxSize = maxSize;
  }

  private readonly free: ((value: T) => void) | undefined;
  private readonly entries = new Map<string, CacheEntry<T>>();
  private stats = new Heap<CacheEntry<T>>(compare);
  private maxSize: number;
}
