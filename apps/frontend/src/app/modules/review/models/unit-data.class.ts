import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { Comment } from '../../comments/models/comment.interface';
import { Progress } from '../../workspace/models/types';

export class UnitData {
  databaseId = 0;
  sequenceId = 0;
  name = '';
  responses = {};
  // the progress the player reported last, none before it has reported any (#2169)
  presentationProgress?: Progress;
  responseProgress?: Progress;
  playerId = '';
  definition = '';
  // the format of `definition`, when the editor reported one
  definitionType?: string;
  dbMetadata?: UnitPropertiesDto;
  codingSchemeVariables?: VariableCodingData[];
  comments?: Comment[];
}
