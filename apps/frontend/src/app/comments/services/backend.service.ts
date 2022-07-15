import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Comment } from '../types/comment';

@Injectable()
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private httpClient: HttpClient
  ) {}

  getComments(workspaceId: number, unitId: number): Observable<Comment[]> {
    return this.httpClient
      .get<Comment[]>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/comments`)
      .pipe(
        catchError(() => of([])),
        map(comments => comments)
      );
  }

  createComment(comment: Partial<Comment>, workspaceId: number, unitId: number): Observable<number | null> {
    return this.httpClient
      .post<number>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/comments`, comment)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  updateComment(id: number, body: Partial<Comment>, workspaceId: number, unitId: number): Observable<boolean> {
    return this.httpClient
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitId}/comments/${id}`, body)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteComment(id: number, workspaceId: number, unitId: number): Observable<unknown> {
    return this.httpClient
      .delete(`${this.serverUrl}workspace/${workspaceId}/${unitId}/comments/${id}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
