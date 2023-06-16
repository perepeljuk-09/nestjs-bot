import { Module } from "@nestjs/common";
import { PremiumQueueService } from "./premiumQueue.service";

@Module({
  providers: [PremiumQueueService],
  exports: [PremiumQueueService],
})
export class PremiumQueueModule {}
