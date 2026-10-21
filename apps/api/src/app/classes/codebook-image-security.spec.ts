import { spawnSync } from 'node:child_process';

/** Exercise the parser actually resolved by the installed CommonJS generator. */
describe('Codebook image parser security', () => {
  it('rejects an ICNS entry that cannot advance instead of looping forever', () => {
    const result = spawnSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const path = require('node:path');
      const entry = require.resolve('@iqb/ngx-coding-components/codebook-generator');
      const parser = require(require.resolve('image-size', { paths: [path.dirname(entry)] }));
      const invalid = Buffer.alloc(16);
      invalid.write('icns', 0);
      invalid.writeUInt32BE(16, 4);
      invalid.write('ic07', 8);
      invalid.writeUInt32BE(0, 12);
      assert.throws(() => parser.imageSize(invalid), /Invalid ICNS/);
      const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=', 'base64');
      const dimensions = parser.imageSize(png);
      assert.equal(dimensions.width, 1);
      assert.equal(dimensions.height, 1);
    `], { cwd: process.cwd(), timeout: 5000, encoding: 'utf8' });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
  });
});
