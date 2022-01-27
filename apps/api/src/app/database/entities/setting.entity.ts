import {Column, Entity, PrimaryColumn} from 'typeorm';
import {ConfigFullDto} from "@studio-lite-lib/api-dto";

@Entity()
class Setting {
  @PrimaryColumn()
  public key: string;

  @Column({
    type: 'jsonb'
  })
  public content: ConfigFullDto;
}

export default Setting;
