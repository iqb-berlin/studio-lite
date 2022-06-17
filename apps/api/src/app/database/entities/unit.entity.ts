import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Unit {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    name: 'workspace_id'
  })
  public workspaceId: number;

  @Column()
  public key: string;

  @Column()
  public name: string;

  @Column({
    name: 'group_name'
  })
  public groupName: string;

  @Column()
  public description: string;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'{}'",
    nullable: false
  })
  public metadata = {};

  @Column()
  public player: string;

  @Column()
  public editor: string;

  @Column({
    name: 'definition_id'
  })
  public definitionId: number;

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false
  })
  public variables = [];

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_definition'
  })
  public lastChangedDefinition: Date;

  @Column()
  public schemer: string;

  @Column()
  public scheme: string;

  @Column({
    name: 'scheme_type'
  })
  public schemeType: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_scheme'
  })
  public lastChangedScheme: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_changed_metadata'
  })
  public lastChangedMetadata: Date;
}

export default Unit;
