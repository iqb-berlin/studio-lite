import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class ResourcePackage {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column('text', { array: true })
  public elements;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
  public createdAt: Date;
}

export default ResourcePackage;
