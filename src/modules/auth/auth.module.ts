import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 实体
import { User } from '../user/entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

// Repository
import { UserRepository } from '../user/repositories/user.repository';

// 服务
import { AuthService } from './services/auth.service';
import { AuthSeederService } from './services/seeder.service';

// 策略
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// 守卫
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

// 控制器
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [
    // Passport 配置
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT 配置
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
          issuer: configService.get<string>('jwt.options.issuer'),
          audience: configService.get<string>('jwt.options.audience'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // TypeORM 实体
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  
  controllers: [AuthController],
  
  providers: [
    // 服务
    AuthService,
    AuthSeederService,
    
    // Repository
    UserRepository,
    
    // 策略
    JwtStrategy,
    LocalStrategy,
    
    // 守卫
    JwtAuthGuard,
    LocalAuthGuard,
    PermissionsGuard,
  ],
  
  exports: [
    AuthService,
    JwtAuthGuard,
    LocalAuthGuard,
    PermissionsGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {} 