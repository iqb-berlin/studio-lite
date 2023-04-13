import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusIndicationComponent } from './status-indication.component';

describe('StatusIndicationComponent', () => {
  let component: StatusIndicationComponent;
  let fixture: ComponentFixture<StatusIndicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatusIndicationComponent],
      imports: [
        MatTooltipModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusIndicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
