import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';

@Entity()
class Review {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'workspace_id'
  })
    workspaceId: number;

  @Column()
    name: string;

  @Column()
    link: string;

  @Column()
    password: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    settings: ReviewSettingsDto;
}

export default Review;
