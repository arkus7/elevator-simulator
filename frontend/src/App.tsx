import './App.css'
import ElevatorShaft from './ElevatorShaft'
import CallButtons from './components/CallButtons'
import { useElevatorEvents } from './hooks/useElevatorEvents'

function App() {
  const { connected, buildingState, error, loading } = useElevatorEvents();

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
        {loading || !buildingState ? (
          <div className="loading-state">
            {error ? (
              <>
                <div className="error-icon">⚠️</div>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <p className="hint">Make sure the backend server is running on port 3000</p>
              </>
            ) : (
              <>
                <div className="loading-spinner">🔄</div>
                <h2>Loading Elevator System...</h2>
                <p>Fetching building state...</p>
              </>
            )}
          </div>
        ) : (
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
        )}
      </main>

      {buildingState && (
        <footer className="app-footer">
          <div className="status-bar">
            <span className="status-item">
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="status-item">
              Floors: {buildingState.config.minFloor} to {buildingState.config.maxFloor}
            </span>
            <span className="status-item">
              Elevators: {Object.keys(buildingState.elevators).length}
            </span>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
