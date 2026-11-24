# Translating the interface

The interface texts live in `apps/frontend/src/assets/i18n/`, one file per language. `de.json` is the
source; every other file is translated from it and has exactly its keys.

## Rules for every change

- **A new text goes into every language file.** `translation-files.spec.ts` compares each file with
  `de.json` and fails on a missing or extra key, on differing `{{…}}` placeholders and on differing
  spaces at the start or end of a text. The failure names the keys.
- **Whole sentences, no fragments.** A text is translated as a whole. Do not put a translated word into
  another text through a placeholder: the word order differs between languages (#2178).
- **Placeholders and edge spaces stay as they are.** `{{count}}` keeps its name; a text that starts or ends
  with a space keeps it, because the template puts another text next to it.
- **Language names are not translated.** The language menu lists each language in its own language
  (`UI_LANGUAGES` in `libs/shared-code`).

## Adding a language

1. `apps/frontend/src/assets/i18n/<code>.json`, translated from `de.json`.
2. An entry in `UI_LANGUAGES` (`libs/shared-code/src/lib/ui-languages.ts`): code, own name, locale and date formats.
3. The locale data in `UI_LOCALE_DATA` (`apps/frontend/src/app/services/ui-locale-data.ts`): date-fns and Angular.
4. A column for the language in the glossary below.

The language menu appears once there are two languages; a language is offered only when its file is complete.

The texts an administrator writes -- title, start page, imprint, the warning on the start page and the mail to new
users -- get a tab for the new language in the administration's settings by themselves. Until someone fills it in,
the interface in the new language shows the German texts (#2186).

## Glossary

Binding terms. They follow the names in the code and in the English Verona specifications (plugin-editor,
plugin-player), not the dictionary. Where the German interface uses two words for one thing, both are listed
and map to one English term.

### Content and structure

| German | English | Code / source | Note |
|---|---|---|---|
| Aufgabe, Unit | unit | `unit`, Verona specs | Never "task" or "item". The German UI says "Unit" in technical texts. |
| Item | item | `unit-item` | |
| Variable | variable | `@iqb/responses` | |
| Basisvariable | base variable | `sourceType: BASE` | |
| abgeleitete Variable | derived variable | `sourceType` other than `BASE` | |
| Kurzname | key | `unit.key` | Not "short name". |
| Aufgabengruppe | unit group | `manage-unit-group` | |
| Arbeitsbereich | workspace | `workspace` | |
| Bereichsgruppe | workspace group | `workspace-group` | |
| Definition | definition | `unit-definition`, Verona "unit definition" | |
| Eigenschaften | properties | route `properties` | |
| Vorschau | preview | route `preview` | |
| Technische Prüfung | technical check | `unit-check` | The card under Eigenschaften (#2135). |
| Status (of a unit) | status | `state` | Users read "status"; "state" stays in code. |
| Paket | resource package | `resource-package` | The German UI says just "Paket". |
| Paketname | package name | `packageName` | The name units give for a package; several packages may stand in for one (#1358). |
| Begleitmaterial | supplementary material | `rich-note` | Not "notes": that word is for Notiz. |
| Kategorie (of Begleitmaterial) | category | `tag` | |
| Notiz, Beschreibung | note, description | | |

### Verona modules

| German | English | Code / source | Note |
|---|---|---|---|
| Editor, Player, Schemer | editor, player, schemer | Verona | Lower case in running text. |
| Verona-Module | Verona modules | | |
| Widget | widget | | |
| Kennung (of a module) | ID | | |

### Review and comments

| German | English | Code / source | Note |
|---|---|---|---|
| Aufgabenfolge, Review | review | `review` | "Review einer Aufgabenfolge" becomes just "Review". |
| Testheft | booklet | testcenter, Verona player spec | |
| Block | block | testcenter | |
| Testgruppe | group | testcenter testtakers file | |
| Beobachter | monitor | testcenter group monitor | |
| Kommentar, kommentieren | comment | `unit-comment` | |
| Votum, Voten | vote, votes | `unit-comment-vote` | |
| Zustimmung, Ablehnung | upvote, downvote | | "Daumen hoch/runter" becomes "thumbs up/down". |
| kontrovers | controversial | | |
| Sichtbarkeit | visibility | | |

### Drop box

| German | English | Code / source | Note |
|---|---|---|---|
| Abgabebereich | drop box | `drop-box` | |
| abgeben | submit | `unit-submit` | |
| zurückgeben | return | `unit-return` | |
| abgegebene Aufgabe | submitted unit | | |

### Coding

| German | English | Code / source | Note |
|---|---|---|---|
| Kodierung, kodieren | coding, code | | |
| Kodierschema | coding scheme | Verona editor spec, `CodingScheme` | |
| Code, Code-Label | code, code label | | |
| Bewertung, Score, Punktwert | score | | |
| Kodierergebnis | coding result | | |
| Regel, Regelsatz | rule, rule set | `ruleSet` | |
| Kodieranweisung, Instruktionen für manuelles Kodieren | coding instructions, instructions for manual coding | `manualInstruction` | |
| manuell kodiert | manually coded | | |
| geschlossen kodiert | closed-coded | | |
| residuelle Kodierung | residual coding | `RESIDUAL_AUTO` | |
| Kodiertyp | coding type | | |
| Schulungsaufwand (erhöht, normal) | coder training effort (increased, normal) | `CODER_TRAINING_REQUIRED` | |
| Codebook | codebook | `CodebookGenerator` | |
| Kodierbericht | coding report | `coding-report` | |
| Missings-Profil | missings profile | | IQB term, kept. |
| Rohdaten | raw responses | `raw-responses` | |
| Unterformular | subform | `subform` | |

### Metadata

| German | English | Code / source | Note |
|---|---|---|---|
| Metadaten | metadata | | |
| Metadatenprofil | metadata profile | `metadata-profile` | |
| Profilregistrierung | profile registry | `metadata-profile-registry` | |
| Vokabular | vocabulary | `metadata-vocabulary` | |

### Users and access

| German | English | Code / source | Note |
|---|---|---|---|
| Nutzer:in, Nutzer:innen | user, users | | English needs no gendered form. |
| Bearbeiter:in | changed by | | Not "editor": that word is taken by the Verona module. |
| Zugriffsrechte | access rights | | |
| Gast, Kommentierer:in, Entwickler:in, Betreuer:in, Admin | guest, commenter, developer, maintainer, admin | Verona editor roles `GUEST` … `SUPER` | |
| schreibgeschützt | read-only | | |
| Systemverwaltung, System-Administrator:in | administration, system administrator | | |
| Admin der Bereichsgruppe | workspace group admin | | |
| Kennwort | password | | |
| Login-Name, anmelden, abmelden | login name, log in, log out | | Noun: "login". |
| Session (aktiv, passiv, verwaist) | session (active, passive, orphaned) | `user-session` | |

### Progress indicators

| German | English | Code / source | Note |
|---|---|---|---|
| Vollständigkeit der Präsentation (P) | presentation progress (P) | Verona `presentationProgress` | The letters stay the same. |
| Vollständigkeit der verpflichtenden Antworten (R) | response progress (R) | Verona `responseProgress` | |
| Player-Fokus (F) | player focus (F) | | |

### Application

| German | English | Note |
|---|---|---|
| Startseite | home page | |
| Impressum | legal notice | |
| Druckansicht | print view | |
| Bericht | report | |
| Export, Import, Herunterladen | export, import, download | |

## Style rules (English)

1. British spelling (behaviour, colour). The testcenter keys already use `browserBehaviour`, and the context is European.
2. Sentence case for buttons, titles and menu items: "Delete unit", not "Delete Unit".
3. Address the user as "you". Buttons use the imperative.
4. "Soll X gelöscht werden?" becomes "Delete X?". "Konnte X nicht Y" becomes "Could not Y X", "X gelöscht" becomes "X deleted"; a full stop only where the German text has one.
5. Exclamation marks of the German texts become full stops; English interfaces hardly use them.
6. Picking something from a list, table or menu is "select", not "choose". Dialogue titles are imperatives ("Delete files", not "Deleting files").
7. Plural brackets "(n)", "/e" and "(e)" become "(s)". Where a `{{count}}` exists, plural forms come later (needed for Italian anyway).
8. Placeholders `{{…}}` stay as they are. Quotation marks are "…".
9. Technical values from Verona and the testcenter (OFF, HIDDEN, LAZY, BOOKLET_LABEL) stay as they are.
