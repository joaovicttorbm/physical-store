import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {config} from 'dotenv';
import { CustomHttpExceptionFilter } from './common/exceptions/custom-http-exception.filter';
async function bootstrap() {
  config();  
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
