import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;
let connecting = false;

function getRedisConfigFromEnv() {
  const url = process.env.REDIS_URL;
  if (url) {
    return { url } as any;
  }

  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined;
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;

  if (!host || !port) return null;

  return {
    socket: { host, port },
    username: username || undefined,
    password: password || undefined,
  } as any;
}

export async function getRedis(): Promise<RedisClientType | null> {
  if (client) return client;
  if (connecting) {
    // wait a bit and return client when available
    await new Promise((r) => setTimeout(r, 100));
    return client;
  }

  const config = getRedisConfigFromEnv();
  if (!config) return null;

  try {
    connecting = true;
    client = createClient(config);
    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();
    console.log('🔌 Connected to Redis');
    return client;
  } catch (e) {
    console.error('Failed to connect to Redis:', e);
    client = null;
    return null;
  } finally {
    connecting = false;
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  const redis = await getRedis();
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch (e) {
    console.error('Redis GET error:', e);
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;
  try {
    await redis.set(key, value, { EX: ttlSeconds });
    return true;
  } catch (e) {
    console.error('Redis SET error:', e);
    return false;
  }
}

// Lightweight search query tracking helpers
// - Stores a capped recent list (LPUSH/LTRIM)
// - Increments a sorted set for popularity (ZINCRBY)
export async function recordSearchQuery(query: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) return;
  try {
    const now = Date.now();
    const item = JSON.stringify({
      id: `recent_${now}_${Math.random().toString(36).slice(2)}`,
      query,
      timestamp: now,
    });
    // Keep last 200 recent entries
    await redis.lPush('recent_searches', item);
    await redis.lTrim('recent_searches', 0, 199);

    // Increment popularity score
    await (redis as any).zIncrBy('popular_searches', 1, query);
  } catch (e) {
    console.error('Redis recordSearchQuery error:', e);
  }
}

export async function getRecentSearchesRedis(limit: number = 10): Promise<{ id: string; query: string }[]> {
  const redis = await getRedis();
  if (!redis) return [];
  try {
    const items = await redis.lRange('recent_searches', 0, Math.max(0, limit - 1));
    const parsed = items
      .map((s) => {
        try {
          return JSON.parse(s) as { id: string; query: string; timestamp: number };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as { id: string; query: string; timestamp: number }[];

    // De-duplicate by query, keep order
    const seen = new Set<string>();
    const out: { id: string; query: string }[] = [];
    for (const it of parsed) {
      if (seen.has(it.query)) continue;
      seen.add(it.query);
      out.push({ id: it.id, query: it.query });
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.error('Redis getRecentSearches error:', e);
    return [];
  }
}

export async function getPopularSearchesRedis(limit: number = 10): Promise<{ id: string; query: string }[]> {
  const redis = await getRedis();
  if (!redis) return [];
  try {
    // node-redis v4: use zRange with REV option
    const members: string[] = await (redis as any).zRange('popular_searches', 0, Math.max(0, limit - 1), { REV: true });
    return members.map((m: string, i: number) => ({ id: `pop_${i}_${m.slice(0, 20)}`, query: m }));
  } catch (e) {
    console.error('Redis getPopularSearches error:', e);
    return [];
  }
}
