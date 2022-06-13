import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
class Setting {
  @PrimaryColumn()
  public key: string;

  @Column()
  public content: string;
}

export default Setting;
