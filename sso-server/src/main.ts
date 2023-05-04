import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = 8081;
  await app.listen(port, () => {
    console.log(`SSO-Server is running at port ${port}`);
  });
}

bootstrap();
