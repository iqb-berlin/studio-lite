// A message of the export report file that is added to a JSON export zip
// when mapping internal data onto the iqb spec shapes had to drop content.
// The file is only written when at least one message exists; the import
// recognizes it by name and accepts it silently.
export interface ExportReportMessage {
  unitKey: string;
  objectKey: string;
  messageKey: string;
  details?: Record<string, string>;
}

// Collector handed down through the spec transforms so dropped content can
// be reported against the unit and target file it would have belonged to.
// All messages go through report(), which owns the message shape and merges
// the profile context in automatically.
export class ExportReportScope {
  constructor(
    private readonly unitKey: string,
    private readonly objectKey: string,
    private readonly messages: ExportReportMessage[],
    private readonly profileId?: string
  ) {}

  forProfile(profileId: string): ExportReportScope {
    return new ExportReportScope(this.unitKey, this.objectKey, this.messages, profileId);
  }

  report(messageKey: string, details?: Record<string, string>): void {
    const mergedDetails = {
      ...(this.profileId && { profileId: this.profileId }),
      ...details
    };
    this.messages.push({
      unitKey: this.unitKey,
      objectKey: this.objectKey,
      messageKey,
      ...(Object.keys(mergedDetails).length && { details: mergedDetails })
    });
  }
}
