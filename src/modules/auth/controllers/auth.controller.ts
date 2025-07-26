import { Controller, Post, Body, UseGuards, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { 
  LoginDto, 
  RegisterDto, 
  RefreshTokenDto, 
  ChangePasswordDto, 
  LoginResponseDto,
  UserProfileDto 
} from '../dto/auth.dto';
import { 
  CurrentUser, 
  CurrentUserId, 
  Auth, 
  Public 
} from '../decorators/auth.decorators';
import { ResponseDto } from '../../../common/dto/response.dto';
import { ApiDocumentation } from '../../../common/decorators/api-response.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiDocumentation('用户登录', '认证', LoginResponseDto, '登录成功')
  async login(@Body() loginDto: LoginDto): Promise<ResponseDto<LoginResponseDto>> {
    const result = await this.authService.login(loginDto);
    return ResponseDto.success(result, '登录成功');
  }

  @Public()
  @Post('register')
  @ApiDocumentation('用户注册', '认证', LoginResponseDto, '注册成功')
  async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<LoginResponseDto>> {
    const result = await this.authService.register(registerDto);
    return ResponseDto.success(result, '注册成功');
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<ResponseDto<Omit<LoginResponseDto, 'user'>>> {
    const result = await this.authService.refreshTokens(refreshTokenDto.refreshToken);
    return ResponseDto.success(result, '令牌刷新成功');
  }

  @Auth()
  @Get('profile')
  @ApiDocumentation('获取用户资料', '认证', UserProfileDto, '获取成功')
  async getProfile(@CurrentUserId() userId: string): Promise<ResponseDto<UserProfileDto>> {
    const result = await this.authService.getProfile(userId);
    return ResponseDto.success(result, '获取用户资料成功');
  }

  @Auth()
  @Patch('change-password')
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseDto<null>> {
    await this.authService.changePassword(userId, changePasswordDto);
    return ResponseDto.success(null, '密码修改成功');
  }

  @Auth()
  @Post('logout')
  @ApiOperation({ summary: '用户登出' })
  async logout(@CurrentUser() user: any): Promise<ResponseDto<null>> {
    // TODO: 实现令牌黑名单功能
    // await this.authService.logout(user.userId);
    return ResponseDto.success(null, '登出成功');
  }

  @Auth()
  @Get('me')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getCurrentUser(@CurrentUser() user: any): Promise<ResponseDto<any>> {
    return ResponseDto.success(user, '获取用户信息成功');
  }
} 