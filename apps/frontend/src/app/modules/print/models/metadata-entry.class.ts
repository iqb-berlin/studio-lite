export class MetadataEntry {
  id: string;
  label: string;
  value: string;
  constructor(data: any) {
    this.id = data.id;
    this.label = (data.label && data.label.length) ? data.label[0].value : '';
    this.value = data.value.toString();
  }
}
