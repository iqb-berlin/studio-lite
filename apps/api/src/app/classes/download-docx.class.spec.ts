import type { CodeBookContentSetting } from '@iqb/ngx-coding-components/codebook-models';
import { DownloadDocx } from './download-docx.class';

describe('DownloadDocx shared renderer adapter', () => {
  it('returns a valid DOCX Buffer even for an empty export', async () => {
    const options: CodeBookContentSetting = {
      exportFormat: 'docx',
      missingsProfile: '',
      hasOnlyManualCoding: false,
      hasClosedVars: false,
      hasOnlyVarsWithCodes: false,
      hasDerivedVars: true,
      hasGeneralInstructions: true,
      codeLabelToUpper: false,
      showScore: true,
      hideItemVarRelation: true
    };
    const buffer = await DownloadDocx.getDocXCodebook([], options);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
  });
});
