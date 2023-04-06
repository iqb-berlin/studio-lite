import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { SelectUnitListComponent } from './select-unit-list.component';

describe('SelectUnitListComponent', () => {
  let component: SelectUnitListComponent;
  let fixture: ComponentFixture<SelectUnitListComponent>;

  @Component({ selector: 'studio-lite-search-unit', template: '' })
  class MockSearchUnitComponent {
    value: string = '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SelectUnitListComponent,
        MockSearchUnitComponent
      ],
      imports: [
        HttpClientModule,
        MatTooltipModule,
        MatTableModule,
        MatIconModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule.forRoot()
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectUnitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
