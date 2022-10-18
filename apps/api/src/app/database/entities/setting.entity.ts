import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
class Setting {
  @PrimaryColumn()
    key: string;

  @Column()
    content: string;
}

export default Setting;
