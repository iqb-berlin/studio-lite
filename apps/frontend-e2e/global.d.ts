/// <reference types="cypress" />
declare namespace Cypress {
  import {
    UnitData, GroupData, WsData, AccessLevel
  } from 'support/testData';
  import { MetadataValuesEntry } from '@studio-lite-lib/api-dto';
  import { UserData, WsSettings, CommentData } from './src/support/testData';

  interface Chainable {
    // Commands UI
    login(username: string, password: string): void;
    clickButton(text: string): void;
    buttonToContinue(
      text: string,
      code: number,
      url: string,
      rest: string,
      alias: string
    ): void;
    dialogButtonToContinue(
      text: string,
      code: number,
      url: string,
      rest: string,
      alias: string
    ): void;
    loadModule(filename: string, name: string): void;
    selectModule(name: string): void;
    visitWs(ws: string): void;
    // Commands API
    // commands-metadata.ts
    getRegistryAPI(token: string): Chainable<Response>; // 35
    getMetadataAPI(profile: string, token: string): Chainable<Response>; // 36
    updateGroupMetadataAPI(groupId: string, token: string): Chainable<Response>; // 37
    getVocabularyMetadataAPI(
      profile: string,
      token: string
    ): Chainable<Response>; // 38
    // updateGroupMetadataAPI(groupId: string, profiles: ProfileData[], token:string): Chainable<Response>// 38
    updateWsMetadataAPI(
      wsId: string,
      unitProfile: string,
      itemProfile: string,
      token: string
    ): Chainable<Response>; // 39
    updateUnitMetadataAPI(
      wsId: string,
      unitId: string,
      profile: string,
      entry: MetadataValuesEntry,
      token: string
    ): Chainable<Response>; // 40
    getUnitMetadataAPI(
      wsId: string,
      unitId: string,
      token: string
    ): Chainable<Response>; // 41
    // commands-api.ts
    runAndIgnore(testFn: () => void): void;
    getWsByGroupAPI(groupKey: string, num_ws: number): void;
    getUsersAPI(): Chainable<Response>;
    setGroupFromAdminsAPI(
      userIds: string[],
      groupId: string,
      token: string
    ): Chainable<Response>;

    // commands-unit-api.ts
    deleteUnitAPI(idUnit: string, idGroup: string): Chainable<Response>;
    // commands-verona-api.ts
    addModuleAPI(module: string);
    getModuleAPI(module: string);
    // commands-api
    addFirstUserAPI(username: string, password: string): Chainable<Response>; // 1
    loginAPI(username: string, password: string): Chainable<Response>; // 2
    getUserIdAPI(token: string): Chainable<Response>; // 3
    updatePasswordAPI(
      token: string,
      oldPass: string,
      newPass: string
    ): Chainable<Response>; // 4
    keycloakAPI(user: UserData): Chainable<Response>; // 5

    createUserAPI(userData: UserData, token: string): Chainable<Response>; // 6
    getUsersFullAPI(token: string): Chainable<Response>; // 7
    getUserAPI(id: string, token: string): Chainable<Response>; // 8
    getUserNoIdAPI(token: string): Chainable<Response>; // 9
    updateUserAPI(
      user: UserData,
      credentials: boolean,
      token: string
    ): Chainable<Response>; // 10
    deleteUserNoIdAPI(id: string, token: string): Chainable<Response>; // 11

    createGroupAPI(group: GroupData, token: string): Chainable<Response>; // 12
    getGroupByIdAPI(groupId: string, token: string): Chainable<Response>; // 13
    getGroupAPI(token: string): Chainable<Response>; // 14
    // updateGroupAPI(token:string):Chainable<Response>; // 15
    setAdminsOfGroupAPI(
      userIds: string[],
      groupId: string,
      token: string
    ): Chainable<Response>; // 16
    getAdminOfGroupAPI(groupId: string, token: string): Chainable<Response>; // 17
    createWsAPI(
      groupId: string,
      ws: WsData,
      token: string
    ): Chainable<Response>; // 18
    moveWsAPI(ws: string, newGroup: string, token: string): Chainable<Response>; // 19
    getWsAPI(wsId: string, token: string): Chainable<Response>; // 20
    updateUsersOfWsAPI(
      wsId: string,
      level: AccessLevel,
      userId: string,
      token: string
    ): Chainable<Response>; // 21
    updateUserListOfWsAPI(
      wsId: string,
      list: AccessUser[],
      token: string
    ): Chainable<Response>; // 21
    getUsersOfWsAdminAPI(
      wsId: string,
      userId: string,
      token: string
    ): Chainable<Response>; // 22
    getWsGroupwiseAPI(token: string): Chainable<Response>; // 23
    updateWsAPI(
      ws: WsData,
      group: GroupData,
      token: string
    ): Chainable<Response>; // 24

    getModulesAPI(token: string): Chainable<Response>; // 26
    getModuleAPI(module: string, token: string): Chainable<Response>; // 27
    downloadModuleAPI(module: string, token: string): Chainable<Response>; // 28

    createUnitAPI(
      wsId: string,
      unit: UnitData,
      token: string
    ): Chainable<Response>; // 30
    getUnitsByWsGAPI(token: string): Chainable<Response>; // 31
    updateWsSettings(
      wsId: string,
      settings: WsSettings,
      token: string
    ): Chainable<Response>; // 32
    getWsNormalAPI(wsId: string, token: string): Chainable<Response>; // 33
    getUsersByWsIdAPI(wsId: string, token: string): Chainable<Response>; // 34

    getUnitsByWsAPI(wsId: string, token: string): Chainable<Response>; // 42
    getUsersOfWsAPI(wsId: string, token: string): Chainable<Response>; // 43
    postCommentAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 45
    getCommentsAPI(wsId: string, unitId: string, token:string): Chainable<Response>; // 46
    updateCommentTimeAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 47
    updateCommentAPI(wsId: string, unitId: string, commentId:string, comment: CommentData, token:string):
    Chainable<Response>; // 48
    deleteCommentAPI(wsId: string, unitId: string, commentId:string, token:string): Chainable<Response>; // 49
    moveToAPI(wsOriginId:string, wsDestinyId: string, unitId:string, token:string):Chainable<Response>
    downloadWsAPI(
      wsId: string,
      settings: string,
      token: string
    ): Chainable<Response>; // 59
    deleteUnitAPI(
      unitId: string,
      wsId: string,
      token: string
    ): Chainable<Response>; // 60

    getWsByUserAPI(id: string, token: string): Chainable<Response>; // 77
    getGroupsByUserAPI(id: string, token: string): Chainable<Response>; // 78
    deleteWsAPI(ws: string, group: string, token: string): Chainable<Response>; // 79
    deleteGroupAPI(id: string, token: string): Chainable<Response>; // 80

    deleteModuleAPI(module: string, token: string): Chainable<Response>; // 89
    deleteUserAPI(id: string, token: string): Chainable<Response>; // 90
    deleteFirstUserAPI(): Chainable<Response>; // 110
  }
}
