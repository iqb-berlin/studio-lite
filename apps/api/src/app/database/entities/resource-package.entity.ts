import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class ResourcePackage {
  @PrimaryGeneratedColumn()
    id: number;

  @Column()
    name: string;

  @Column('text', { array: true })
    elements;

  @Column({
    type: 'timestamp with time zone',
    name: 'created_at'
  })
    createdAt: Date;
}

export default ResourcePackage;
