import { Column, Entity } from 'typeorm';
import Metadata from './metadata.entity';

@Entity()
class UnitMetadata extends Metadata {
  @Column({
    name: 'unit_id'
  })
    unitId: number;
}
export default UnitMetadata;
