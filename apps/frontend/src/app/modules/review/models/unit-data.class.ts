import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqb/responses';
import { Comment } from '../../comments/models/comment.interface';

export class UnitData {
  databaseId = 0;
  sequenceId = 0;
  name = '';
  responses = '';
  playerId = '';
  definition = '';
  dbMetadata?: UnitPropertiesDto;
  codingSchemeVariables?: VariableCodingData[];
  comments?: Comment[];
}
