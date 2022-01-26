import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {VeronaModuleMetadataDto} from "@studio-lite-lib/api-dto";

@Entity('verona_module')
class VeronaModule {
  @PrimaryGeneratedColumn()
  public key: string;

  @Column({
    type: 'jsonb'
  })
  public metadata: VeronaModuleMetadataDto;

  @Column()
  public file: string;

}

export default VeronaModule;
