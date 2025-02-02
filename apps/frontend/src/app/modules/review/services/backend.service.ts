import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import {
  ReviewFullDto, ReviewSettingsDto,
  UnitDefinitionDto,
  UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { Comment } from '../../comments/models/comment.interface';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUnitMetadata(reviewId: number, unitId: number): Observable<UnitMetadataDto | null> {
    return this.http
      .get<UnitMetadataDto>(`${this.serverUrl}reviews/${reviewId}/units/${unitId}/metadata`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getUnitDefinition(reviewId: number, unitId: number): Observable<UnitDefinitionDto | null> {
    return this.http
      .get<UnitDefinitionDto>(`${this.serverUrl}reviews/${reviewId}/units/${unitId}/definition`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getReview(reviewId: number): Observable <ReviewFullDto | null> {
    return this.http
      .get<ReviewFullDto>(`${this.serverUrl}reviews/${reviewId}`)
      .pipe(
        map(r => {
          if (r.settings) {
            if (!r.settings.bookletConfig) {
              r.settings = <ReviewSettingsDto>{
                bookletConfig: r.settings,
                reviewConfig: {}
              };
            }
          }
          return r;
        }),
        catchError(() => of(null))
      );
  }

  getUnitCoding(reviewId: number, unitId: number): Observable<UnitSchemeDto | null> {
    return this.http
      .get<UnitSchemeDto>(`${this.serverUrl}reviews/${reviewId}/units/${unitId}/scheme`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getUnitComments(reviewId: number, unitId: number): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments`)
      .pipe(
        catchError(() => of([])),
        map(comments => comments)
      );
  }

  getDirectDownloadLink(): string {
    return `${this.serverUrl}packages/`;
  }
}
