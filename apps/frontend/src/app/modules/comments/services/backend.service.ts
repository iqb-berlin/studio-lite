import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UpdateUnitCommentUnitItemsDto, UpdateUnitUserDto, UnitCommentVoterDto } from '@studio-lite-lib/api-dto';
import { Comment } from '../models/comment.interface';

@Injectable()
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private httpClient: HttpClient
  ) {}

  getComments(workspaceId: number, unitId: number, reviewId: number): Observable<Comment[]> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments`;
    return this.httpClient
      .get<Comment[]>(url)
      .pipe(
        catchError(() => of([])),
        map(comments => comments)
      );
  }

  updateComments(updateUnitUser: UpdateUnitUserDto, workspaceId: number, unitId: number): Observable<boolean> {
    return this.httpClient
      .patch(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments`, updateUnitUser)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  createComment(
    comment: Partial<Comment>, workspaceId: number, unitId: number, reviewId: number
  ): Observable<number | null> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments`;
    return this.httpClient
      .post<number>(url, comment)
      .pipe(
        catchError(() => of(null)),
        map(returnId => (returnId === null ? null : Number(returnId)))
      );
  }

  updateComment(
    id: number, body: Partial<Comment>, workspaceId: number, unitId: number, reviewId: number
  ): Observable<boolean> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${id}` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${id}`;
    return this.httpClient
      .patch(url, body)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  updateCommentVisibility(
    id: number, body: Partial<Comment>, workspaceId: number, unitId: number, reviewId: number
  ): Observable<boolean> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${id}/hidden` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${id}/hidden`;
    return this.httpClient
      .patch(url, body)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteComment(id: number, workspaceId: number, unitId: number, reviewId: number): Observable<unknown> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${id}` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${id}`;
    return this.httpClient
      .delete(url)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  updateCommentItemConnections(
    comment: UpdateUnitCommentUnitItemsDto, workspaceId: number, unitId: number, reviewId: number, commentId: number
  ): Observable<boolean> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${commentId}/items` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${commentId}/items`;
    return this.httpClient
      .patch(url, comment)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  toggleVote(
    workspaceId: number, unitId: number, reviewId: number, commentId: number, vote: 'up' | 'down' | null
  ): Observable<boolean> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${commentId}/vote` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${commentId}/vote`;
    return this.httpClient
      .post(url, { vote })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getCommentVoters(
    workspaceId: number, unitId: number, reviewId: number, commentId: number
  ): Observable<UnitCommentVoterDto[]> {
    const url = reviewId > 0 ?
      `${this.serverUrl}reviews/${reviewId}/units/${unitId}/comments/${commentId}/votes` :
      `${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/comments/${commentId}/votes`;
    return this.httpClient
      .get<UnitCommentVoterDto[]>(url)
      .pipe(
        catchError(() => of([]))
      );
  }
}
