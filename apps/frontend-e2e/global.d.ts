/// <reference types="cypress" />

declare namespace Cypress {
  import { UnitData } from 'support/testData';

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
    loginAPI(username: string, password: string): void;
    getUsersAPI(): Chainable<Response>;
    getUsersFullAPI(): Chainable<Response>;
    getUserAPI(id:string): Chainable<Response>;
    getWsByUserAPI(id:string):Chainable<Response>;
    // commands-unit-api.ts
    createUnitAPI(unitData: UnitData, idGroup: string): Chainable<Response>;
    deleteUnitAPI(idUnit:string, idGroup:string): Chainable<Response>;
    // commands-verona-api.ts
    addModuleAPI(module:string);
    getModulesAPI(token:string): Chainable<Response>
    getModuleAPI(module:string)
  }
}