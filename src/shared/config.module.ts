import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations, validationSchema } from '../config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configurations,
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      expandVariables: true,
      cache: true,
    }),
  ],
  exports: [ConfigModule],
})
export class GlobalConfigModule {}
