import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalConfigModule } from './shared/config.module';

@Module({
  imports: [GlobalConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
