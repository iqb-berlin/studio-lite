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
    // commands-admin-api.ts
    createWsAPI(groupKey: string, ws1:WsData, token: string):Chainable<Response>;
    updateUsersOfWsAPI(wsKey:string, level:AccessLevel, token:string):Chainable<Response>;
    // commands-unit-api.ts
    createUnitAPI(unitData: UnitData, idGroup: string): Chainable<Response>;
    deleteUnitAPI(idUnit:string, idGroup:string): Chainable<Response>;
    // commands-verona-api.ts
    addModuleAPI(module:string);
    getModulesAPI(token:string): Chainable<Response>
    getModuleAPI(module:string)
    // commands-api
    addFirstUserAPI():Chainable<Response>; // 1
    loginAPI(username: string, password: string):Chainable<Response>; // 2
    getUserIdAPI(username: string, token: string):Chainable<Response>; // 3
    updatePasswordAPI(token: string, oldPass: string, newPass:string):Chainable<Response>; // 4
    deleteUserAPI(id: string):Chainable<Response>; // 6
    createUserAPI(userData:UserData):Chainable<Response>; // 7
    getUsersFullAPI(): Chainable<Response>; // 8
    getUserAPI(id:string): Chainable<Response>; // 9
    createGroupAPI(group: GroupData, token: string):Chainable<Response>; // 10
    setAdminOfGroupAPI(userId: string, groupId: string, token:string):Chainable<Response>; // 11
    createWsAPI(groupId: string, ws:WsData, token: string):Chainable<Response>; // 12
    deleteGroupAPI(id: string, token:string):Chainable<Response>; // 40
    deleteFirstUserAPI():Chainable<Response>; // 110
  }
}
