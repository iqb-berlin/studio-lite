export enum IqbProfil {
  MA = 'Mathematik Primar',
  DE = 'Deutsch Primar',
  EN = 'Englisch Sek I',
  FR = 'Französisch Sek I'
}
export const IqbProfilExamples = new Map <string, any>([
  ['uMA', new Map<string, string>([['Entwickler:in', 'Elsa Mignon'], ['Leitidee', 'Größen und Messen'], ['Aufgabenzeit', '1:30'], ['Stimuluszeit', '1:00'], ['Quellenangaben', 'Es war einmal Mathe']])],
  ['uDE', new Map<string, string>([['Entwickler:in', 'Elsa Magna'], ['Kompetenzbereich', 'Schreiben'], ['Aufgabenzeit', '2:30'], ['Quellenangaben', 'Es war einmal Deutsch'], ['Textsorte', 'expositorisch'], ['Wortanzahl', '100'], ['Stimuluszeit', '2:00'], ['Hörsequenz Transkript', 'Die Gesichte vom...']])],
  ['uEN', new Map<string, string>([['Textniveau (GeR)', 'A1'], ['Lexiko-Grammatik', 'einzelne komplexe Elemente'], ['Abstraktionsgrad', 'einzelne abstrakte Elemente'], ['Thematischer Vertrautheitsgrad', 'weitestgehend vertraut'], ['Textsorte', 'Bookstagram'], ['Andere Textsorte', 'Homy'], ['Thema', 'Berufsorientierung'], ['Anderes Thema', 'Homyy'], ['Länge des verwendeten Audioauszugs', '3:30'], ['Wortanzahl', '150'], ['Aufgabenzeit', '4:00'], ['Vermerk / Zitation', 'DOIEnglisch'], ['Transkript Original', 'Englisch Transkript Original'], ['Anzahl der Sprecher*innen', '5'], ['Sprechtempo', 'schnell'], ['Variante', 'Walisisch'], ['Nebengeäausche', 'auch erschwerend'], ['Transkript zur Aufgabe', 'Englisch transkript']])],
  ['uFR', new Map<string, string>([['Textniveau (GeR)', 'B1'], ['Lexiko-Grammatik', 'durchgängig komplex'], ['Abstraktionsgrad', 'durchgängig abstrakt'], ['Thematischer Vertrautheitsgrad', 'nicht vertraut'], ['Textsorte', 'Plakat'], ['Andere Textsorte', 'HomyII'], ['Thema', 'Tägliches Leben'], ['Anderes Thema', 'HomyyII'], ['Länge des verwendeten Audioauszugs', '5:30'], ['Wortanzahl', '200'], ['Aufgabenzeit', '6:00'], ['Vermerk / Zitation', 'DOIEnglisch'], ['Transkript Original', 'Französisch Transkript Original'], ['Anzahl der Sprecher*innen', '3'], ['Sprechtempo', 'normal'], ['Variante', 'Kreolisch'], ['Nebengeäausche', 'keine'], ['Transkript zur Aufgabe', 'Französich transkript']])],
//  ['iMA', new Map<string, string>([['Item ID', '01'],['Wichtung', '1'],['Notiz', 'etwas Mathe'], ['Itemformat', 'Zuordnen'], ['Anforderungsbereich', '2'], ['Inhaltsbezogener Bildungsstandard primär', '5'], ['Inhaltsbezogener Bildungsstandard sekundär', '5'], ['Prozessbezogener Bildungsstandard primär', '5'], ['Prozessbezogener Bildungsstandard sekundär', '5'], ['Itemzeit', '1:00'], ['Geschätzte Schwierigkeit', 'hoch']])],
  ['iMA', new Map<string, string>([['Item ID', '01'],['Wichtung', '1'],['Notiz', 'etwas Mathe'], ['Itemformat', 'Zuordnen'], ['Anforderungsbereich', '2'],['Itemzeit', '1:00'], ['Geschätzte Schwierigkeit', 'hoch']])],
//  ['iDE', new Map<string, string>([['Item ID', '01'], ['Notiz', 'etwas Deutsch'], ['Itemformat', 'Markieren'], ['Anforderungsbereich', '1'], ['Bildungsstandard primär', '1.1'], ['Bildungsstandards sekundär', '2.2.3, 2.2.4'], ['Itemzeit', '2:00'], ['Geschätzte Schwierigkeit', 'mittel']])],
  ['iDE', new Map<string, string>([['Item ID', '02'],['Wichtung', '1'], ['Notiz', 'etwas Deutsch'], ['Itemformat', 'Markieren'], ['Anforderungsbereich', '1'], ['Itemzeit', '2:00'], ['Geschätzte Schwierigkeit', 'mittel']])],
  ['iEN', new Map<string, string>([['Item ID', '01'],['Wichtung', '1'], ['Notiz', 'etwas Englisch'], ['Lese-/Hörstil', 'selektiv'], ['Geschätzte GeR Niveaustufe (a priori)', 'B2'], ['Empirisch ermittelte GeR Niveaustufe', 'B1.1'], ['Itemformat', 'Table Completion(TC)'], ['Bildungsstandards ESA', 'konkrete, voraussagbare Informationen in einfachen Gebrauchsstexten auffinden und verstehen.'], ['Bildungsstandards MSA', 'strukturell unkomplizierte Korrespondenz zu vertrauten Themen einschließlich der verwendeten Umgangsformen verstehen.'], ['Itemzeit', '1:00']])],
  ['iFR', new Map<string, string>([['Item ID', '01'],['Wichtung', '1'], ['Notiz', 'etwas Französisch'], ['Lese-/Hörstil', 'global'], ['Geschätzte GeR Niveaustufe (a priori)', 'C1'], ['Empirisch ermittelte GeR Niveaustufe', 'C2.2'], ['Itemformat', 'Kurzantwortaufgabe'], ['Bildungsstandards ESA', 'konkrete, voraussagbare Informationen in einfachen Gebrauchsstexten auffinden und verstehen.'], ['Bildungsstandards MSA', 'strukturell unkomplizierte Korrespondenz zu vertrauten Themen einschließlich der verwendeten Umgangsformen verstehen.'], ['Itemzeit', '2:00']])]
]);

export const RegistryProfile = new Map<string, string>([
  ['uMA', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json'],
  ['uDE', 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/unit.json'],
  ['uEN', 'https://raw.githubusercontent.com/iqb-vocabs/p52/master/unit.json'],
  ['uFR', 'https://raw.githubusercontent.com/iqb-vocabs/p53/master/unit.json'],
  ['iMA', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json'],
  ['iDE', 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/item.json'],
  ['iEN', 'https://raw.githubusercontent.com/iqb-vocabs/p52/master/item.json'],
  ['iFR', 'https://raw.githubusercontent.com/iqb-vocabs/p53/master/item.json']
]);
