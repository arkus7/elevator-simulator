import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { ElevatorEvent } from '../elevator/elevator-event';
import type {
  ElevatorDestinationScheduledEvent,
  ElevatorFloorReachedEvent,
  ElevatorDestinationReachedEvent,
  ElevatorDoorOpeningEvent,
  ElevatorDoorOpenedEvent,
  ElevatorDoorClosingEvent,
  ElevatorDoorClosedEvent,
  ElevatorMotionMovingEvent,
  ElevatorMotionStoppedEvent,
  ElevatorMotionIdleEvent,
  ElevatorStatusActiveEvent,
  ElevatorStatusMaintenanceEvent,
  ElevatorStatusErrorEvent,
} from '../elevator/elevator-event';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/elevator-events',
})
export class ElevatorEventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ElevatorEventsGateway.name);

  public handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Motion

  @OnEvent(ElevatorEvent.Motion.Moving)
  public handleMotionMoving(event: ElevatorMotionMovingEvent): void {
    this.logger.debug(
      `Motion Moving: Elevator ${event.elevatorId} moving ${event.direction}`,
    );
    this.emitElevatorEvent(ElevatorEvent.Motion.Moving, {
      elevatorId: event.elevatorId,
      direction: event.direction,
    });
  }

  @OnEvent(ElevatorEvent.Motion.Stopped)
  public handleMotionStopped(event: ElevatorMotionStoppedEvent): void {
    this.logger.debug(`Motion Stopped: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Motion.Stopped, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Motion.Idle)
  public handleMotionIdle(event: ElevatorMotionIdleEvent): void {
    this.logger.debug(`Motion Idle: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Motion.Idle, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Motion.FloorReached)
  public handleFloorReached(event: ElevatorFloorReachedEvent): void {
    this.logger.debug(
      `Floor Reached: Elevator ${event.elevatorId} reached floor ${event.floor}`,
    );
    this.emitElevatorEvent(ElevatorEvent.Motion.FloorReached, {
      elevatorId: event.elevatorId,
      floor: event.floor,
    });
  }

  // Door

  @OnEvent(ElevatorEvent.Door.Opening)
  public handleDoorOpening(event: ElevatorDoorOpeningEvent): void {
    this.logger.debug(`Door Opening: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Door.Opening, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Door.Opened)
  public handleDoorOpened(event: ElevatorDoorOpenedEvent): void {
    this.logger.debug(`Door Opened: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Door.Opened, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Door.Closing)
  public handleDoorClosing(event: ElevatorDoorClosingEvent): void {
    this.logger.debug(`Door Closing: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Door.Closing, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Door.Closed)
  public handleDoorClosed(event: ElevatorDoorClosedEvent): void {
    this.logger.debug(`Door Closed: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Door.Closed, {
      elevatorId: event.elevatorId,
    });
  }

  // Destination

  @OnEvent(ElevatorEvent.Destination.Scheduled)
  public handleDestinationScheduled(
    event: ElevatorDestinationScheduledEvent,
  ): void {
    this.logger.debug(
      `Destination Scheduled: Elevator ${event.elevatorId} scheduled to floor ${event.destination}`,
    );
    this.emitElevatorEvent(ElevatorEvent.Destination.Scheduled, {
      elevatorId: event.elevatorId,
      destination: event.destination,
      destinationFloors: event.destinationFloors,
    });
  }

  @OnEvent(ElevatorEvent.Destination.Reached)
  public handleDestinationReached(
    event: ElevatorDestinationReachedEvent,
  ): void {
    this.logger.debug(
      `Destination Reached: Elevator ${event.elevatorId} reached destination floor ${event.destination}`,
    );
    this.emitElevatorEvent(ElevatorEvent.Destination.Reached, {
      elevatorId: event.elevatorId,
      destination: event.destination,
    });
  }

  // Status

  @OnEvent(ElevatorEvent.Status.Active)
  public handleStatusActive(event: ElevatorStatusActiveEvent): void {
    this.logger.debug(`Status Active: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Status.Active, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Status.Error)
  public handleStatusError(event: ElevatorStatusErrorEvent): void {
    this.logger.debug(`Status Error: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Status.Error, {
      elevatorId: event.elevatorId,
    });
  }

  @OnEvent(ElevatorEvent.Status.Maintenance)
  public handleStatusMaintenance(event: ElevatorStatusMaintenanceEvent): void {
    this.logger.debug(`Status Maintenance: Elevator ${event.elevatorId}`);
    this.emitElevatorEvent(ElevatorEvent.Status.Maintenance, {
      elevatorId: event.elevatorId,
    });
  }

  private emitElevatorEvent(
    eventName: string,
    eventData: Record<string, unknown>,
  ): void {
    this.server.emit(eventName, {
      ...eventData,
      type: eventName,
      timestamp: new Date().toISOString(),
    });
  }
}
