import { Column, Entity } from 'typeorm';
import Metadata from './metadata.entity';

@Entity()
class UnitItemMetadata extends Metadata {
  @Column({
    name: 'unit_item_uuid'
  })
    unitItemUuid: string;
}

export default UnitItemMetadata;
