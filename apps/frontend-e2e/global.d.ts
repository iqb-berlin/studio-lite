/// <reference types="cypress" />
declare namespace Cypress {
  import {
    UnitData, GroupData, WsData, AccessLevel
  } from 'support/testData';
  import { UserData } from './src/support/testData';

  interface Chainable {
    // Commands UI
    login(username: string, password: string): void;
    clickButton(text: string):void;
    buttonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    dialogButtonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    loadModule(filename: string, name: string):void;
    selectModule(name: string):void;
    visitWs(ws:string):void;
    // Commands API
    // commands-api.ts
    runAndIgnore(testFn:()=>void):void;
    getWsByGroupAPI(groupKey: string, num_ws: number): void;
    getUsersAPI(): Chainable<Response>;
    getWsByUserAPI(id:string):Chainable<Response>;

    // commands-unit-api.ts
    createUnitAPI(unitData: UnitData, idGroup: string): Chainable<Response>;
    deleteUnitAPI(idUnit:string, idGroup:string): Chainable<Response>;
    // commands-verona-api.ts
    addModuleAPI(module:string);
    getModulesAPI(token:string): Chainable<Response>
    getModuleAPI(module:string)
    // commands-api
    addFirstUserAPI(username: string, password: string): Chainable<Response>; // 1
    loginAPI(username: string, password: string):Chainable<Response>; // 2
    getUserIdAPI(token: string):Chainable<Response>; // 3
    updatePasswordAPI(token: string, oldPass: string, newPass:string):Chainable<Response>; // 4
    keycloakAPI(user:UserData):Chainable<Response>; // 5

    createUserAPI(userData:UserData, token:string):Chainable<Response>; // 6
    getUsersFullAPI(token:string): Chainable<Response>; // 7
    getUserAPI(id:string, token:string): Chainable<Response>; // 8
    getUserNoIdAPI(token:string): Chainable<Response>; // 9
    updateUserAPI(user:UserData, credentials:boolean, token:string): Chainable<Response> // 10
    deleteUserNoIdAPI(id:string, token:string): Chainable<Response> // 11

    createGroupAPI(group: GroupData, token: string):Chainable<Response>; // 12
    getGroupByIdAPI(groupId: string, token:string):Chainable<Response>// 13
    getGroupAPI(token: string):Chainable<Response>; // 14
    // updateGroupAPI(token:string):Chainable<Response>; // 15
    setAdminOfGroupAPI(userId: string, groupId: string, token:string):Chainable<Response>; // 16
    setAdminsOfGroupAPI(userIds: string[], groupId: string, token:string):Chainable<Response>; // 16
    getAdminOfGroupAPI(groupId: string, token:string):Chainable<Response>; // 16

    deleteUserAPI(id: string, token: string): Chainable<Response>; // 60
    createWsAPI(groupId: string, ws:WsData, token: string):Chainable<Response>; // 12
    moveWsAPI(ws:string, newGroup: string, token:string):Chainable<Response>; // 13
    deleteWsAPI(ws:string, group: string, token:string):Chainable<Response>; // 14

    getWsAPI(wsId: string, token: string):Chainable<Response>; // 17
    updateUsersOfWsAPI(wsId:string, level:AccessLevel, token:string):Chainable<Response>; // 18
    getUsersOfWsAPI(wsId:string, token:string):Chainable<Response>; // 19

    updateWsAPI(token:string):Chainable<Response>; // 21
    setGroupFromAdminsAPI(userIds: string[], groupId: string, token: string): Chainable<Response>

    deleteGroupAPI(id: string, token:string):Chainable<Response>; // 40
    deleteFirstUserAPI():Chainable<Response>; // 110
  }
}
