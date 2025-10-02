import type { BuildingConfig } from '../types';
import { formatFloorLabel } from '../utils/floor-utils';
import './CallButtons.css';

interface CallButtonsProps {
  config: BuildingConfig;
  onCallElevator: (floor: number, direction: 'up' | 'down') => void;
}

export default function CallButtons({ config, onCallElevator }: CallButtonsProps) {
  const { minFloor, maxFloor } = config;
  
  // Generate array of floor numbers from min to max
  const floors = Array.from(
    { length: maxFloor - minFloor + 1 },
    (_, i) => minFloor + i
  );

  return (
    <div className="call-buttons-column">
      <div className="call-buttons-header">Call Elevator</div>
      <div className="call-buttons-container">
        <div className="call-buttons-floors">
          {floors.map((floor) => {
            const isTopFloor = floor === maxFloor;
            const isBottomFloor = floor === minFloor;
            
            return (
              <div key={floor} className="call-buttons-floor">
                <span className="floor-label-small">{formatFloorLabel(floor)}</span>
                <div className="buttons-group">
                  {!isTopFloor && (
                    <button
                      className="call-button up"
                      onClick={() => onCallElevator(floor, 'up')}
                      title={`Call elevator going up from floor ${floor}`}
                    >
                      ↑
                    </button>
                  )}
                  {!isBottomFloor && (
                    <button
                      className="call-button down"
                      onClick={() => onCallElevator(floor, 'down')}
                      title={`Call elevator going down from floor ${floor}`}
                    >
                      ↓
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

