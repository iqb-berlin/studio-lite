import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { VoterOverviewComponent } from './voter-overview.component';
import { UnitCommentVoterDto } from '@studio-lite-lib/api-dto';

describe('VoterOverviewComponent', () => {
  let component: VoterOverviewComponent;
  let fixture: ComponentFixture<VoterOverviewComponent>;

  const mockVoters: UnitCommentVoterDto[] = [
    { userName: 'User Up 1', vote: 'up' },
    { userName: 'User Up 2', vote: 'up' },
    { userName: 'User Down 1', vote: 'down' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VoterOverviewComponent,
        MatDialogModule,
        MatIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { voters: mockVoters } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VoterOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter upVoters correctly', () => {
    expect(component.upVoters.length).toBe(2);
    expect(component.upVoters).toContain('User Up 1');
    expect(component.upVoters).toContain('User Up 2');
  });

  it('should filter downVoters correctly', () => {
    expect(component.downVoters.length).toBe(1);
    expect(component.downVoters).toContain('User Down 1');
  });

  it('should show empty message if no voters are present', () => {
    // Re-configure for empty data
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [VoterOverviewComponent, MatDialogModule, MatIconModule, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { voters: [] } }
      ]
    });
    const emptyFixture = TestBed.createComponent(VoterOverviewComponent);
    const emptyComponent = emptyFixture.componentInstance;
    expect(emptyComponent.upVoters.length).toBe(0);
    expect(emptyComponent.downVoters.length).toBe(0);
  });
});
