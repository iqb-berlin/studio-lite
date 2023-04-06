import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchUnitComponent } from './search-unit.component';

describe('SearchUnitComponent', () => {
  let component: SearchUnitComponent;
  let fixture: ComponentFixture<SearchUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchUnitComponent],
      imports: [
        MatTooltipModule,
        MatIconModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatFormFieldModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
