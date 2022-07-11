import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../types/comment';

@Injectable()
export class CommentsService {
  comments: Comment[] = [
    {
      id: 1,
      body: 'First comment',
      userName: 'Pauline',
      userId: 1,
      parentId: null,
      createdAt: '2021-08-16T23:00:33.010+02:00'
    },
    {
      id: 2,
      body: 'Second comment',
      userName: 'Jenny',
      userId: 2,
      parentId: null,
      createdAt: '2021-08-16T23:00:33.010+02:00'
    },
    {
      id: 3,
      body: 'Reply',
      userName: 'Pauline',
      userId: 1,
      parentId: 2,
      createdAt: '2021-08-16T23:00:33.010+02:00'
    }
  ];

  constructor(private httpClient: HttpClient) {}

  getComments(): Observable<Comment[]> {
    return of(this.comments).pipe(delay(500));
    // return this.httpClient.get<CommentInterface[]>(
    //   url
    // );
  }

  createComment(comment: Partial<Comment>): Observable<number> {
    const newComment = {
      ...comment,
      id: Math.floor((Math.random() * 1000) + 1),
      createdAt: new Date().toISOString()
    } as Comment;
    this.comments.push(newComment);
    return of(newComment.id).pipe(delay(500));
    // return this.httpClient.post<CommentInterface>(
    //   url , comment
    // );
  }

  updateComment(id: number, text: string): Observable<null> {
    const updateComment = this.comments.find(comment => comment.id === id);
    if (updateComment) {
      updateComment.body = text;
    }
    return of(null).pipe(delay(500));
    // return this.httpClient.patch<Comment>(
    //   url,
    //   {
    //     body: text
    //   }
    // );
  }

  deleteComment(id: number): Observable<unknown> {
    const deleteIndex = this.comments.findIndex(comment => comment.id === id);
    if (deleteIndex !== -1) {
      this.comments.splice(deleteIndex, 1);
    }
    return of(null).pipe(delay(500));
    // return this.httpClient.delete(url);
  }
}
