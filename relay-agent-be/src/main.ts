import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import setupSwagger from './setup-swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './shared/filters/httpexception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(
    session({
      secret: 'relay-agent-secret-key',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.enableVersioning({ type: VersioningType.URI });
  app.use(helmet());

  // Increase payload size limit to 100MB
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  // Swagger
  setupSwagger(app);
  var server = await app.listen(process.env.PORT);
  server.keepAliveTimeout = 85000;
  console.log(`http://localhost:${process.env.PORT}/relaydocs`);
}

bootstrap();
