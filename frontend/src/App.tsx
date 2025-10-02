import { useState } from 'react'
import './App.css'
import ElevatorShaft from './ElevatorShaft'
import CallButtons from './components/CallButtons'
import type { BuildingState } from './types'

function App() {
  const [buildingState] = useState<BuildingState>({
    config: {
      minFloor: -2,
      maxFloor: 5,
    },
    elevators: {
      'elevator-1': {
        id: 'Elevator 1',
        currentFloor: 2,
        direction: 'up',
        doorState: 'opening',
        motionState: 'idle',
        destinationFloors: [],
      },
      'elevator-2': {
        id: 'Elevator 2',
        currentFloor: -1,
        direction: 'up',
        doorState: 'closing',
        motionState: 'idle',
        destinationFloors: [0, 3],
      },
      'elevator-3': {
        id: 'Elevator 3',
        currentFloor: -1,
        direction: 'up',
        doorState: 'open',
        motionState: 'stopped',
        destinationFloors: [0, 3],
      },
      'elevator-4': {
        id: 'Elevator 4',
        currentFloor: -1,
        direction: 'up',
        doorState: 'closed',
        motionState: 'moving',
        destinationFloors: [0, 3],
      },
    },
  });

  const handleCallElevator = (floor: number, direction: 'up' | 'down') => {
    console.log(`Calling elevator to floor ${floor}, direction: ${direction}`);
    // TODO: Make API call to backend
    // POST /hall/call with { floor, direction }
  };

  const handleOpenDoor = (elevatorId: string) => {
    console.log(`Opening door for ${elevatorId}`);
    // TODO: Make API call to backend
    // POST /elevators/{elevatorId}/open-door
  };

  const handleCloseDoor = (elevatorId: string) => {
    console.log(`Closing door for ${elevatorId}`);
    // TODO: Make API call to backend
    // POST /elevators/{elevatorId}/close-door
  };

  const handleSelectFloor = (elevatorId: string, floor: number) => {
    console.log(`${elevatorId} selecting floor ${floor}`);
    // TODO: Make API call to backend
    // POST /elevators/{elevatorId}/schedule with { floor }

    
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏢 Elevator Simulator</h1>
        <p className="subtitle">Real-time Building Visualization</p>
      </header>

      <main className="building-container">
        <div className="building">
          {Object.values(buildingState.elevators).map((elevator) => (
            <ElevatorShaft
              key={elevator.id}
              elevator={elevator}
              config={buildingState.config}
              onOpenDoor={handleOpenDoor}
              onCloseDoor={handleCloseDoor}
              onSelectFloor={handleSelectFloor}
            />
          ))}
          <CallButtons
            config={buildingState.config}
            onCallElevator={handleCallElevator}
          />
        </div>
      </main>

      <footer className="app-footer">
        <div className="status-bar">
          <span className="status-item">
            🔴 Disconnected
          </span>
          <span className="status-item">
            Floors: {buildingState.config.minFloor} to {buildingState.config.maxFloor}
          </span>
          <span className="status-item">
            Elevators: {Object.keys(buildingState.elevators).length}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
