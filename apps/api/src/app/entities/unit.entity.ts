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
    name: 'group_name'
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
    name: 'definition_id'
  })
    definitionId: number;

  @Column({
    name: 'metadata_id'
  })
    metadataId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
    variables = [];

  @Column({
    name: 'last_changed_definition_user'
  })
    lastChangedDefinitionUser: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_definition'
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
    name: 'last_changed_scheme_user'
  })
    lastChangedSchemeUser: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_scheme'
  })
    lastChangedScheme: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_metadata'
  })
    lastChangedMetadata: Date;

  @Column({
    name: 'last_changed_metadata_user'
  })
    lastChangedMetadataUser: string;
}

export default Unit;
