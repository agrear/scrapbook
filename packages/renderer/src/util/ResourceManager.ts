import { Mutex } from 'async-mutex';

import { Cache } from './Cache';

type Id = string;

type Deferred<T> = {
  resolve: (resource: T) => void,
  reject: (reason?: any) => void
};

type Task<T> = { resourceId: Id } & Deferred<T>;

export type ResourceManagerOptions<T> = {
  allocate: (resourceId: Id) => Promise<T>,
  free?: (resource: T) => void,
  concurrency?: number,
  queueSize?: number,
  cacheSize?: number
};

export class ResourceManager<T> {
  public constructor({
    allocate,
    free,
    concurrency = 5,
    queueSize = 50,
    cacheSize = 100
  }: ResourceManagerOptions<T>) {
    this.allocate = allocate;
    this.concurrency = concurrency;
    this.queueSize = queueSize;
    this.cache = new Cache<T>({ free, maxSize: cacheSize });
  }

  public async get(resourceId: Id): Promise<T> {
    const { promise } = await this.mutex.runExclusive(() => {
      // Create new request
      const deferred: Deferred<T> = {
        resolve: () => {},
        reject: () => {}
      };

      const promise = new Promise<T>((resolve, reject) => {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      // Add request to queue
      this.requests.push({ resourceId, ...deferred });
      //console.log(`Added ${resourceId} to queue`);
      if (this.requests.length > this.queueSize) {
        this.requests.shift()?.reject();
        //console.log('Queue full');
      }

      return { promise };
    });

    this.runTasks();

    return promise;
  }

  public async setMaxStorage(maxStorage: number) {
    await this.mutex.runExclusive(() => {
      this.cache.setMaxSize(maxStorage);
    });
  }

  public async dispose() {
    await this.mutex.runExclusive(() => {
      this.tasks.forEach(({ reject }) => reject());
      this.tasks = [];

      this.requests.forEach(({ reject }) => reject());
      this.requests = [];

      this.cache.clear();
    });
  }

  private async runTasks() {
    await this.mutex.runExclusive(() => {
      // Start tasks
      while (this.tasks.length < this.concurrency) {
        const request = this.requests.shift();
        if (request === undefined) {
          //console.log('Idle');
          break; // => Idle
        }

        //console.log(`Run task: ${request.resourceId}`);

        const { resourceId, resolve, reject } = request;
        const resource = this.cache.get(resourceId);
        if (resource !== undefined) {  // Cache hit
          resolve(resource);
          //console.log(`Cache hit: ${request.resourceId}`);
        } else {  // Cache miss
          this.tasks.push({ resourceId, resolve, reject });
          //console.log(`Request ${request.resourceId}`);
          this.allocate(request.resourceId).then(async resource => {
            resolve(resource);
            //console.log(`Resolved ${request.resourceId}`);

            await this.mutex.runExclusive(() => {
              this.cache.set(resourceId, resource);
              this.tasks.splice(this.tasks.findIndex(task => (
                task.resourceId === request.resourceId
              )), 1);
              //console.log(`Cached ${request.resourceId}`);
            });

            //console.log(`Completed ${request.resourceId}`);

            this.runTasks();
          }).catch(reject);
        }
      }
    });
  }

  private readonly allocate: ResourceManagerOptions<T>['allocate'];
  private readonly concurrency: number;
  private readonly queueSize: number;

  private readonly mutex = new Mutex();
  private readonly cache: Cache<T>;

  private requests: Array<Task<T>> = [];
  private tasks: Array<Task<T>> = [];
}
