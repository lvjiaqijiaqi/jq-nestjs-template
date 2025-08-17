import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-wechat';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class WeChatStrategy extends PassportStrategy(Strategy, 'wechat') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super(
      {
        appID: configService.get<string>('wechat.appId')!,
        appSecret: configService.get<string>('wechat.secret')!,
        callbackURL: configService.get<string>('wechat.callbackURL')!,
        scope: configService.get<string>('wechat.scope', 'snsapi_login'),
        state: true,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user?: any) => void,
      ) => {
        try {
          const { openid, unionid, nickname, headimgurl } = profile || {};
          const pid = unionid || openid;
          if (!pid) return done(new Error('Invalid WeChat profile'), false);

          let user = await this.userRepository.findByWeChat(pid);
          if (!user) {
            user = await this.userRepository.createFromWeChat({
              unionid,
              openid,
              nickname,
              avatar: headimgurl,
            });
          }
          done(null, user);
        } catch (e) {
          done(e, false);
        }
      },
    );
  }
}
