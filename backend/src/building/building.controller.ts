import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { BuildingService } from './building.service';
import { BuildingStateResponseDto } from './dto/building-state-response.dto';

@Controller('building')
export class BuildingController {
  constructor(
    private readonly buildingService: BuildingService,
  ) {}

  @Get('state')
  @ApiOperation({
    summary: 'Get the current state of the building and all elevators',
  })
  @ApiOkResponse({
    description: 'Current building state',
    type: BuildingStateResponseDto,
  })
  public getBuildingState(): BuildingStateResponseDto {
    return this.buildingService.getBuildingState();
  }
}

