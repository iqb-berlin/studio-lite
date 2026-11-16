import { selectProfileForGroupFromAdmin } from '../../../support/metadata/metadata-util';
import { IqbProfile } from '../../../support/metadata/iqbProfile';
import { baseGroup } from '../../../support/testData';
import { createGroupAdminBaseAPI } from '../../../support/helpers/test-base';

describe('Metadata Profile Management from Admin', () => {
  before(() => {
    createGroupAdminBaseAPI({ users: [] });
  });

  it('assigns metadata profiles to group from admin settings', () => {
    selectProfileForGroupFromAdmin(baseGroup, IqbProfile.DEu);
    selectProfileForGroupFromAdmin(baseGroup, IqbProfile.DEi);
    selectProfileForGroupFromAdmin(baseGroup, IqbProfile.MAu);
    selectProfileForGroupFromAdmin(baseGroup, IqbProfile.MAi);
  });
});
