const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  statusCode?: number;
  response?: any;

  constructor(
    message: string,
    statusCode?: number,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Do nothing
      }
      throw new ApiError(errorMessage, response.status);
    }

    // Handle 202 Accepted (no content expected)
    if (response.status === 202) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export interface CallElevatorResponse {
  elevatorId: string;
}

/**
 * Call an elevator to a specific floor with direction
 */
export async function callElevator(
  floor: number,
  direction: 'up' | 'down'
): Promise<CallElevatorResponse> {
  return apiFetch<CallElevatorResponse>('/hall/call-elevator', {
    method: 'POST',
    body: JSON.stringify({ floor, direction }),
  });
}

/**
 * Schedule a floor for a specific elevator (inside the elevator)
 */
export async function scheduleFloor(
  elevatorId: string,
  floor: number
): Promise<boolean> {
  return apiFetch<boolean>(`/elevator-car/${elevatorId}/schedule-floor`, {
    method: 'POST',
    body: JSON.stringify({ floor }),
  });
}

/**
 * Open the door of a specific elevator
 */
export async function openDoor(elevatorId: string): Promise<void> {
  await apiFetch<void>(`/elevator-car/${elevatorId}/open-door`, {
    method: 'POST',
  });
}

/**
 * Close the door of a specific elevator
 */
export async function closeDoor(elevatorId: string): Promise<void> {
  await apiFetch<void>(`/elevator-car/${elevatorId}/close-door`, {
    method: 'POST',
  });
}

/**
 * Get the current building state
 */
export async function getBuildingState(): Promise<any> {
  return apiFetch<any>('/building/state', {
    method: 'GET',
  });
}

