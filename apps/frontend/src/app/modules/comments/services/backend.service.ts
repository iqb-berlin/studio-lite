import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UpdateUnitUserDto } from '@studio-lite-lib/api-dto';
import { Comment } from '../models/comment.interface';

@Injectable()
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private httpClient: HttpClient
  ) {}

  getComments(workspaceId: number, unitId: number, reviewId: number): Observable<Comment[]> {
    const url = reviewId > 0 ?
      `${this.serverUrl}review/${reviewId}/${unitId}/comments` :
      `${this.serverUrl}workspace/${workspaceId}/${unitId}/comments`;
    return this.httpClient
      .get<Comment[]>(url)
      .pipe(
        catchError(() => of([])),
        map(comments => comments)
      );
  }

  updateComments(updateUnitUser: UpdateUnitUserDto, workspaceId: number, unitId: number): Observable<boolean> {
    return this.httpClient
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitId}/comments`, updateUnitUser)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  createComment(
    comment: Partial<Comment>, workspaceId: number, unitId: number, reviewId: number
  ): Observable<number | null> {
    const url = reviewId > 0 ?
      `${this.serverUrl}review/${reviewId}/${unitId}/comments` :
      `${this.serverUrl}workspace/${workspaceId}/${unitId}/comments`;
    return this.httpClient
      .post<number>(url, comment)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  updateComment(
    id: number, body: Partial<Comment>, workspaceId: number, unitId: number, reviewId: number
  ): Observable<boolean> {
    const url = reviewId > 0 ?
      `${this.serverUrl}review/${reviewId}/${unitId}/comments/${id}` :
      `${this.serverUrl}workspace/${workspaceId}/${unitId}/comments/${id}`;
    return this.httpClient
      .patch(url, body)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteComment(id: number, workspaceId: number, unitId: number, reviewId: number): Observable<unknown> {
    const url = reviewId > 0 ?
      `${this.serverUrl}review/${reviewId}/${unitId}/comments/${id}` :
      `${this.serverUrl}workspace/${workspaceId}/${unitId}/comments/${id}`;
    return this.httpClient
      .delete(url)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
