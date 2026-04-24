import { Module } from '@nestjs/common';
import { BfhlModule } from './bfhl/bfhl.module';

@Module({
  imports: [BfhlModule],
})
export class AppModule {}
