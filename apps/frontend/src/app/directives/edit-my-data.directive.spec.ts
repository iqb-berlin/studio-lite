import { inject, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { EditMyDataDirective } from './edit-my-data.directive';
import { environment } from '../../environments/environment';
import { AuthService } from '../modules/auth/service/auth.service';

describe('EditMyDataDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();
  });

  it('should create an instance',
    inject([],
      (authService:AuthService) => {
        const directive = new EditMyDataDirective(authService);
        expect(directive).toBeTruthy();
      }));
});
