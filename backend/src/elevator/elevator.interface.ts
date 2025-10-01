/**
 * Unique identifier for the elevator
 */
export type ElevatorId = string & { __brand: 'ElevatorId' };

export enum ElevatorDirection {
  Up = 'up',
  Down = 'down',
  Idle = 'idle',
}

/**
 * Represents the state of the elevator doors, following the state machine:
 *
 * {@link ElevatorDoorState.Closed} → {@link ElevatorDoorState.Opening} → {@link ElevatorDoorState.Open} → {@link ElevatorDoorState.Closing} → {@link ElevatorDoorState.Closed}
 */
export enum ElevatorDoorState {
  Open = 'open',
  Opening = 'opening',
  Closed = 'closed',
  Closing = 'closing',
}

/**
 * Represents the motion state of the elevator, following the state machine:
 *
 * - {@link ElevatorMotionState.Idle} → {@link ElevatorMotionState.Moving}
 * - {@link ElevatorMotionState.Moving} → {@link ElevatorMotionState.Stopped}
 * - {@link ElevatorMotionState.Stopped} → {@link ElevatorMotionState.Moving} (if more requests remain)
 * - {@link ElevatorMotionState.Stopped} → {@link ElevatorMotionState.Idle} (if no more requests)
 *
 * In other words, the elevator alternates between {@link ElevatorMotionState.Moving}
 * and {@link ElevatorMotionState.Stopped} for each request, and finally returns
 * to {@link ElevatorMotionState.Idle} when all requests have been served.
 */
export enum ElevatorMotionState {
  /**
   * The elevator is moving between floors
   */
  Moving = 'moving',
  /**
   * The elevator is stopped at a floor, waiting for the doors to open
   */
  Stopped = 'stopped',
  /**
   * The elevator is idle, no requests left
   */
  Idle = 'idle',
}

export enum ElevatorStatus {
  Active = 'active',
  Error = 'error',
  Maintenance = 'maintenance',
}

export interface Elevator {
  /**
   * Unique identifier for the elevator
   */
  id: ElevatorId;

  /**
   * Current floor of the elevator
   */
  currentFloor: number;

  /**
   * Current direction of the elevator
   *
   * - {@link ElevatorDirection.Up}: The elevator is moving up
   * - {@link ElevatorDirection.Down}: The elevator is moving down
   * - {@link ElevatorDirection.Idle}: The elevator is not moving (no destinations in queue)
   */
  direction: ElevatorDirection;

  /**
   * Current state of the elevator doors
   *
   * The door state must follow the state machine:
   * {@link ElevatorDoorState.Closed} → {@link ElevatorDoorState.Opening} → {@link ElevatorDoorState.Open} → {@link ElevatorDoorState.Closing} → {@link ElevatorDoorState.Closed}
   */
  doorState: ElevatorDoorState;

  /**
   * Current motion state of the elevator
   *
   * The motion state must follow the state machine:
   * {@link ElevatorMotionState.Idle} → ({@link ElevatorMotionState.Moving} → {@link ElevatorMotionState.Stopped}, repeated for each request) → {@link ElevatorMotionState.Idle}
   */
  motionState: ElevatorMotionState;

  /**
   * Array of unique floor numbers, sorted by direction
   *
   * If the elevator is idle, the destinationFloors array should be empty
   *
   * Example:
   * - [1, 3, 5] for up direction
   * - [5, 3, 1] for down direction
   * - [] for idle direction
   */
  destinationFloors: number[];

  /**
   * Operational status of the elevator.
   *
   * If the elevator status is {@link ElevatorStatus.Error} or {@link ElevatorStatus.Maintenance}, the elevator should not be used.
   */
  status: ElevatorStatus;
}
