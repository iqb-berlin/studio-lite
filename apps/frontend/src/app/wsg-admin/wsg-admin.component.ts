import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WsgAdminService } from './wsg-admin.service';

@Component({
  template: `
    <div class="page-body">
      <div class="admin-background">
        <nav mat-tab-nav-bar>
          <a mat-tab-link
             *ngFor="let link of navLinks"
             [routerLink]="link.path"
             routerLinkActive="active-link" #rla="routerLinkActive"
             [active]="rla.isActive">
            {{link.label}}
          </a>
        </nav>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-background {
      box-shadow: 5px 10px 20px black;
      background-color: white;
      padding: 25px;
      margin: 0 15px 15px 15px;
      height: calc(100% - 65px);
    }

    .communication-error-message {
      color: red;
      padding: 10px 50px;
    }
    .active-link {
      color: black;
    }
  `]
})
export class WsgAdminComponent {
  navLinks = [
    { path: 'users', label: 'Nutzer:innen' },
    { path: 'workspaces', label: 'Arbeitsbereiche' }
    // { path: 'settings', label: 'Einstellungen' }
  ];

  constructor(
    private wsgAdminService: WsgAdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.wsgAdminService.selectedWorkspaceGroup = Number(this.route.snapshot.params['wsg']);
    });
  }
}
