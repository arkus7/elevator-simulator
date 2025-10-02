export interface BuildingConfig {
  minFloor: number;
  maxFloor: number;
}

export interface ElevatorState {
  id: string;
  currentFloor: number;
  direction: 'up' | 'down' | 'idle';
  doorState: 'open' | 'opening' | 'closed' | 'closing';
  motionState: 'moving' | 'stopped' | 'idle';
  destinationFloors: number[];
}

export interface BuildingState {
  config: BuildingConfig;
  elevators: Record<string, ElevatorState>;
}

// WebSocket Event Types
export interface BaseElevatorEvent {
  elevatorId: string;
  timestamp: string;
}

export interface MotionMovingEvent extends BaseElevatorEvent {
  direction: 'up' | 'down' | 'idle';
}

export interface FloorReachedEvent extends BaseElevatorEvent {
  floor: number;
}

export interface DestinationEvent extends BaseElevatorEvent {
  destination: number;
}

