import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterGutterComponent } from './splitter-gutter.component';

describe('SplitterGutterComponent', () => {
  let component: SplitterGutterComponent;
  let fixture: ComponentFixture<SplitterGutterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();

    fixture = TestBed.createComponent(SplitterGutterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
