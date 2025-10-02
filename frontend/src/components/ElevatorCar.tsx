import type { BuildingConfig, ElevatorState } from '../types';

interface ElevatorCarProps {
  elevator: ElevatorState;
  config: BuildingConfig;
}

const DIRECTION_ICON = {
  up: '↑',
  down: '↓',
  idle: '●'
} as const;

const DOOR_ICON = {
  open: '[  ]',     
  opening: '[< >]',
  closed: '[||]',
  closing: '[> <]',
} as const;


export default function ElevatorCar({ elevator, config }: ElevatorCarProps) {
  const { minFloor, maxFloor } = config;
  const totalFloors = maxFloor - minFloor + 1;
  
  const floorIndex = elevator.currentFloor - minFloor;
  
  const bottomPosition = (floorIndex / totalFloors) * 100;
  
  const directionIcon = DIRECTION_ICON[elevator.direction];
  
  const doorIcon = DOOR_ICON[elevator.doorState];
  
  // CSS classes based on state
  const stateClasses = [
    'elevator-car',
    elevator.motionState === 'moving' ? 'moving' : '',
    elevator.motionState === 'idle' ? 'idle' : '',
    `doors-${elevator.doorState}`,
    `status-${elevator.status}`,
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={stateClasses}
      style={{ bottom: `${bottomPosition}%` }}
    >
      <div className="car-id">{elevator.id}</div>
      <div className="direction-indicator" title={`Direction: ${elevator.direction}`}>
        {directionIcon}
      </div>
      <div className="door-indicator" title={`Doors: ${elevator.doorState}`}>
        {doorIcon}
      </div>
      <div className="current-floor">
        Floor {elevator.currentFloor}
      </div>
      {elevator.destinationFloors.length > 0 && (
        <div className="destinations" title="Destination floors">
             {`-> ${elevator.destinationFloors.join(', ')}`}
        </div>
      )}
    </div>
  );
}

