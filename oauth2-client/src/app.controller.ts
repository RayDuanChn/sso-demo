import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Render,
} from '@nestjs/common';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, tap } from 'rxjs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private httpService: HttpService,
  ) {}

  @Get()
  @Render('index')
  root() {
    return {
      state: 'x2x',
      redirect_uri: 'http://localhost:8001/auth/callback',
    };
  }

  @Get('/auth/callback')
  @Render('home') // 重定向到首页
  async callback(@Query() params) {
    // 获取服务器发放的code，并保存
    const { code, state } = params;

    if (state !== 'x2x')
      throw new HttpException('state 已被篡改', HttpStatus.BAD_REQUEST);

    // 通过 code 向服务器换取 access_token
    const response = await this.get_access_token(code);
    const { access_token, user_id } = response.data;

    // 通过 access_token 和 用户 id 获取 用户信息
    const user_info = await this.get_user_info({ access_token, user_id });

    return user_info.data;
  }

  async get_access_token(code): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post('http://localhost:3001/oauth2/access_token', {
          grant_type: 'authorization_code',
          code,
          client_id: 'xc0218ng923jf73',
          client_secret: 'xcs38nhg302kg9sdf2l8g',
          redirect_uri: 'http://localhost:8000/auth/callback',
        })
        .pipe(
          tap((response) => {
            console.log(JSON.stringify(response.data));
          }),
          map((response) => {
            return response.data;
          }),
          catchError((e) => {
            console.log(e.response.data);
            throw new HttpException(e.response, e.response.status);
          }),
        ),
    );
  }

  // 请求获取用户信息
  async get_user_info(data) {
    return await lastValueFrom(
      this.httpService
        .post('http://localhost:3001/user/user_info', {
          access_token: data.access_token,
          user_id: data.user_id,
        })
        .pipe(
          tap((response) => {
            console.log(JSON.stringify(response.data));
          }),
          map((response) => {
            return response.data;
          }),
          catchError((e) => {
            console.log(e.response.data);
            throw new HttpException(e.response, e.response.status);
          }),
        ),
    );
  }
}
