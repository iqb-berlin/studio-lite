import {
  Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import Workspace from './workspace.entity';

/**
 * A task ("Aufgabe") in a workspace -- the central record of the studio. It holds the properties
 * around the task, while the parts that grow large or are edited on their own live in tables of
 * their own: the definition in `UnitDefinition`, comments, rich notes, items, and the metadata in
 * `UnitMetadata` / `UnitItemMetadata`.
 *
 * The three editing tools a unit is worked on with -- player, editor, schemer -- are stored as
 * module keys, so a unit stays bound to the module version it was written with.
 *
 * `metadata` is the older jsonb column. For a unit whose metadata has been taken into the
 * normalized tables, {@link UnitMetadataToDelete} carries the marker, and the column is no longer
 * the truth for it.
 */
@Entity()
class Unit {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'workspace_id'
  })
    workspaceId: number;

  @ManyToOne(() => Workspace)
  @JoinColumn({
    name: 'workspace_id'
  })
    workspace: Workspace;

  @Column()
    key: string;

  @Column()
    name: string;

  @Column({
    name: 'group_name',
    nullable: true
  })
    groupName: string;

  @Column()
    description: string;

  @Column()
    reference: string;

  @Column()
    transcript: string;

  @Column()
    state: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
    metadata = {};

  @Column()
    player: string;

  @Column()
    editor: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    variables = [];

  @Column({
    name: 'last_changed_definition_user',
    nullable: true
  })
    lastChangedDefinitionUser: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_definition',
    nullable: true
  })
    lastChangedDefinition: Date;

  @Column()
    schemer: string;

  @Column()
    scheme: string;

  @Column({
    name: 'scheme_type'
  })
    schemeType: string;

  @Column({
    name: 'last_changed_scheme_user',
    nullable: true
  })
    lastChangedSchemeUser: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_scheme',
    nullable: true
  })
    lastChangedScheme: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_metadata'
  })
    lastChangedMetadata: Date;

  @Column({
    name: 'last_changed_metadata_user',
    nullable: true
  })
    lastChangedMetadataUser: string;

  @Column({
    nullable: true,
    unique: true
  })
    uuid: string;
}

export default Unit;
