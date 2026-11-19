import { TestBed } from '@angular/core/testing';
import { FormlyConfig, FormlyForm } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { metadataFormlyConfig } from '@iqb/metadata-components';
import { IdValidator, MetadataModule } from './metadata.module';

describe('MetadataModule Formly configuration', () => {
  it('keeps the shared field components and wrappers when applying Studio defaults', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot(), MetadataModule] });
    const form = TestBed.createComponent(FormlyForm);
    form.detectChanges();
    const config = form.debugElement.injector.get(FormlyConfig);

    metadataFormlyConfig.types.forEach(type => {
      expect(config.getType(type.name)).toMatchObject(type);
    });
    metadataFormlyConfig.wrappers.forEach(wrapper => {
      expect(config.getWrapper(wrapper.name).component).toBe(wrapper.component);
    });
    ['chips', 'vocabInline'].forEach(name => {
      expect(config.getType(name).defaultOptions).toMatchObject({ defaultValue: [], props: { maxLevel: 0 } });
    });
    expect(config.getType('formlyToggle').defaultOptions).toMatchObject({ defaultValue: false });
    expect(config.getType('duration').defaultOptions).toMatchObject({ props: { floatLabel: 'always' } });
    expect(config.getValidator('id').validation).toBe(IdValidator);
  });
});
