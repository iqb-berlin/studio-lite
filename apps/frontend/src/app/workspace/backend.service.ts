import { catchError, map } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import {UnitInListDto, WorkspaceFullDto} from "@studio-lite-lib/api-dto";
import {AppHttpError} from "../app.classes";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUnitList(workspaceId: number): Observable <UnitInListDto[]> {
    return this.http
      .get<UnitInListDto[]>(`${this.serverUrl}workspace/${workspaceId}/units`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getWorkspaceData(workspaceId: number): Observable<WorkspaceFullDto> {
    return this.http
      .get<WorkspaceFullDto>(
      `${this.serverUrl}workspace/${workspaceId}`
    )
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addUnit(workspaceId: number, key: string, label: string, editor: string, player: string): Observable<number> {
    return this.http
      .put<string>(`${this.serverUrl}addUnit.php`,
      {
        t: localStorage.getItem('t'), ws: workspaceId, k: key, l: label, e: editor, p: player
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map(returnId => Number(returnId))
      );
  }

  copyUnit(workspaceId: number,
           fromUnit: number, key: string, label: string): Observable<number> {
    return this.http
      .put<string>(`${this.serverUrl}addUnit.php`,
      {
        t: localStorage.getItem('t'), ws: workspaceId, u: fromUnit, k: key, l: label
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map(returnId => Number(returnId))
      );
  }

  deleteUnits(workspaceId: number, units: number[]): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}deleteUnits.php`, { t: localStorage.getItem('t'), ws: workspaceId, u: units })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  moveUnits(workspaceId: number,
            units: number[], targetWorkspace: number): Observable<boolean | number> {
    const authToken = localStorage.getItem('t');
    if (!authToken) {
      return of(401);
    }
    return this.http
      .put<UnitInListDto[]>(`${this.serverUrl}moveUnits.php`,
      {
        t: authToken, ws: workspaceId, u: units, tws: targetWorkspace
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map((unMovableUnits: UnitInListDto[]) => {
          if (unMovableUnits.length === 0) return true;
          return unMovableUnits.length;
        })
      );
  }

  downloadUnits(workspaceId: number, unitData: ExportUnitSelectionData): Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        options: JSON.stringify({ t: localStorage.getItem('t'), ws: workspaceId, u: unitData })
      })
    };
    return this.http.get<Blob>(`${this.serverUrl}downloadUnits.php`, httpOptions);
  }

  getUnitMetadata(workspaceId: number, unitId: number): Observable<UnitMetadata> {
    return this.http
      .put<UnitMetadata>(`${this.serverUrl}getUnitMetadata.php`,
      { t: localStorage.getItem('t'), ws: workspaceId, u: unitId })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getUnitDefinition(workspaceId: number, unitId: number): Observable<string> {
    return this.http
      .put<string>(`${this.serverUrl}getUnitDefinition.php`,
      { t: localStorage.getItem('t'), ws: workspaceId, u: unitId })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setUnitMetadata(workspaceId: number, unitData: UnitMetadata): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setUnitMetadata.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      u: unitData.id,
      k: unitData.key,
      l: unitData.label,
      d: unitData.description,
      e: unitData.editorid,
      p: unitData.playerid,
      dt: unitData.playerid
    })
      .pipe(
        catchError(() => of(false))
      );
  }

  startUnitUploadProcessing(workspaceId: number, processId: string): Observable<ImportUnitSelectionData[]> {
    return this.http
      .post<ImportUnitSelectionData[]>(`${this.serverUrl}startUnitUploadProcessing.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      p: processId
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setUnitDefinition(workspaceId: number,
                    unitId: number, unitDef: string): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setUnitDefinition.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      u: unitId,
      ud: unitDef
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getModuleHtml(moduleId: string): Observable<string> {
    return this.http
      .post<string>(`${this.serverUrl}getModuleHtml.php`,
      { m: moduleId })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setWorkspaceSettings(workspaceId: number, settings: WorkspaceSettings): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setWorkspaceSettings.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      s: settings
    })
      .pipe(
        catchError(() => of(false))
      );
  }
}

export interface UnitMetadata {
  id: number;
  key: string;
  label: string;
  description: string;
  lastchanged: number;
  editorid: string;
  playerid: string;
}

export interface ModulData {
  label: string;
  html: string;
}

export interface WorkspaceData {
  id: number;
  label: string;
  group: string;
  settings: WorkspaceSettings;
  players: {
    [key: string]: ModulData;
  };
  editors: {
    [key: string]: ModulData;
  };
}

export interface ModuleDataForExport {
  id : string;
  content : string
}

export interface ExportUnitSelectionData {
  selected_units: number[];
  add_players: string[];
  add_xml: ModuleDataForExport[];
}

export interface ImportUnitSelectionData {
  filename: string;
  success: boolean;
  message: string;
}

export interface WorkspaceSettings {
  defaultPlayer: string;
  defaultEditor: string
}
