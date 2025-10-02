import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { HallService } from './hall.service';
import {
  CallElevatorRequestDto,
  CallElevatorResponseDto,
} from './dto/call-elevator-request.dto';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('hall')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Post('/call-elevator')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Call an elevator to a selected floor, specifying direction. Returns the ID of the elevator that will service the request.',
  })
  @ApiAcceptedResponse({
    description: 'Elevator called successfully',
    type: CallElevatorResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid floor or direction' })
  public callElevator(
    @Body() dto: CallElevatorRequestDto,
  ): CallElevatorResponseDto {
    return this.hallService.callElevator(dto);
  }
}
