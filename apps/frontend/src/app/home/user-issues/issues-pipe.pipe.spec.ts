import { UserIssuesPipe } from './issues-pipe.pipe';

describe('IssuesPipePipe', () => {
  it('create an instance', () => {
    const pipe = new UserIssuesPipe();
    expect(pipe).toBeTruthy();
  });
});
