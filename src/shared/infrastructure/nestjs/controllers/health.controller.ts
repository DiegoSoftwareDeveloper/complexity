import { Controller, Get } from '@nestjs/common'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('health-check')
@Controller('health-check')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
  ) {}

  // https://wanago.io/2021/10/11/api-nestjs-health-checks-terminus-datadog/
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mongoose.pingCheck('mongoose'),
      () => this.memory.checkHeap('memoryHeap', 300 * 1024 * 1024), // The process should not use more than 300MB memory
      () => this.memory.checkRSS('memoryRSS', 500 * 1024 * 1024), // The process should not have more than 500MB RSS memory allocated
      () =>
        this.diskHealthIndicator.checkStorage('diskHealth', {
          thresholdPercent: 0.5,
          path: '/',
        }), // The used disk storage should not exceed the 50% of the available space
    ])
  }
}
