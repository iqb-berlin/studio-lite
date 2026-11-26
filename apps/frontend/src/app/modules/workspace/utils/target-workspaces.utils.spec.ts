import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { targetWorkspaces } from './target-workspaces.utils';

describe('targetWorkspaces', () => {
  const groups: WorkspaceGroupDto[] = [
    {
      id: 1,
      name: 'Mathe',
      isAdmin: false,
      workspaces: [
        { id: 10, name: 'Offen', userAccessLevel: 4 },
        { id: 11, name: 'Admin', userAccessLevel: 4 },
        { id: 12, name: 'Entwickler', userAccessLevel: 2 },
        { id: 13, name: 'Kommentierer', userAccessLevel: 1 }
      ]
    },
    {
      id: 2,
      name: 'Deutsch',
      isAdmin: false,
      workspaces: [{ id: 20, name: 'Betreuer', userAccessLevel: 3 }]
    }
  ];

  it('should offer every other workspace in which the user is more than a developer, with its group', () => {
    expect(targetWorkspaces(groups, 10)).toEqual([
      {
        id: 11, name: 'Admin', groupId: 1, groupName: 'Mathe'
      },
      {
        id: 20, name: 'Betreuer', groupId: 2, groupName: 'Deutsch'
      }
    ]);
  });
});
