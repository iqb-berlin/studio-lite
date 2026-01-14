import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { Comment } from '../../comments/models/comment.interface';

export class UnitData {
  databaseId = 0;
  sequenceId = 0;
  name = '';
  responses = {};
  playerId = '';
  definition = '';
  dbMetadata?: UnitPropertiesDto;
  codingSchemeVariables?: VariableCodingData[];
  comments?: Comment[];
}
