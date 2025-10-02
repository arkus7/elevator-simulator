import { Injectable, Logger } from '@nestjs/common';
import { ElevatorService } from '../../elevator/elevator.service';
import { ElevatorRegistryService } from '../../elevator-registry/elevator-registry.service';
import { Elevator, ElevatorId } from '../../elevator/elevator.interface';
import { ElevatorEvent, ElevatorStatusActiveEvent, ElevatorStatusErrorEvent, ElevatorStatusMaintenanceEvent } from '../../elevator/elevator-event';
import { OnEvent } from '@nestjs/event-emitter';
import { AppConfig } from '../../config/app.config';
import { InjectConfig } from '@unifig/nest';
import type { ConfigContainer } from '@unifig/core';

@Injectable()
export class StatusSimulationService {
    private readonly logger = new Logger(StatusSimulationService.name, {
        timestamp: true,
    });

    private statusTimeouts: Map<ElevatorId, NodeJS.Timeout> = new Map();

    public constructor(
        @InjectConfig(AppConfig)
        private readonly config: ConfigContainer<AppConfig>,
        private readonly elevatorRegistryService: ElevatorRegistryService,
        private readonly elevatorService: ElevatorService,
    ) {}

    @OnEvent(ElevatorEvent.Status.Error)
    public onStatusError(event: ElevatorStatusErrorEvent) {
        this.logger.log(`Elevator ${event.elevatorId} status error`);
    }

    @OnEvent(ElevatorEvent.Status.Maintenance)
    public onStatusMaintenance(event: ElevatorStatusMaintenanceEvent) {
        this.logger.log(`Elevator ${event.elevatorId} status maintenance`);

        const elevator = this.getElevator(event.elevatorId);

        clearTimeout(this.statusTimeouts.get(elevator.id));
        this.statusTimeouts.set(
            elevator.id,
            setTimeout(() => {
                this.statusTimeouts.delete(elevator.id);
                this.elevatorService.completeMaintenance(elevator);
            }, this.config.values.maintenanceFixTimeMs),
        );
    }

    @OnEvent(ElevatorEvent.Status.Active)
    public onStatusActive(event: ElevatorStatusActiveEvent) {
        this.logger.log(`Elevator ${event.elevatorId} status active`);
    }

    private getElevator(elevatorId: ElevatorId): Elevator {
        const elevator = this.elevatorRegistryService.get(elevatorId);
        if (!elevator) {
          this.logger.error(`Elevator ${elevatorId} not found`);
          throw new Error(`Elevator ${elevatorId} not found`);
        }
        return elevator;
      }
}
