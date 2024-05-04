import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');

  const config = new DocumentBuilder()
    .setTitle('English Education Platform API')
    .setDescription('The English Education Platform API description')
    .setVersion('1.0')
    .addServer('http://localhost:3003/', 'Local environment')
    .addTag('engedu-platform')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);

  const corsOrigin =
    configService.get<string>('LOCAL_MODE') === 'true'
      ? '*'
      : configService.get<string>('CLIENT_URL');

  app.enableCors({
    origin: corsOrigin,
  });

  const port = configService.get<number>('PORT') || 3003;

  await app.listen(port, '0.0.0.0', () => {
    console.log(`App is running on port ${port}...`);
  });
}
bootstrap();
