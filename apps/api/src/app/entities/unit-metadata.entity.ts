import { Column, Entity } from 'typeorm';
import Metadata from './metadata.entity';

/**
 * A unit's metadata under one profile. A unit holds at most one row per profile, which is what
 * lets `reconcileProfilesByProfileId` match stored rows to an incoming payload by profile id.
 */
@Entity()
class UnitMetadata extends Metadata {
  @Column({
    name: 'unit_id'
  })
    unitId: number;
}
export default UnitMetadata;
