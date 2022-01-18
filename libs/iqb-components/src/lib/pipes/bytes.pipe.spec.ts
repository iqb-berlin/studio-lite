import { BytesPipe } from './bytes.pipe';

describe('Bytes Pipe', () => {
  let bytesPipe: BytesPipe;

  beforeEach(() => {
    bytesPipe = new BytesPipe();
  });

  it('should calculate human readable bytes successfully', async () => {
    expect(bytesPipe.transform(1)).toBe('1.0 B');
    expect(bytesPipe.transform(1024)).toBe('1.0 KB');
    expect(bytesPipe.transform(1536)).toBe('1.5 KB');
    expect(bytesPipe.transform(11000000000000)).toBe('10.0 TB');
  });
});
