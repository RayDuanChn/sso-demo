import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  Render,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AppService } from './app.service';
import * as moment from 'moment';

@Controller()
export class AppController {
  private ACCESS_TOKENS = {};

  constructor(private readonly appService: AppService) {}
  private CODES = {};

  // 用户信息
  private user_info = [
    {
      id: 1,
      username: 'Inossem',
      avatar: 'https://inossem.ca/index.html',
    },
  ];

  // 应用 id 和 密钥
  private app_info = {
    AppName: '第三方APP',
    AppId: 'xc0218ng923jf73',
    AppSecret: 'xcs38nhg302kg9sdf2l8g',
  };

  @Get('/oauth2/authorize')
  @Render('auth')
  authorize() {
    return { AppName: this.app_info.AppName };
  }

  @Get('/oauth2/authorize_code')
  @Redirect()
  authorize_code(@Query() params) {
    // 参数校验
    const { client_id, response_type, redirect_uri, scope, state } = params;

    if (!response_type || !client_id || !redirect_uri || !scope || !state) {
      throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
    }

    // 生成授权码
    const code = uuidv4();

    // 保存 clientId 对应的 code 等信息
    this.CODES[client_id] = {
      code, // code
      gen_time: moment(), // 发放时间,
      scope,
    };
    // 重定向回调地址，传递授权码
    return {
      url: `${redirect_uri}?state=${state}&code=${code}`,
    };
  }

  @Post('/oauth2/access_token')
  access_token(@Body() params) {
    // 当前时间
    const curr_time = moment();
    // 获取请求参数
    const { grant_type, code, client_id, client_secret } = params;

    // 参数校验
    if (!grant_type || !code || !client_id || !client_secret) {
      return (params.body = { err_code: 10000, msg: '参数缺失' });
    }

    if (grant_type !== 'authorization_code') {
      return (params.body = { err_code: 10006, msg: '请求授权类型不对' });
    }

    //验证code
    if (this.CODES[client_id].code !== code) {
      return (params.body = { err_code: 10012, msg: 'code不正确' });
    }

    if (curr_time.diff(this.CODES[client_id].gen_time, 'seconds') > 3600) {
      return (params.body = { err_code: 10016, msg: 'code失效' });
    }

    if (
      client_id === this.app_info.AppId &&
      client_secret !== this.app_info.AppSecret
    ) {
      return (params.body = { err_code: 10010, msg: '应用appSecret不正确' });
    }

    // 发放token
    const access_token = uuidv4(),
      refresh_token = uuidv4();

    // 缓存 token , 记录此 token 对应的一些数据，方便后面使用
    this.ACCESS_TOKENS[access_token] = {
      client_id,
      refresh_token,
      gen_time: curr_time,
      scope: this.CODES[client_id].scope,
    };

    // 发送 token
    return {
      err_code: 0,
      data: {
        access_token,
        refresh_token,
        token_type: 'authorize',
        expires_in: 3600,
        user_id: 1,
        scope: this.CODES[client_id].scope,
      },
    };
  }

  @Post('/user/user_info')
  get_user_info(@Body() params) {
    const curr_time = moment();
    // 获取用户id
    const { access_token, user_id } = params;

    // 参数校验
    if (!access_token || !user_id) {
      return { err_code: 10000, msg: '参数缺失' };
    }

    // 令牌校验
    if (curr_time.diff(this.ACCESS_TOKENS[access_token].gen_time, 'seconds') > 3600) {
      return { err_code: 12000, msg: '令牌失效' };
    }

    // 返回用户信息
    return {
      err_code: 0,
      data: this.user_info.find((u) => u.id === user_id),
    };
  }
}
