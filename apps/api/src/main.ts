import { json, raw, urlencoded } from 'express';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const host = configService.get('API_HOST') || 'localhost';
  const port = configService.get('API_PORT') || 3333;
  const globalPrefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('IQB Studio Lite')
    .setDescription('The IQB Studio Lite API description and try-out')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', parameterLimit: 100000, extended: true }));
  app.use(raw({ limit: '50mb' }));
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();

  await app.listen(port, host);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
