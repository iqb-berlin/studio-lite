import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@studio-lite/shared-code';
import { Comment } from '../../comments/types/comment';

export class UnitData {
  databaseId = 0;
  sequenceId = 0;
  name = '';
  responses = '';
  playerId = '';
  definition = '';
  dbMetadata?: UnitMetadataDto;
  codingSchemeVariables?: VariableCodingData[];
  comments?: Comment[];
}
