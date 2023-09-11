import Heap from 'heap';

type Id = string;

type CacheEntry<T> = {
  key: Id,
  value: T,
  timestamp: number
};

export type CacheOptions<T> = {
  free?: (value: T) => void,
  maxSize?: number
};

function compare<T>(a: CacheEntry<T>, b: CacheEntry<T>) {
  return a.timestamp - b.timestamp;
}

export class Cache<T> {
  public constructor({ free, maxSize = Infinity }: CacheOptions<T>) {
    if (maxSize < 1) {
      throw RangeError('Maximum size must be at least 1');
    }

    this.free = free;
    this.maxSize = maxSize;
  }

  public set(key: Id, value: T) {
    const entry = { key, value, timestamp: new Date().getTime() };

    // Make sure we're not exceeding the maximum cache size
    if (this.entries.size >= this.maxSize) {
      this.stats.heapify();
      // Remove oldest entry
      const { key, value } = this.stats.replace(entry);
      this.entries.delete(key);
      this.free?.(value);
    } else {
      this.stats.push(entry);
    }

    this.entries.set(key, entry);
  }

  public get(key: Id) {
    const entry = this.entries.get(key);
    if (entry !== undefined) {  // Update timestamp
      entry.timestamp = new Date().getTime();

      return entry.value;
    }
  }

  public clear() {
    this.entries.forEach(({ value }) => this.free?.(value));
    this.entries.clear();

    this.stats = new Heap(compare);
  }

  public setMaxSize(maxSize: number) {
    // Make sure we're not exceeding the new cache size
    if (this.entries.size > maxSize) {
      this.stats.heapify();
      do {  // Remove oldest entries
        const entry = this.stats.pop();
        if (entry !== undefined) {
          this.entries.delete(entry.key);
          this.free?.(entry.value);
        }
      } while (this.entries.size > maxSize);
    }

    this.maxSize = maxSize;
  }

  public get size(): number {
    return this.entries.size;
  }

  private readonly free: ((value: T) => void) | undefined;
  private readonly entries = new Map<Id, CacheEntry<T>>();
  private stats = new Heap<CacheEntry<T>>(compare);
  private maxSize: number;
}
