/// <reference types="cypress" />
declare namespace Cypress {
  import {
    UnitData, GroupData, WsData, AccessLevel
  } from 'support/testData';
  import {
    UserData, WsSettings, CommentData, AccessUser, ReviewData, MyData
  } from './src/support/testData';
  import { UnitExport } from './src/e2e/api/api-settings.cy';

  interface Chainable {
    // Commands UI
    login(username: string, password: string): void;
    clickButton(text: string): void;
    buttonToContinue(text: string, code: number, url: string, rest: string, alias: string): void;
    dialogButtonToContinue(text: string, code: number, url: string, rest: string, alias: string): void;
    loadModule(filename: string, name: string): void;
    selectModule(name: string): void;
    visitWs(ws: string): void;
    // Commands API
    // commands-metadata.ts
    getRegistryAPI(token: string): Chainable<Response>; // 35
    getMetadataAPI(profile: string, token: string): Chainable<Response>; // 36
    updateGroupMetadataAPI(groupId: string, token: string): Chainable<Response>; // 37
    getVocabularyMetadataAPI(profile: string, token: string): Chainable<Response>; // 38
    // updateGroupMetadataAPI(groupId: string, profiles: ProfileData[], token:string): Chainable<Response>// 38
    updateWsMetadataAPI(wsId: string, settings: WsSettings, token: string): Chainable<Response>; // 39

    // commands-api.ts
    runAndIgnore(testFn: () => void): void;

    getUsersAPI(): Chainable<Response>;
    setGroupFromAdminsAPI(userIds: string[], groupId: string, token: string): Chainable<Response>;
    // commands-verona-api.ts
    addModuleAPI(module: string);
    getModuleAPI(module: string);
    // commands-api
    addFirstUserAPI(username: string, password: string): Chainable<Response>; // 1
    loginAPI(username: string, password: string): Chainable<Response>; // 2
    getUserIdAPI(token: string): Chainable<Response>; // 3
    updatePasswordAPI(token: string, oldPass: string, newPass: string): Chainable<Response>; // 4
    keycloakAPI(user: UserData): Chainable<Response>; // 5

    createUserAPI(userData: UserData, token: string): Chainable<Response>; // 6
    getUsersFullAPI(full: boolean, token: string): Chainable<Response>; // 7

    updateUserAPI(id:string, user: UserData, credentials: boolean, token: string): Chainable<Response>; // 10
    deleteUserNoIdAPI(id: string, token: string): Chainable<Response>; // 11

    createGroupAPI(group: GroupData, token: string): Chainable<Response>; // 12
    getGroupByIdAPI(groupId: string, token: string): Chainable<Response>; // 13
    getGroupAPI(token: string): Chainable<Response>; // 14
    // updateGroupAPI(token:string):Chainable<Response>; // 15
    setAdminsOfGroupAPI(userIds: string[], groupId: string, token: string): Chainable<Response>; // 16
    getUserAPI(id: string, token: string): Chainable<Response>; // 8

    getAdminOfGroupAPI(groupId: string, token: string): Chainable<Response>; // 17
    createWsAPI(groupId: string, ws: WsData, token: string): Chainable<Response>; // 18
    moveWsAPI(ws: string, newGroup: string, token: string): Chainable<Response>; // 19
    getWsAPI(wsId: string, token: string): Chainable<Response>; // 20
    updateUsersOfWsAPI(wsId: string, level: AccessLevel, userId: string, token: string): Chainable<Response>; // 21
    updateUserListOfWsAPI(wsId: string, list: AccessUser[], token: string): Chainable<Response>; // 21
    getUsersOfWsAdminAPI(wsId: string, token: string): Chainable<Response>; // 22
    getWsByGroupAPI(groupKey: string, token: string): Chainable<Response>; // 23
    updateWsNameAPI(name: WsData, token: string): Chainable<Response>; // 24a
    // updateWsSettingsAPI(ws: WsSettings, wsId:string, token: string): Chainable<Response>; // 24

    getModulesAPI(token: string): Chainable<Response>; // 26
    getModuleAPI(module: string, token: string): Chainable<Response>; // 27

    createUnitAPI(wsId: string, unit: UnitData, token: string): Chainable<Response>; // 30
    getUnitsAPI(token: string): Chainable<Response>; // 31
    updateWsSettingsAPI(wsId: string, settings: WsSettings, token: string): Chainable<Response>; // 32
    getWsNormalAPI(wsId: string, token: string): Chainable<Response>; // 33
    getUsersByWsAPI(wsId: string, token: string): Chainable<Response>; // 34
    getUnitMetadataAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 40
    updateUnitMetadataAPI(wsId: string, unitId: string, profile: string, entry: DefinitionUnit, token: string):
    Chainable<Response>; // 41
    getUnitsByWsAPI(wsId: string, token: string): Chainable<Response>; // 42

