/// <reference types="cypress" />

declare namespace Cypress {
  import { UnitData } from 'support/testData';

  interface Chainable {
    login(username: string, password: string): void;
    clickButton(text: string):void;
    buttonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    dialogButtonToContinue(text: string, code: number, url: string, rest: string, alias: string):void;
    loadModule(filename: string, name: string):void;
    selectModule(name: string):void;
    visitWs(ws:string):void;

    createUnitAPI(unitData: UnitData, id: string): Chainable<Response>;
  }
}
