import { Injectable } from '@angular/core';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { UnitData } from './classes/unit-data.class';
import { BackendService as AppBackendService } from '../backend.service';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  reviewId = 0;
  reviewName = '';
  units: UnitData[] = [];
  reviewSettings?: ReviewSettingsDto;
  screenHeaderText = 'Startseite';
  pageHeaderText = 'Startseite';
  currentUnitSequenceId = -1;
  private moduleHtmlStore: { [key: string]: string } = {};

  constructor(
    private router: Router,
    private appBackendService: AppBackendService,
    private appService: AppService
  ) {}

  setUnitNavigationRequest(targetUnitId: number) {
    if (targetUnitId < 0) {
      this.router.navigate([`/review/${this.reviewId}/start`]);
    } else if (targetUnitId >= this.units.length) {
      this.router.navigate([`/review/${this.reviewId}/end`]);
    } else {
      this.router.navigate([`/review/${this.reviewId}/u/${targetUnitId}`]);
    }
  }

  setHeaderText(pageName: string) {
    this.pageHeaderText = pageName;
    if (this.reviewSettings) {
      if (this.reviewSettings.unitScreenHeader === 'WITH_UNIT_TITLE') {
        this.screenHeaderText = pageName;
      } else if (this.reviewSettings.unitScreenHeader === 'WITH_BOOKLET_TITLE') {
        this.screenHeaderText = `Review '${this.reviewName}' (Testheft)`;
      } else if (this.reviewSettings.unitScreenHeader === 'WITH_BLOCK_TITLE') {
        this.screenHeaderText = `Review '${this.reviewName}' (Block)`;
      } else {
        this.screenHeaderText = '';
      }
    } else {
      this.screenHeaderText = '';
    }
  }

  async getModuleHtml(key: string): Promise<string | null> {
    if (Object.keys(this.moduleHtmlStore).indexOf(key) >= 0) return this.moduleHtmlStore[key];
    this.appService.dataLoading = true;
    const fileData = await lastValueFrom(this.appBackendService.getModuleHtml(key));
    this.appService.dataLoading = false;
    if (fileData) {
      this.moduleHtmlStore[key] = fileData.file;
      return this.moduleHtmlStore[key];
    }
    return null;
  }
}
