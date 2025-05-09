import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'

import { HealthController } from './infrastructure/nestjs/controllers/health.controller'
import { UtilsSharedService } from './application/services/utils-shared.service'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [UtilsSharedService],
  exports: [UtilsSharedService],
})
export class SharedModule {}
