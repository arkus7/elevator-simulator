import { Module } from '@nestjs/common';
import { ElevatorEventsGateway } from './elevator-events.gateway';

@Module({
  providers: [ElevatorEventsGateway],
  exports: [ElevatorEventsGateway],
})
export class WebsocketModule {}
