import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';

@Entity()
class Review {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    name: 'workspace_id'
  })
  public workspaceId: number;

  @Column()
  public name: string;

  @Column()
  public link: string;

  @Column()
  public password: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
  public settings: ReviewSettingsDto;
}

export default Review;
