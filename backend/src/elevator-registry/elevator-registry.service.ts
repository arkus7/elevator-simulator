import { Injectable } from '@nestjs/common';
import { Elevator, ElevatorId } from '../elevator/elevator.interface';

@Injectable()
export class ElevatorRegistryService {
  private readonly elevators: Map<ElevatorId, Elevator> = new Map();

  register(elevator: Elevator): void {
    this.elevators.set(elevator.id, elevator);
  }

  get(id: ElevatorId): Elevator | undefined {
    return this.elevators.get(id);
  }

  getAll(): Elevator[] {
    return Array.from(this.elevators.values());
  }

  size(): number {
    return this.elevators.size;
  }
}
