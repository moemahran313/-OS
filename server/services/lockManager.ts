import Redis from "ioredis";

class LocalLock {
  private activeLocks: Set<string> = new Set();
  private waiters: Map<string, (() => void)[]> = new Map();

  async acquire(key: string, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();
    while (this.activeLocks.has(key)) {
      if (Date.now() - startTime > timeoutMs) {
        return false;
      }
      await new Promise<void>((resolve) => {
        if (!this.waiters.has(key)) {
          this.waiters.set(key, []);
        }
        this.waiters.get(key)!.push(resolve);
      });
    }
    this.activeLocks.add(key);
    return true;
  }

  release(key: string) {
    this.activeLocks.delete(key);
    const list = this.waiters.get(key);
    if (list && list.length > 0) {
      const next = list.shift()!;
      if (list.length === 0) {
        this.waiters.delete(key);
      }
      next();
    }
  }
}

class LockManager {
  private redis: Redis | null = null;
  private isRedisConnected = false;
  private localLock = new LocalLock();

  constructor() {
    const host = process.env.REDIS_HOST;
    const port = Number(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD;

    if (host) {
      console.log(`[LockManager] Redis configuration found. Connecting to Redis at ${host}:${port}...`);
      this.redis = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        reconnectOnError: () => false,
      });

      this.redis.on("connect", () => {
        this.isRedisConnected = true;
        console.log("[LockManager] Redis distributed lock coordinator connected.");
      });

      this.redis.on("error", (err) => {
        this.isRedisConnected = false;
        console.warn("[LockManager] Redis lock connection error, falling back to local memory coordination:", err.message);
      });

      // Lazy connect in the background so we don't block server startup
      this.redis.connect().catch((err) => {
        console.warn("[LockManager] Redis initial connection failed, running in local fallback mode:", err.message);
      });
    } else {
      console.log("[LockManager] No Redis config found. Operating in local memory coordination mode.");
    }
  }

  /**
   * Acquires a distributed lock.
   * @param lockKey Unique key representing the lock
   * @param ttlMs Time-to-live for the lock in milliseconds
   * @param timeoutMs Maximum time to wait for acquiring the lock in milliseconds
   * @returns A random token string if successful, null if failed
   */
  async acquire(lockKey: string, ttlMs = 10000, timeoutMs = 5000): Promise<string | null> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const startTime = Date.now();

    if (this.redis && this.isRedisConnected) {
      while (Date.now() - startTime < timeoutMs) {
        try {
          // NX: set only if not exists, PX: expiry in milliseconds
          const result = await (this.redis as any).set(lockKey, token, "NX", "PX", ttlMs);
          if (result === "OK") {
            return token;
          }
        } catch (err: any) {
          console.warn("[LockManager] Redis lock acquire exception:", err.message);
          break; // Fallback to local lock if Redis fails during query
        }
        // Brief backoff before next attempt
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    // Fallback to in-instance local memory lock
    const localAcquired = await this.localLock.acquire(lockKey, timeoutMs);
    if (localAcquired) {
      return `local_${token}`;
    }

    return null;
  }

  /**
   * Releases a distributed lock.
   * @param lockKey Unique key representing the lock
   * @param token The token returned by the acquire method
   */
  async release(lockKey: string, token: string): Promise<boolean> {
    if (token.startsWith("local_")) {
      this.localLock.release(lockKey);
      return true;
    }

    if (this.redis && this.isRedisConnected) {
      // Lua script to release the lock atomically only if token matches
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      try {
        const result = await (this.redis as any).eval(script, 1, lockKey, token);
        return result === 1;
      } catch (err: any) {
        console.warn("[LockManager] Redis lock release failed:", err.message);
        return false;
      }
    }

    return false;
  }
}

export const lockManager = new LockManager();
