import FloorMarkers from './components/FloorMarkers';
import ElevatorCar from './components/ElevatorCar';
import ElevatorControls from './components/ElevatorControls';
import type { BuildingConfig, ElevatorState } from './types';
import './components/ElevatorShaft.css';

interface ElevatorShaftProps {
  elevator: ElevatorState;
  config: BuildingConfig;
  onOpenDoor: (elevatorId: string) => void;
  onCloseDoor: (elevatorId: string) => void;
  onSelectFloor: (elevatorId: string, floor: number) => void;
  onRequestMaintenance: (elevatorId: string) => void;
}

export default function ElevatorShaft({ 
  elevator, 
  config, 
  onOpenDoor, 
  onCloseDoor, 
  onSelectFloor,
  onRequestMaintenance,
}: ElevatorShaftProps) {
  const totalFloors = config.maxFloor - config.minFloor + 1;
  
  return (
    <div className="elevator-shaft">
      <div className="shaft-header">{elevator.id}</div>
      <div 
        className="shaft-container"
        style={{
          // Set CSS variable for floor count (used in background gradient)
          ['--total-floors' as string]: totalFloors,
        }}
      >
        <FloorMarkers config={config} />
        <ElevatorCar elevator={elevator} config={config} />
      </div>
      <ElevatorControls
        elevatorId={elevator.id}
        config={config}
        onOpenDoor={onOpenDoor}
        onCloseDoor={onCloseDoor}
        onSelectFloor={onSelectFloor}
        onRequestMaintenance={onRequestMaintenance}
      />
    </div>
  );
}