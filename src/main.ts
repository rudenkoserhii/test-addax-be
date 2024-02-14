/* eslint-disable typesafe/promise-catch */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from 'src/app.module';

async function bootstrap(): Promise<void> {
  try {
    const app = await NestFactory.create(AppModule);

    const pipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    });

    const config = new DocumentBuilder()
      .setTitle('Test Addax BE')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    document.servers = [{ url: '/api/v1' }];
    SwaggerModule.setup('api', app, document);

    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(pipe);
    app.enableCors();

    await app.listen(process.env.APP_PORT);
  } catch (error) {
    throw error;
  }
}

bootstrap();
