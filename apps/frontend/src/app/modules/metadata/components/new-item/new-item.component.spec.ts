import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { NewItemComponent } from './new-item.component';

describe('NewItemComponent', () => {
  let component: NewItemComponent;
  let fixture: ComponentFixture<NewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        NewItemComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            items: [
              { id: 'item1' } as ItemsMetadataValues,
              { id: '' } as ItemsMetadataValues
            ]
          }
        },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize options with empty item and existing items', () => {
    // metadata.empty-item + 2 items from mock data
    expect(component.options.length).toBe(3);
    expect(component.options[1]).toBe('item1');
  });
});
