import {
  Column, Entity, PrimaryColumn
} from 'typeorm';
import { VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';

@Entity('verona_module')
class VeronaModule {
  @PrimaryColumn()
    key: string;

  @Column({
    type: 'jsonb'
  })
    metadata: VeronaModuleMetadataDto;

  @Column({
    type: 'bytea'
  })
    file: Uint8Array;

  @Column({
    name: 'file_size'
  })
    fileSize: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'file_datetime'
  })
    fileDateTime: Date;
}

export default VeronaModule;
