import './App.css'
import ElevatorShaft from './ElevatorShaft'
import CallButtons from './components/CallButtons'
import { useElevatorEvents } from './hooks/useElevatorEvents'
import * as api from './utils/api'
import { useState } from 'react'

function App() {
  const { connected, buildingState, error, loading } = useElevatorEvents();
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCallElevator = async (floor: number, direction: 'up' | 'down') => {
    console.log(`Calling elevator to floor ${floor}, direction: ${direction}`);
    try {
      const response = await api.callElevator(floor, direction);
      console.log(response); 
      showNotification('success', `Elevator ${response.elevatorId} is on its way to floor ${floor}`);
    } catch (error) {
      console.error('Failed to call elevator:', error);
      const message = error instanceof api.ApiError ? error.message : 'Failed to call elevator';
      showNotification('error', message);
    }
  };

  const handleOpenDoor = async (elevatorId: string) => {
    console.log(`Opening door for ${elevatorId}`);
    try {
      await api.openDoor(elevatorId);
      showNotification('success', `Opening door for elevator ${elevatorId}`);
    } catch (error) {
      console.error('Failed to open door:', error);
      const message = error instanceof api.ApiError ? error.message : 'Failed to open door';
      showNotification('error', message);
    }
  };

  const handleCloseDoor = async (elevatorId: string) => {
    console.log(`Closing door for ${elevatorId}`);
    try {
      await api.closeDoor(elevatorId);
      showNotification('success', `Closing door for elevator ${elevatorId}`);
    } catch (error) {
      console.error('Failed to close door:', error);
      const message = error instanceof api.ApiError ? error.message : 'Failed to close door';
      showNotification('error', message);
    }
  };

  const handleSelectFloor = async (elevatorId: string, floor: number) => {
    console.log(`${elevatorId} selecting floor ${floor}`);
    try {
      await api.scheduleFloor(elevatorId, floor);
      showNotification('success', `Floor ${floor} scheduled for elevator ${elevatorId}`);
    } catch (error) {
      console.error('Failed to schedule floor:', error);
      const message = error instanceof api.ApiError ? error.message : 'Failed to schedule floor';
      showNotification('error', message);
    }
  };

  const handleMaintenanceRequested = async (elevatorId: string) => {
    console.log(`Requesting maintenance for ${elevatorId}`);
    try {
      await api.requestMaintenance(elevatorId);
      showNotification('success', `Maintenance requested for elevator ${elevatorId}`);
    } catch (error) {
      console.error('Failed to start maintenance:', error);
      const message = error instanceof api.ApiError ? error.message : 'Failed to start maintenance';
      showNotification('error', message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏢 Elevator Simulator</h1>
      </header>

      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? '✓' : '⚠'} {notification.message}
        </div>
      )}

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
                onRequestMaintenance={handleMaintenanceRequested}
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
