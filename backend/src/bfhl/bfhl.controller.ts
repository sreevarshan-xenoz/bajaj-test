import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { BfhlService } from './bfhl.service';

type BfhlRequestBody = {
  data?: unknown;
};

@Controller()
export class BfhlController {
  constructor(private readonly bfhlService: BfhlService) {}

  @Get('/')
  health() {
    return { status: 'ok', service: 'bfhl-backend' };
  }

  @Post('/bfhl')
  @HttpCode(HttpStatus.OK)
  process(@Body() body: BfhlRequestBody) {
    if (!Array.isArray(body?.data)) {
      throw new HttpException({ is_success: false, error: 'Invalid input' }, HttpStatus.BAD_REQUEST);
    }

    const result = this.bfhlService.processData(body.data);

    return {
      is_success: true,
      user_id: this.bfhlService.userId,
      email_id: this.bfhlService.email,
      college_roll_number: this.bfhlService.roll,
      ...result,
    };
  }
}
