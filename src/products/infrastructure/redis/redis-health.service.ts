// src/infrastructure/redis/redis-health.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Redis } from 'ioredis';

interface SlowLogEntry {
  id: number;
  duration: number;
  command: string[];
  timestamp: number;
}

@Injectable()
export class RedisHealthService extends HealthIndicator {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const ping = await this.redis.ping();
      const [stats, memory, clients] = await Promise.all([
        this.redis.info('stats') as Promise<string>,
        this.redis.info('memory') as Promise<string>,
        this.redis.client('LIST') as Promise<string> // Añade tipo explícito
      ]);
      
      const isHealthy = ping === 'PONG';
      return this.getStatus(key, isHealthy, {
        ops_per_sec: this.parseInfoValue(stats, 'total_commands_processed'),
        used_memory: this.parseInfoValue(memory, 'used_memory'),
        connected_clients: this.parseClientCount(clients),
        evicted_keys: this.parseInfoValue(stats, 'evicted_keys'),
        keyspace_hits: this.parseInfoValue(stats, 'keyspace_hits')
      });
    } catch (error) {
      throw new HealthCheckError('Redis check failed', error);
    }
  }

  async getDetailedMetrics() {
    try {
      const [info, slowlog, config] = await Promise.all([
        this.redis.info() as Promise<string>,
        this.redis.slowlog('GET', 5) as Promise<SlowLogEntry[]>,
        this.redis.config('GET', '*') as Promise<[string, string][]>
      ]);
      
      return {
        status: 'healthy' as const,
        metrics: {
          memory: this.parseMemoryInfo(info),
          persistence: this.parsePersistenceInfo(info),
          stats: this.parseStatsInfo(info),
          slow_queries: slowlog.map(entry => ({
            duration: entry.duration,
            command: entry.command.join(' '), // Ahora command es string[]
            timestamp: new Date(entry.timestamp * 1000)
          })),
          config: this.parseConfig(config)
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        error: error.message
      };
    }
  }

  private parseConfig(config: [string, string][]) {
    const result: Record<string, string> = {};
    config.forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }

  private parseInfoValue(infoString: string, key: string): number {
    const match = infoString.match(new RegExp(`${key}:([\\d.]+)`));
    return match ? parseInt(match[1], 10) : 0;
  }

  private parseClientCount(clientsInfo: string): number {
    return (clientsInfo.match(/id=/g) || []).length;
  }

  private parseMemoryInfo(info: string) {
    return {
      used_memory: this.parseInfoValue(info, 'used_memory'),
      used_memory_human: this.parseInfoValue(info, 'used_memory_human'),
      mem_fragmentation_ratio: this.parseInfoValue(info, 'mem_fragmentation_ratio')
    };
  }

  private parsePersistenceInfo(info: string) {
    return {
      rdb_last_save_time: this.parseInfoValue(info, 'rdb_last_save_time'),
      aof_enabled: this.parseInfoValue(info, 'aof_enabled') === 1
    };
  }

  private parseStatsInfo(info: string) {
    return {
      total_connections_received: this.parseInfoValue(info, 'total_connections_received'),
      total_commands_processed: this.parseInfoValue(info, 'total_commands_processed'),
      instantaneous_ops_per_sec: this.parseInfoValue(info, 'instantaneous_ops_per_sec')
    };
  }
}