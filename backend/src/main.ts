import { NestFactory } from '@nestjs/core';
import { Config } from '@unifig/core';
import { AppConfig } from './config/app.config';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { toTable } from '@unifig/validation-presenter-table';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const configValidationError = await Config.register({
    templates: [AppConfig],
    adapter: new EnvConfigAdapter(),
  });

  if (configValidationError) {
    console.error(toTable(configValidationError));
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Elevator Simulator')
    .setDescription('The elevator simulator API')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
