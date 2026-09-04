import { Column, Entity } from 'typeorm';
import Metadata from './metadata.entity';

/**
 * An item's metadata under one profile -- the same shape as {@link UnitMetadata}, one level
 * further down: items are described under item profiles, units under unit profiles.
 */
@Entity()
class UnitItemMetadata extends Metadata {
  @Column({
    name: 'unit_item_uuid'
  })
    unitItemUuid: string;
}

export default UnitItemMetadata;
