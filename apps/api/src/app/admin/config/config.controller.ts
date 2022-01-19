import {Controller, Get } from '@nestjs/common';
import {ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {ConfigFullDto} from "@studio-lite-lib/api-admin";

@Controller('admin/config')
export class ConfigController {

  @Get()
  @ApiCreatedResponse({
    type: ConfigFullDto,
  })
  @ApiTags('admin config')
  async findAll(): Promise<ConfigFullDto> {
    return <ConfigFullDto>{
      appTitle: 'IQB-Teststudio-Lite',
      introHtml: '<p>trustedIntroHtml</p>',
      imprintHtml: '<p>trustedImprintHtml</p>',
      globalWarningText: '',
      globalWarningExpiredDay: undefined,
      globalWarningExpiredHour: undefined
    };
  }
}
