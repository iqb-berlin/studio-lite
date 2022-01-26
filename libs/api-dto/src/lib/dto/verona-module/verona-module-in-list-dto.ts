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

  public static getFromJsonLd(jsonMetadata: any): VeronaModuleMetadataDto | null {
    let returnData: VeronaModuleMetadataDto | null = null;
    if (jsonMetadata.type) {
      returnData = {
        type: jsonMetadata.type,
        id: jsonMetadata.id,
        name: '',
        version: jsonMetadata.version,
        specVersion: jsonMetadata.specVersion
      }
      let nameDe = '';
      let nameEn = '';
      const nameList: { lang: string, value: string }[] = jsonMetadata.name;
      nameList.forEach(n => {
        if (n.lang === 'de') {
          nameDe = n.value
        } else if (n.lang === 'en') {
          nameEn = n.value
        }
      });
      returnData.name = nameDe ? nameDe : (nameEn ? nameEn : returnData.id);
    } else if (jsonMetadata['@type']) {
      returnData = {
        type: jsonMetadata['@type'],
        id: jsonMetadata['@id'],
        name: jsonMetadata.name.de ? jsonMetadata.name.de : (jsonMetadata.name.en ? jsonMetadata.name.en : jsonMetadata['@id']),
        version: jsonMetadata.version,
        specVersion: jsonMetadata.apiVersion
      }
    }
    return returnData
  }

  /*
  public getFromHtmlDocument(htmlDocument: HTMLDocument) {
    const jsonLdElement: HTMLElement | null = htmlDocument ? htmlDocument.querySelector('script[type="application/ld+json"]') : null;
    if (jsonLdElement) VeronaModuleMetadataDto.getFromJsonLd(JSON.parse(jsonLdElement.innerText))
  }
   */
}
