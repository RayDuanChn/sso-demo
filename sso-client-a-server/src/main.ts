import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 8082;
  await app.listen(port, () => {
    console.log(`sso client A is running at port ${port}`);
  });
}
bootstrap();
