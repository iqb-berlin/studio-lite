import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('setting')
class Setting {
  @PrimaryColumn()
    key: string;

  @Column()
    content: string;
}

export default Setting;
