import type { BuildingConfig } from '../types';
import { formatFloorLabel } from '../utils/floor-utils';
import './ElevatorControls.css';

interface ElevatorControlsProps {
  elevatorId: string;
  config: BuildingConfig;
  onOpenDoor: (elevatorId: string) => void;
  onCloseDoor: (elevatorId: string) => void;
  onSelectFloor: (elevatorId: string, floor: number) => void;
}

export default function ElevatorControls({
  elevatorId,
  config,
  onOpenDoor,
  onCloseDoor,
  onSelectFloor,
}: ElevatorControlsProps) {
  const { minFloor, maxFloor } = config;
  
  // Generate array of floor numbers from max to min (top to bottom)
  const floors = Array.from(
    { length: maxFloor - minFloor + 1 },
    (_, i) => maxFloor - i
  );

  return (
    <div className="elevator-controls">
      {/* Door Controls */}
      <div className="door-controls">
        <div className="controls-section-title">Doors</div>
        <div className="door-buttons">
          <button
            className="control-button door-open"
            onClick={() => onOpenDoor(elevatorId)}
            title="Open doors"
          >
            <span className="button-icon">⟨⟩</span>
            <span className="button-label">Open</span>
          </button>
          <button
            className="control-button door-close"
            onClick={() => onCloseDoor(elevatorId)}
            title="Close doors"
          >
            <span className="button-icon">||</span>
            <span className="button-label">Close</span>
          </button>
        </div>
      </div>

      {/* Floor Selection */}
      <div className="floor-selection">
        <div className="controls-section-title">Select Floor</div>
        <div className="floor-buttons-grid">
          {floors.map((floor) => (
            <button
              key={floor}
              className="control-button floor-button"
              onClick={() => onSelectFloor(elevatorId, floor)}
              title={`Go to floor ${floor}`}
            >
              {formatFloorLabel(floor)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

