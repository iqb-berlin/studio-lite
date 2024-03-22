import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ItemsComponent } from './items.component';

describe('ItemsComponent', () => {
  let component: ItemsComponent;
  let fixture: ComponentFixture<ItemsComponent>;

  @Component({ selector: 'studio-lite-wrapped-icon', template: '' })
  class MockWrappedIconComponent {
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockWrappedIconComponent
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ],
      imports: [
        MatTooltipModule,
        MatIconModule,
        MatDialogModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemsComponent);
    component = fixture.componentInstance;
    component.variablesLoader = new BehaviorSubject<string[]>([]);
    component.metadata = {};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
