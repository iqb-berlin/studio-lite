import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Unit {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({
    name: 'workspace_id'
  })
    workspaceId: number;

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
}

export default Unit;
