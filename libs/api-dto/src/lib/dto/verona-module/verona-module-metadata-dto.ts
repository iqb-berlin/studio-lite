import { ApiProperty } from '@nestjs/swagger';

export class VeronaModuleMetadataDto {
  @ApiProperty()
  type!: 'editor' | 'player' | 'schemer';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  specVersion!: string;

  public getFromJsonLd(jsonMetadata: any) {
    this.type = jsonMetadata.type;
    this.id = jsonMetadata.id;
    let nameDe = '';
    let nameEn = '';
    const nameList: {lang: string, value: string}[] = jsonMetadata.name;
    nameList.forEach(n => {
      if (n.lang === 'de') {
        nameDe = n.value
      } else if (n.lang === 'en') {
        nameEn = n.value
      }
    });
    this.name = nameDe ? nameDe : (nameEn ? nameEn : this.id);
    this.version = jsonMetadata.version;
    this.specVersion = jsonMetadata.specVersion;
  }

  public getFromHtmlDocument(htmlDocument: HTMLDocument) {
    const jsonLdElement: HTMLElement | null = htmlDocument ? htmlDocument.querySelector('script[type="application/ld+json"]') : null;
    if (jsonLdElement) this.getFromJsonLd(JSON.parse(jsonLdElement.innerText))
  }
}
