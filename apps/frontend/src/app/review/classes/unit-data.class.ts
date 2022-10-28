import { UnitMetadataDto } from '@studio-lite-lib/api-dto';

export class UnitData {
  databaseId = 0;
  sequenceId = 0;
  name = '';
  responses = '';
  playerId = '';
  definition = '';
  dbMetadata?: UnitMetadataDto;
}
