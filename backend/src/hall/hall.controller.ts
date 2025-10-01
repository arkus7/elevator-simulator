import { Controller, Post, Body } from '@nestjs/common';
import { HallService } from './hall.service';
import {
  CallElevatorRequestDto,
  CallElevatorResponseDto,
} from './dto/call-elevator-request.dto';

@Controller('hall')
export class HallController {
  constructor(private readonly hallService: HallService) {}

  @Post('/call-elevator')
  callElevator(@Body() dto: CallElevatorRequestDto): CallElevatorResponseDto {
    return this.hallService.callElevator(dto);
  }
}
