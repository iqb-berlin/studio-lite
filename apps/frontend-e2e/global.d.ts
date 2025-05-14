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
    getRegistryAPI(token: string): Chainable<Response>; // 30
    getMetadataAPI(profile: string, token: string): Chainable<Response>; // 31
    updateGroupMetadataAPI(groupId: string, token: string): Chainable<Response>; // 32
    getVocabularyMetadataAPI(profile: string, token: string): Chainable<Response>; // 33
    updateWsMetadataAPI(wsId: string, settings: WsSettings, token: string): Chainable<Response>; // 34

    // commands-api.ts
    addFirstUserAPI(username: string, password: string): Chainable<Response>; // 1
    loginAPI(username: string, password: string): Chainable<Response>; // 2
    getUserIdAPI(token: string): Chainable<Response>; // 3
    updatePasswordAPI(token: string, oldPass: string, newPass: string): Chainable<Response>; // 4
    keycloakAPI(user: UserData): Chainable<Response>; // 5
    createUserAPI(userData: UserData, token: string): Chainable<Response>; // 6
    getUsersAPI(token: string): Chainable<Response>; // 7
    getUsersFullAPI(full: boolean, token: string): Chainable<Response>; // 8
    updateUserAPI(id:string, user: UserData, credentials: boolean, token: string): Chainable<Response>; // 9
    createGroupAPI(group: GroupData, token: string): Chainable<Response>; // 10
    getGroupByIdAPI(groupId: string, token: string): Chainable<Response>; // 11
    getWsGroupsAPI(token: string): Chainable<Response>; // 12

    updateGroupAPI(groupId:string, newGroupName: string, token: string): Chainable<Response>; // 13
    setAdminsOfGroupAPI(userIds: string[], groupId: string, token: string): Chainable<Response>; // 14
    getAdminOfGroupAPI(groupId: string, token: string): Chainable<Response>; // 15
    createWsAPI(groupId: string, ws: WsData, token: string): Chainable<Response>; // 16
    moveWsAPI(ws: string, newGroup: string, token: string): Chainable<Response>; // 17
    getWsAPI(wsId: string, token: string): Chainable<Response>; // 18
    updateUsersOfWsAPI(wsId: string, level: AccessLevel, userId: string, token: string): Chainable<Response>; // 19
    updateUserListOfWsAPI(wsId: string, list: AccessUser[], token: string): Chainable<Response>; // 19a
    getUsersOfWsAPI(wsId: string, token: string): Chainable<Response>; // 20
    getWsByGroupAPI(groupKey: string, token: string): Chainable<Response>; // 21
    addModuleAPI(module:string, token:string): Chainable<Response>; // 22
    getModulesAPI(token: string): Chainable<Response>; // 23
    getModuleAPI(module: string, token: string): Chainable<Response>; // 24
    createUnitAPI(wsId: string, unit: UnitData, token: string): Chainable<Response>; // 25
    getUnitsAPI(token: string): Chainable<Response>; // 26
    updateWsSettingsAPI(wsId: string, settings: WsSettings, token: string): Chainable<Response>; // 27
    getWsNormalAPI(wsId: string, token: string): Chainable<Response>; // 28
    getUsersByWsAPI(wsId: string, token: string): Chainable<Response>; // 29
    getUnitPropertiesAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 35
    updateUnitPropertiesAPI(wsId: string, unitId: string, entry: DefinitionUnit, token: string):
    Chainable<Response>; // 36
    getUnitsByWsAPI(wsId: string, token: string): Chainable<Response>; // 37
    moveToAPI(wsOriginId:string, wsDestinyId: string, unitId:string, token:string):Chainable<Response>; // 38
    renameWsAPI(wsId: string, wsName: string, token: string): Chainable<Response>; // 39
    copyToAPI(wsDestinationId:string, copyUnit: CopyUnit, token:string): Chainable<Response>; // 40
    getGroupsOfWsAPI(wsId: string, token:string): Chainable<Response>; // 41
    updateGroupNameOfWsAPI(wsId: string, groupName:string, token:string): Chainable<Response>; // 42
    getUnitSchemeAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 43
    updateUnitDefinitionAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 44
    getUnitDefinitionAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 45
    updateUnitSchemeAPI(wsId: string, unitId: string, token: string): Chainable<Response>; // 46
    generateMetadataReportAPI(wsId: string, token:string): Chainable<Response>; // 47
    getWsSchemeAPI(wsId: string, token:string): Chainable<Response>; // 48
    getWsCodingBookAPI(units: string[], wsId: string, token:string): Chainable<Response>; // 49
    updateGroupPropertiesAPI(groupId: string, token:string): Chainable<Response>; // 58
    getGroupPropertiesAPI(groupId: string, token:string): Chainable<Response>; // 58a
    updateUnitStateAPI(wsId: string, unitId: string, state: string, token:string): Chainable<Response>; // 59
    getUnitMetadataAPI(wsId: string, unitId: string, token:string): Chainable<Response>; // 61
    dropboxWsAPI(wsId: string, wsDe: string, token:string): Chainable<Response>; // 62
    submitUnitsAPI(wsId: string, wsDe: string, unit:string, token:string): Chainable<Response>; // 63, 63b
    postCommentAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 65
    getCommentsAPI(wsId: string, unitId: string, token:string): Chainable<Response>; // 66
    updateCommentTimeAPI(wsId: string, unitId: string, comment: CommentData, token:string): Chainable<Response>; // 67
    getCommentTimeAPI(wsId: string, unitId: string, token:string): Chainable<Response>; // 67a
    updateCommentAPI(wsId: string, unitId: string, commentId:string, comment: CommentData, token:string):
    Chainable<Response>; // 68
    deleteCommentAPI(wsId: string, unitId: string, commentId:string, token:string): Chainable<Response>; // 69
    addReviewAPI(wsId:string, reviewName: string, token:string): Chainable<Response>; // 70
    getReviewAPI(wsId:string, reviewId:string, token:string): Chainable<Response>; // 71
    updateReviewAPI(wsId:string, review: ReviewData, token:string): Chainable<Response>; // 72
    getAllReviewAPI(wsId:string, token:string): Chainable<Response>; // 73
    getReviewWindowAPI(reviewId:string, token:string): Chainable<Response>; // 74
    getReviewPropertiesAPI(reviewId:string, unitId:string, token:string): Chainable<Response>; // 75
    getReviewDefinitionAPI(reviewId:string, unitId:string, token:string): Chainable<Response>; // 76
    getReviewSchemeAPI(reviewId:string, unitId:string, token:string): Chainable<Response>; // 77
    createCommentReviewAPI(reviewId:string, unitId: string, c:CommentData, token:string): Chainable<Response>; // 78
    getCommentReviewAPI(reviewId:string, unitId: string, token:string): Chainable<Response>; // 79
    // eslint-disable-next-line max-len
    updateCommentReviewAPI(reviewId:string, unitId: string, commentId:string, c:CommentData, token:string): Chainable<Response>; // 80
    deleteCommentReviewAPI(reviewId:string, unitId: string, commentId:string, token: string): Chainable<Response> // 80A
    deleteReviewAPI(wsId:string, reviewId:string, token:string): Chainable<Response> // 81
    getWsForUserAPI(wsId:string, userId:string, token:string): Chainable<Response> // 82
    getReportAPI(token: string): Chainable<Response> // 82a
    getReportAPI(groupId:string, token: string): Chainable<Response> // 82a
    downloadWsAPI(groupId: string, token: string): Chainable<Response>; // 82b
    downloadWsUnitsAPI(wsId: string, downloadQuery: string, token: string): Chainable<Response>; // 82c
    deleteUnitsAPI(ids: string[], wsId: string, token: string): Chainable<Response>; // 83
    getMyData(token:string): Chainable<Response>; // 84
    updateMyData(token:string, data:MyData): Chainable<Response>; // 85
    getWsByUserAPI(id: string, token: string): Chainable<Response>; // 86
    updateWsByUserAPI(id: string, groupId: string, wsIds: string[], token: string): Chainable<Response>; // 86a
    getGroupsByUserAPI(id: string, token: string): Chainable<Response>; // 87
    updateGroupsByUserAPI(id: string, groupIds: string[], token: string): Chainable<Response>; // 87a
    deleteWsAPI(qs: string[], token: string): Chainable<Response>; // 88
    deleteGroupsAPI(qs: string[], token: string): Chainable<Response>; // 89
    deleteModulesAPI(modules: string[], token: string): Chainable<Response>; // 90
    deleteUserAPI(id:string, token: string): Chainable<Response>; // 91
    deleteUsersAPI(qs: string[], token: string): Chainable<Response>; // 91
    deleteFirstUserAPI(): Chainable<Response>; // 110

    getSettingConfigAPI(token:string): Chainable<Response>; // 100
    updateSettingConfigAPI(token:string, hour: number): Chainable<Response>; // 101
    getSettingLogoAPI(token:string): Chainable<Response>; // 102
    updateSettingLogoAPI(token:string, color: string): Chainable<Response>; // 103
    getSettingUnitExportAPI(token:string): Chainable<Response>; // 104
    updateSettingUnitExportAPI(token:string, unitExport:UnitExport): Chainable<Response>; // 105
    getSettingMissingProfilesAPI(token:string): Chainable<Response>; // 106
    updateSettingMissingProfilesAPI(token:string, profile:string): Chainable<Response>; // 107
    addPackageAPI(resource:string, token:string): Chainable<Response>; // 108
    getPackageAPI(token:string): Chainable<Response>; // 109
    deletePackageAPI(token:string, packageId:string): Chainable<Response>; // 110

    uploadUnitsAPI(wsId: string, filename:string, token:string): Chainable<Response>; // b6 not used
  }
}
