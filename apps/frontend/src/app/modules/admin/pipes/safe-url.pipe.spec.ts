import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: []
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeUrlPipe(sanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform a URL string to a SafeUrl', () => {
    const testUrl = 'https://example.com/test';
    const result = pipe.transform(testUrl);

    expect(result).toBeTruthy();
    expect(typeof result).toBe('object');
  });

  it('should bypass security and trust the URL', () => {
    const testUrl = 'https://example.com/potentially-unsafe';
    const spyBypassSecurity = jest.spyOn(sanitizer, 'bypassSecurityTrustUrl');

    pipe.transform(testUrl);

    expect(spyBypassSecurity).toHaveBeenCalledWith(testUrl);
    expect(spyBypassSecurity).toHaveBeenCalledTimes(1);
  });

  it('should handle empty string', () => {
    const emptyUrl = '';
    const result = pipe.transform(emptyUrl);

    expect(result).toBeTruthy();
  });

  it('should handle blob URLs', () => {
    const blobUrl = 'blob:http://localhost:4200/12345-6789';
    const result = pipe.transform(blobUrl);

    expect(result).toBeTruthy();
  });

  it('should handle data URLs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA';
    const result = pipe.transform(dataUrl);

    expect(result).toBeTruthy();
  });

  it('should return a SafeUrl for relative URLs', () => {
    const relativeUrl = '/assets/image.png';
    const result = pipe.transform(relativeUrl);

    expect(result).toBeTruthy();
  });
});
