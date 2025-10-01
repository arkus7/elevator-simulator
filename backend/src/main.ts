import { NestFactory } from '@nestjs/core';
import { Config } from '@unifig/core';
import { BuildingConfig } from './config/building.config';
import { EnvConfigAdapter } from '@unifig/adapter-env';
import { toTable } from '@unifig/validation-presenter-table';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const configValidationError = await Config.register({
    templates: [BuildingConfig],
    adapter: new EnvConfigAdapter(),
  });

  if (configValidationError) {
    console.error(toTable(configValidationError));
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
