import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string
  ) {}
}
