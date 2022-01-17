import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class VeronaModule {
  @PrimaryGeneratedColumn()
  public key: string;

  @Column()
  public metadata: string;

  @Column()
  public file: string;

}

export default VeronaModule;
