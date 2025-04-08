import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {config} from 'dotenv';
import { CustomHttpExceptionFilter } from './common/exceptions/custom-http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  config();  
  const app = await NestFactory.create(AppModule);

   
  const swaggerConfig = new DocumentBuilder()
   .setTitle('Physical Store API')
   .setDescription('API documentation for the Physical Store project')
   .setVersion('1.0')
   .addTag('stores')
   .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
 SwaggerModule.setup('api-docs', app, document);


  app.useGlobalFilters(new CustomHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
