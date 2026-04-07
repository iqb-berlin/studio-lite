import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UnitRichNoteNodeComponent } from './unit-rich-note-node.component';

describe('UnitRichNoteNodeComponent', () => {
  let component: UnitRichNoteNodeComponent;
  let fixture: ComponentFixture<UnitRichNoteNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitRichNoteNodeComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitRichNoteNodeComponent);
    component = fixture.componentInstance;
    component.node = {
      tagId: 'test',
      label: [{ lang: 'de', value: 'Test' }],
      notes: [],
      children: []
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
