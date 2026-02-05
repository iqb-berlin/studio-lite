import { TestBed } from '@angular/core/testing';
import { PreviewService } from './preview.service';
import { PagingMode } from '../models/types';

describe('PreviewService', () => {
  let service: PreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviewService]
    });
    service = TestBed.inject(PreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default paging mode "buttons"', done => {
    service.pagingMode.subscribe((mode: PagingMode) => {
      expect(mode).toBe('buttons');
      done();
    });
  });

  it('should set paging mode to "separate"', done => {
    service.setPagingMode('separate');
    service.pagingMode.subscribe((mode: PagingMode) => {
      expect(mode).toBe('separate');
      done();
    });
  });

  it('should set paging mode to "concat-scroll"', done => {
    service.setPagingMode('concat-scroll');
    service.pagingMode.subscribe((mode: PagingMode) => {
      expect(mode).toBe('concat-scroll');
      done();
    });
  });

  it('should set paging mode to "concat-scroll-snap"', done => {
    service.setPagingMode('concat-scroll-snap');
    service.pagingMode.subscribe((mode: PagingMode) => {
      expect(mode).toBe('concat-scroll-snap');
      done();
    });
  });

  it('should emit new value when paging mode changes', () => {
    const pagingModes: PagingMode[] = ['buttons', 'separate', 'concat-scroll', 'concat-scroll-snap'];
    const emittedValues: PagingMode[] = [];

    service.pagingMode.subscribe((mode: PagingMode) => {
      emittedValues.push(mode);
    });

    pagingModes.forEach(mode => service.setPagingMode(mode));

    expect(emittedValues).toEqual(['buttons', ...pagingModes]);
  });
});
