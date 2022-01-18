import { Component, Inject, OnInit } from '@angular/core';
import { MainDatastoreService } from '../maindatastore.service';

@Component({
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  constructor(
    @Inject('APP_NAME') public appName: string,
    @Inject('APP_PUBLISHER') public appPublisher: string,
    @Inject('APP_VERSION') public appVersion: string,
    public mds: MainDatastoreService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.pageTitle = 'Impressum/Datenschutz';
    });
  }
}
