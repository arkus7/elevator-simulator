import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { BuildingState, ElevatorState } from '../types';

interface UseElevatorEventsReturn {
  connected: boolean;
  buildingState: BuildingState | null;
  error: string | null;
  loading: boolean;
}

const SOCKET_URL = 'http://localhost:3000/elevator-events';
const API_URL = 'http://localhost:3000';

export function useElevatorEvents(): UseElevatorEventsReturn {
  const [connected, setConnected] = useState(false);
  const [buildingState, setBuildingState] = useState<BuildingState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateElevator = useCallback(
    (elevatorId: string, updates: Partial<ElevatorState>) => {
      setBuildingState((prevState) => {
        if (!prevState) {
          console.warn(`Received event for ${elevatorId} before initial state loaded`);
          return prevState;
        }

        if (!prevState.elevators[elevatorId]) {
          console.error(`Received event for unknown elevator: ${elevatorId}`);
          return prevState;
        }

        return {
          ...prevState,
          elevators: {
            ...prevState.elevators,
            [elevatorId]: {
              ...prevState.elevators[elevatorId],
              ...updates,
            },
          },
        };
      });
    },
    []
  );

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`${API_URL}/building/state`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform the API response to match our BuildingState interface
        const elevators: Record<string, ElevatorState> = {};
        data.elevators.forEach((elevator: any) => {
          elevators[elevator.id] = {
            id: elevator.id,
            currentFloor: elevator.currentFloor,
            direction: elevator.direction,
            doorState: elevator.doorState,
            motionState: elevator.motionState,
            destinationFloors: elevator.destinationFloors,
          };
        });

        setBuildingState({
          config: {
            minFloor: data.config.minFloor,
            maxFloor: data.config.maxFloor,
          },
          elevators,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to fetch initial state:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch building state');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialState();
  }, []);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setConnected(false);
    });

    // Motion Events
    socketInstance.on('elevator.motion.moving', (data: { elevatorId: string; direction: 'up' | 'down' | 'idle' }) => {
      updateElevator(data.elevatorId, {
        direction: data.direction,
        motionState: 'moving',
      });
    });

    socketInstance.on('elevator.motion.stopped', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        motionState: 'stopped',
      });
    });

    socketInstance.on('elevator.motion.idle', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        motionState: 'idle',
        direction: 'idle',
      });
    });

    socketInstance.on('elevator.motion.floor-reached', (data: { elevatorId: string; floor: number }) => {
      updateElevator(data.elevatorId, {
        currentFloor: data.floor,
      });
    });

    // Door Events
    socketInstance.on('elevator.door.opening', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        doorState: 'opening',
      });
    });

    socketInstance.on('elevator.door.opened', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        doorState: 'open',
      });
    });

    socketInstance.on('elevator.door.closing', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        doorState: 'closing',
      });
    });

    socketInstance.on('elevator.door.closed', (data: { elevatorId: string }) => {
      updateElevator(data.elevatorId, {
        doorState: 'closed',
      });
    });

    // Destination Events
    socketInstance.on('elevator.destination.scheduled', (data: { elevatorId: string; destination: number; destinationFloors: number[] }) => {
      setBuildingState((prevState) => {
        if (!prevState) {
          console.warn(`Received destination event for ${data.elevatorId} before initial state loaded`);
          return prevState;
        }
        
        const elevator = prevState.elevators[data.elevatorId];
        if (!elevator) {
          console.error(`Received destination event for unknown elevator: ${data.elevatorId}`);
          return prevState;
        }
        
        return {
          ...prevState,
          elevators: {
            ...prevState.elevators,
            [data.elevatorId]: {
              ...elevator,
              destinationFloors: data.destinationFloors,
            },
          },
        };
      });
    });

    socketInstance.on('elevator.destination.reached', (data: { elevatorId: string; destination: number }) => {
      setBuildingState((prevState) => {
        if (!prevState) {
          console.warn(`Received destination event for ${data.elevatorId} before initial state loaded`);
          return prevState;
        }
        
        const elevator = prevState.elevators[data.elevatorId];
        if (!elevator) {
          console.error(`Received destination event for unknown elevator: ${data.elevatorId}`);
          return prevState;
        }

        const newDestinations = elevator.destinationFloors.filter(f => f !== data.destination);
        
        return {
          ...prevState,
          elevators: {
            ...prevState.elevators,
            [data.elevatorId]: {
              ...elevator,
              destinationFloors: newDestinations,
            },
          },
        };
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [updateElevator]);

  return {
    connected,
    buildingState,
    error,
    loading,
  };
}

