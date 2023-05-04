import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 8083;
  await app.listen(port, () => {
    console.log(`sso client B is running at port ${port}`);
  });
}
bootstrap();
