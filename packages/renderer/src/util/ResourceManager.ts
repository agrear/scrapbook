import { Mutex, Semaphore } from 'async-mutex';
import Heap from 'heap';

import { Cache } from './Cache';

type Id = string;

type Request<T> = {
  resourceId: Id,
  timestamp: number,
  promise: Promise<T>,
  resolve: (resource: T) => void,
  reject: (reason?: any) => void
};

type Task = {
  resourceId: Id
};

function compare<T>(a: Request<T>, b: Request<T>) {
  return b.timestamp - a.timestamp;
}

export class ResourceManager<T> {
  public static readonly MAX_WORKERS = 1;
  public static readonly MAX_REQUESTS = 50;

  public constructor({
    allocate,
    free,
    maxStorage
  }: {
    allocate: (resourceId: string) => Promise<T>,
    free?: (resource: T) => void,
    maxStorage?: number
  }) {
    this.allocate = allocate;
    this.cache = new Cache<T>({ free, maxSize: maxStorage });
  }

  public async get(resourceId: Id): Promise<T> {
    const { promise } = await this.mutex.runExclusive(() => {
      const resource = this.cache.get(resourceId);
      if (resource !== undefined) {  // Cache hit
        return { promise: resource };
      }

      // Check for duplicate request
      let request = this.requests.find(request => (
        request.resourceId === resourceId
      ));

      if (request !== undefined) {  // Update request
        request.timestamp = new Date().getTime();
        Heap.updateItem(this.requests, request, compare);

        return { promise: request.promise };
      }

      // Create new request
      const deferred: {
        resolve?: (resource: T) => void,
        reject?: (reason?: any) => void
      } = {};

      const promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      request = {
        resourceId,
        timestamp: new Date().getTime(),
        promise,
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        resolve: deferred.resolve!,
        // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
        reject: deferred.reject!
      };

      Heap.push(this.requests, request, compare);

      return { promise };
    });

    this.onResourceRequested();

    return promise;
  }

  public async setMaxStorage(maxStorage: number) {
    await this.mutex.runExclusive(() => {
      this.cache.setMaxSize(maxStorage);
    });
  }

  public async dispose() {
    await this.mutex.runExclusive(() => {
      this.tasks = [];

      this.requests.forEach(request => request.reject());
      this.requests = [];

      this.cache.clear();
    });
  }

  private async popRequest() {
    return await this.mutex.runExclusive(() => {
      if (this.requests.length === 0) {
        return undefined;
      }

      if (this.requests.length > ResourceManager.MAX_REQUESTS) {
        const excess = this.requests.length - ResourceManager.MAX_REQUESTS;
        const oldRequests = Heap.nsmallest(this.requests, excess, compare);
        oldRequests.forEach(request => request.reject());

        this.requests = this.requests.filter(request => (
          !oldRequests.includes(request)
        ));
      }

      const request = Heap.pop(this.requests, compare);

      return request;
    });
  }

  private async onResourceRequested() {
    const success = await this.mutex.runExclusive(() => {
      if (this.working) {
        return false;
      }

      return this.working = true;
    });

    if (!success) {
      return;
    }

    let request: Request<T> | undefined;
    while ((request = await this.popRequest()) !== undefined) {
      // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
      const { resourceId, timestamp, resolve } = request!;

      this.allocate(resourceId).then(async resource => {
        resolve(resource);
        await this.onResourceAllocated(resourceId, timestamp, resource);
      });
    }

    await this.mutex.runExclusive(() => {
      this.working = false;
    });
  }

  private async onResourceAllocated(
    resourceId: Id,
    timestamp: number,
    resource: T
  ) {
    return this.mutex.runExclusive(() => {
      this.cache.set(resourceId, timestamp, resource);

      // Cleanup requests
      const requests = this.requests.filter(request => (
        request.resourceId === resourceId
      ));

      for (const request of requests) {
        request.resolve(resource);

        const index = this.requests.indexOf(request);
        this.requests.splice(index, 1);
      }
    });
  }

  private readonly mutex = new Mutex();
  private readonly semaphore = new Semaphore(ResourceManager.MAX_WORKERS);

  private readonly cache: Cache<T>;
  private readonly allocate: (resourceId: Id) => Promise<T>;

  private working = false;
  private tasks: Task[] = [];
  private requests: Array<Request<T>> = [];
}
