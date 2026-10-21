import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * The unit's definition -- what the editor produced and the player renders -- kept out of
 * {@link Unit} because it is by far the largest part of a unit and is written on its own.
 */
@Entity()
class UnitDefinition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  data: string;

  /**
   * The format `data` is written in, as the editor reported it (`unitDefinitionType`, e.g.
   * `aspect-unit-definition@4.12.0`). `null` means not reported, not unknown to anyone: editors
   * that do not send the field leave it empty, and so does every unit not saved since 21.0.0.
   */
  @Column({
    type: 'varchar',
    nullable: true
  })
  type: string | null;

  @Column({
    name: 'unit_id'
  })
  unitId: number;
}

export default UnitDefinition;
