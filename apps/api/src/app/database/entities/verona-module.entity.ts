import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {VeronaModuleMetadataDto} from "@studio-lite-lib/api-dto";

@Entity('verona_module')
class VeronaModule {
  @PrimaryColumn()
  public key: string;

  @Column({
    type: 'jsonb'
  })
  public metadata: VeronaModuleMetadataDto;

  @Column({
    type: 'bytea'
  })
  public file: Uint8Array;

  @Column({
    name: 'file_size'
  })
  public fileSize: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'file_datetime'
  })
  public fileDateTime: Date;

}

export default VeronaModule;
