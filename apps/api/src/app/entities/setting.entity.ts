import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * The application's settings, one row per key with its content as text -- the app logo, the export
 * configuration, the metadata profile registry. Nothing here is per user or per workspace.
 */
@Entity()
class Setting {
  @PrimaryColumn()
    key: string;

  @Column()
    content: string;
}

export default Setting;
