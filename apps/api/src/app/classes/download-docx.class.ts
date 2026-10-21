import { CodebookDocxGenerator } from '@iqb/ngx-coding-components/codebook-generator';
import type { CodebookUnitDto, CodeBookContentSetting } from '@iqb/ngx-coding-components/codebook-models';

/** Compatibility adapter; rendering is owned by coding-components. */
export class DownloadDocx {
  static async getDocXCodebook(units: CodebookUnitDto[], options: CodeBookContentSetting): Promise<Buffer> {
    const blob = await CodebookDocxGenerator.generateDocx(units, options);
    return Buffer.from(await blob.arrayBuffer());
  }
}
