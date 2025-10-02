import { ElevatorDirection, ElevatorId } from './elevator.interface';

export const ElevatorEvent = {
  Motion: {
    Moving: 'elevator.motion.moving',
    Stopped: 'elevator.motion.stopped',
    Idle: 'elevator.motion.idle',
    FloorReached: 'elevator.motion.floor-reached',
  },
  Door: {
    Opening: 'elevator.door.opening',
    Opened: 'elevator.door.opened',
    Closing: 'elevator.door.closing',
    Closed: 'elevator.door.closed',
  },
  Destination: {
    Scheduled: 'elevator.destination.scheduled',
    Reached: 'elevator.destination.reached',
  },
  Status: {
    Active: 'elevator.status.active',
    Error: 'elevator.status.error',
    Maintenance: 'elevator.status.maintenance',
  },
} as const;

export class ElevatorDestinationScheduledEvent {
  constructor(
    public readonly elevatorId: ElevatorId,
    public readonly destination: number,
  ) {}
}

export class ElevatorFloorReachedEvent {
  constructor(
    public readonly elevatorId: ElevatorId,
    public readonly floor: number,
  ) {}
}

export class ElevatorDestinationReachedEvent {
  constructor(
    public readonly elevatorId: ElevatorId,
    public readonly destination: number,
  ) {}
}

export class ElevatorDoorOpeningEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}

export class ElevatorDoorOpenedEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}

export class ElevatorDoorClosingEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}

export class ElevatorDoorClosedEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}

export class ElevatorMotionMovingEvent {
  constructor(
    public readonly elevatorId: ElevatorId,
    public readonly direction: ElevatorDirection,
  ) {}
}

export class ElevatorMotionStoppedEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}

export class ElevatorMotionIdleEvent {
  constructor(public readonly elevatorId: ElevatorId) {}
}
