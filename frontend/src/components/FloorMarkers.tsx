import type { BuildingConfig } from '../types';
import { formatFloorLabel } from '../utils/floor-utils';

interface FloorMarkersProps {
  config: BuildingConfig;
}

export default function FloorMarkers({ config }: FloorMarkersProps) {
  const { minFloor, maxFloor } = config;
  
  const floors = Array.from(
    { length: maxFloor - minFloor + 1 },
    (_, i) => minFloor + i
  );

  return (
    <div className="floor-markers">
      {floors.map((floor) => (
        <div 
          key={floor} 
          className={`floor-marker ${floor === 0 ? 'ground-floor' : ''} ${floor < 0 ? 'basement' : ''}`}
          data-floor={floor}
        >
          {formatFloorLabel(floor)}
        </div>
      ))}
    </div>
  );
}

