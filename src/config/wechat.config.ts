import { registerAs } from '@nestjs/config';

export default registerAs('wechat', () => ({
  // Web/Official Account OAuth
  appId: process.env.WECHAT_APP_ID || '',
  secret: process.env.WECHAT_APP_SECRET || '',
  callbackURL:
    process.env.WECHAT_CALLBACK_URL ||
    'http://localhost:3000/api/auth/wechat/callback',
  scope: process.env.WECHAT_SCOPE || 'snsapi_login', // or snsapi_userinfo for OA

  // Frontend redirect after successful OAuth
  webRedirect:
    process.env.OAUTH_WEB_REDIRECT_URL ||
    process.env.WEB_REDIRECT_URL ||
    'http://localhost:3000/oauth/callback',

  // Mini program
  mini: {
    appId: process.env.WECHAT_MINI_APP_ID || '',
    secret: process.env.WECHAT_MINI_APP_SECRET || '',
  },
}));
