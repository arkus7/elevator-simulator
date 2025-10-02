# Elevator Simulator

An elevator control system simulator with real-time updates via WebSockets.

## Project Structure

- **backend/** - NestJS backend API with WebSocket support
- **frontend/** - React frontend with Vite

## Quick Start with Docker

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository
2. Copy environment files and adjust if needed:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3005
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/swagger

5. Stop the application:
   ```bash
   docker-compose down
   ```

### Configuration

#### Backend Environment Variables

Edit the `docker-compose.yml` file to customize backend settings:

- `PORT` - Server port (default: 3000)
- `ELEVATOR_COUNT` - Number of elevators (default: 2)
- `UNDERGROUND_FLOORS` - Number of underground floors (default: 0)
- `ABOVE_GROUND_FLOORS` - Number of above ground floors (default: 5)
- `FLOOR_TRAVEL_TIME_MS` - Time to travel between floors in milliseconds (default: 2000)
- `DOOR_OPEN_CLOSE_TIME_MS` - Time to open/close doors in milliseconds (default: 300)
- `DOOR_HOLD_TIME_MS` - Time doors stay open in milliseconds (default: 1000)

#### Frontend Environment Variables

For production deployment, update the build args in `docker-compose.yml`:

```yaml
args:
  - VITE_API_URL=https://your-api-domain.com
  - VITE_WS_URL=wss://your-api-domain.com
```

### Development Setup

If you want to run the services individually for development:

#### Backend
```bash
cd backend
npm install
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit http://localhost:3000/swagger for interactive API documentation.

## WebSocket Events

The application uses WebSocket for real-time elevator state updates:

- `elevator.motion.moving` - Elevator started moving
- `elevator.motion.stopped` - Elevator stopped
- `elevator.motion.idle` - Elevator is idle
- `elevator.motion.floor-reached` - Elevator reached a floor
- `elevator.door.opening` - Door is opening
- `elevator.door.opened` - Door is open
- `elevator.door.closing` - Door is closing
- `elevator.door.closed` - Door is closed
- `elevator.destination.scheduled` - New destination added
- `elevator.destination.reached` - Destination reached


## Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### WebSocket connection issues

- Ensure the backend is running and healthy
- Check that VITE_WS_URL matches your backend URL
- For HTTPS deployments, use `wss://` protocol
- Check CORS settings if connecting from different origin

### Build issues

- Clear Docker build cache: `docker-compose build --no-cache`
- Remove volumes: `docker-compose down -v`
- Check logs: `docker-compose logs`

