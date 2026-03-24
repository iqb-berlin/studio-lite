import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeResourceHTMLPipe } from './safe-resource-html.pipe';

describe('SafeResourceHTMLPipe', () => {
  let pipe: SafeResourceHTMLPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => `safe-${val}`
          }
        }
      ]
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new SafeResourceHTMLPipe(sanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call bypassSecurityTrustHtml', () => {
    const html = '<p>test</p>';
    const result = pipe.transform(html);
    expect(result).toBe('safe-<p>test</p>');
  });
});
