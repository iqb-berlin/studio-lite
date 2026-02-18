import { TestBed } from '@angular/core/testing';
import { DurationService } from './duration.service';

describe('DurationService', () => {
  let service: DurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('convertSecondsToMinutes', () => {
    it('should convert 0 seconds to 00:00', () => {
      expect(DurationService.convertSecondsToMinutes(0)).toEqual({ minutes: '00', seconds: '00' });
    });

    it('should convert 59 seconds to 00:59', () => {
      expect(DurationService.convertSecondsToMinutes(59)).toEqual({ minutes: '00', seconds: '59' });
    });

    it('should convert 60 seconds to 01:00', () => {
      expect(DurationService.convertSecondsToMinutes(60)).toEqual({ minutes: '01', seconds: '00' });
    });

    it('should convert 65 seconds to 01:05', () => {
      expect(DurationService.convertSecondsToMinutes(65)).toEqual({ minutes: '01', seconds: '05' });
    });

    it('should convert 120 seconds to 02:00', () => {
      expect(DurationService.convertSecondsToMinutes(120)).toEqual({ minutes: '02', seconds: '00' });
    });

    it('should convert 3600 seconds to 60:00', () => {
      expect(DurationService.convertSecondsToMinutes(3600)).toEqual({ minutes: '60', seconds: '00' });
    });

    it('should round seconds correctly', () => {
      // 60.4 seconds -> 01:00 (since 0.4 seconds rounds to 0)
      expect(DurationService.convertSecondsToMinutes(60.4)).toEqual({ minutes: '01', seconds: '00' });
      // 60.6 seconds -> 01:01 (since 0.6 seconds rounds to 1)
      expect(DurationService.convertSecondsToMinutes(60.6)).toEqual({ minutes: '01', seconds: '01' });
    });
  });
});
