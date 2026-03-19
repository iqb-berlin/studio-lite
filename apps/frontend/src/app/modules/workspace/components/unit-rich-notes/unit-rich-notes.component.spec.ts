import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { UnitRichNotesComponent } from './unit-rich-notes.component';

describe('UnitRichNotesComponent', () => {
  let component: UnitRichNotesComponent;
  let fixture: ComponentFixture<UnitRichNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UnitRichNotesComponent,
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UnitRichNotesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
