import { Injectable } from '@nestjs/common';
import { OAuth2Server } from 'oauth2-server';

@Injectable()
export class AppService {
  getHello(): string {
    const oauth = new OAuth2Server({
      model: require('./model'),
    });
    return 'Hello World!';
  }
}
