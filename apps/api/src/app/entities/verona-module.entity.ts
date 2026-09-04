import {
  Column, Entity, PrimaryColumn
} from 'typeorm';
import { VeronaModuleMetadataDto } from '@studio-lite-lib/api-dto';

/**
 * An installed Verona module -- player, editor, schemer or widget -- with its metadata and the
 * packaged file itself in the database, so a unit can be opened with exactly the module version it
 * was written with. The key is `name@major.minor…`; see `VeronaModuleKeyCollection` for what may
 * stand in for a key that is not installed.
 */
@Entity()
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
