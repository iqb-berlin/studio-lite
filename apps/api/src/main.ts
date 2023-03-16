import { json } from 'express';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('./packages', { prefix: '/api/packages' });
  const configService = app.get(ConfigService);
  const host = configService.get('API_HOST') || 'localhost';
  const port = 3333;
  const globalPrefix = 'api';
  const config = new DocumentBuilder()
    .setTitle('IQB Studio Lite')
    .setDescription('The IQB Studio Lite API description and try-out')
    .setVersion(app.get('APP_VERSION'))
    .addBearerAuth()
    .build();
  app.setGlobalPrefix(globalPrefix);
  app.use(json({ limit: '50mb' }));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, host);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
