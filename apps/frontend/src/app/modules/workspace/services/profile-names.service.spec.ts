import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MetadataProfileDto } from '@studio-lite-lib/api-dto';
import { ProfileNamesService } from './profile-names.service';
import { MetadataBackendService } from '../../metadata/services/metadata-backend.service';

const MATH_UNIT = 'https://w3id.org/iqb/p11/unit/';
const label = [{ lang: 'de', value: 'IQB Mathematik Primar - Aufgabe' }];

describe('ProfileNamesService', () => {
  let service: ProfileNamesService;
  let getMetadataProfile: jest.Mock;

  beforeEach(() => {
    getMetadataProfile = jest.fn(() => of({
      id: MATH_UNIT, label, groups: [], modifiedAt: new Date()
    } as MetadataProfileDto));
    TestBed.configureTestingModule({
      providers: [{ provide: MetadataBackendService, useValue: { getMetadataProfile } }]
    });
    service = TestBed.inject(ProfileNamesService);
  });

  it('gives the label of a profile asked for, and asks for it once', () => {
    service.request([MATH_UNIT]);
    service.request([MATH_UNIT]);

    expect(service.labels()).toEqual({ [MATH_UNIT]: label });
    expect(getMetadataProfile).toHaveBeenCalledTimes(1);
  });

  // a profile not delivered is shown by its url, and asked for again with the next request
  it('gives no label for a profile not delivered, and asks for it again', () => {
    getMetadataProfile.mockReturnValueOnce(of(false));

    service.request([MATH_UNIT]);
    expect(service.labels()).toEqual({});

    service.request([MATH_UNIT]);
    expect(service.labels()).toEqual({ [MATH_UNIT]: label });
    expect(getMetadataProfile).toHaveBeenCalledTimes(2);
  });
});