    renameWsAPI(wsId: string, wsName: string, token: string): Chainable<Response>; // a1
    copyToAPI(wsDestinationId:string, copyUnit: CopyUnit, token:string): Chainable<Response>; // 52
    downloadWsAPI(wsId:string, token:string): Chainable<Response>; // b1
    downloadWsAllAPI(token:string): Chainable<Response>; // b2
    getGroupsOfWsAPI(wsId: string, token:string): Chainable<Response>; // b3

    createGroupWsAPI(wsId: string, groupName:string, token:string): Chainable<Response>; // b5
    uploadUnitsAPI(wsId: string, filename:string, token:string): Chainable<Response>; // b6
    getGroupPropertiesAPI(groupId: string, token:string): Chainable<Response>; // 57
    updateGroupPropertiesAPI(groupId: string, token:string): Chainable<Response>; // 58
    updateUnitStateAPI(wsId: string, unitId: string, state: string, token:string): Chainable<Response>; // b8
    deleteStateAPI(wsId: string, state: string, token:string): Chainable<Response>; // b9
    getMetadataWsAPI(wsId: string, token:string): Chainable<Response>; // b10
    dropboxWsAPI(wsId: string, wsDe: string, token:string): Chainable<Response>; // b11
    submitUnitsAPI(wsId: string, wsDe: string, unit:string, token:string): Chainable<Response>; // b12
    returnUnitsAPI(wsDe: string, unit:string, token:string): Chainable<Response>; // b13

    postCommentAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 45
    getCommentsAPI(wsId: string, unitId: string, token:string): Chainable<Response>; // 46
    updateCommentTimeAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 47
    updateCommentAPI(wsId: string, unitId: string, commentId:string, comment: CommentData, token:string):
    Chainable<Response>; // 48
    deleteCommentAPI(wsId: string, unitId: string, commentId:string, token:string): Chainable<Response>; // 49
    moveToAPI(wsOriginId:string, wsDestinyId: string, unitId:string, token:string):Chainable<Response>; // 50
    addReviewAPI(wsId:string, reviewName: string, token:string): Chainable<Response>; // 51
    getReviewAPI(wsId:string, reviewId:string, token:string): Chainable<Response>; // 52
    updateReviewAPI(wsId:string, review: ReviewData, token:string): Chainable<Response>; // 53
    getAllReviewAPI(wsId:string, token:string): Chainable<Response>; // 54
    getReviewWindowAPI(reviewId:string, token:string): Chainable<Response>; // 55
    getReviewMetadataAPI(reviewId:string, unitId:string, token:string): Chainable<Response>; // 56
    getReviewDefinitionAPI(reviewId:string, unitId:string, token:string): Chainable<Response>; // 57
    deleteReviewAPI(wsId:string, reviewId:string, token:string): Chainable<Response> // 68
    getWsForUserAPI(wsId:string, userId:string, token:string): Chainable<Response> // 82
    deleteUnitsAPI(ids: string[], wsId: string, token: string): Chainable<Response>; // 70
    getMyData(token:string): Chainable<Response>; // 71
    updateMyData(token:string, data:MyData): Chainable<Response>; // 72

    getWsByUserAPI(id: string, token: string): Chainable<Response>; // 77
    getGroupsByUserAPI(id: string, token: string): Chainable<Response>; // 78
    deleteWsAPI(qs: string[], token: string): Chainable<Response>; // 79
    deleteGroupsAPI(qs: string[], token: string): Chainable<Response>; // 80

    deleteModulesAPI(modules: string[], token: string): Chainable<Response>; // 89
    deleteUserAPI(id:string, token: string): Chainable<Response>; // 90
    deleteUsersAPI(qs: string[], token: string): Chainable<Response>; // 90

    getSettingConfigAPI(token:string): Chainable<Response>; // 100
    updateSettingConfigAPI(token:string, hour: number): Chainable<Response>; // 101
    getSettingLogoAPI(token:string): Chainable<Response>; // 102
    updateSettingLogoAPI(token:string, color: string): Chainable<Response>; // 103
    getSettingUnitExportAPI(token:string): Chainable<Response>; // 104
    updateSettingUnitExportAPI(token:string, unitExport:UnitExport): Chainable<Response>; // 105
    getSettingMissingProfilesAPI(token:string): Chainable<Response>; // 106
    updateSettingMissingProfilesAPI(token:string, profile:string): Chainable<Response>; // 107
    getPackageAPI(token:string): Chainable<Response>; // 109
    deletePackageAPI(token:string, packageId:string): Chainable<Response>; // 110
    deleteFirstUserAPI(): Chainable<Response>; // 120
  }
}
