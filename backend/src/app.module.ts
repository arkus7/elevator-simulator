import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@unifig/nest';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
