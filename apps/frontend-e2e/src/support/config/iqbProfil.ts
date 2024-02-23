// eslint-disable-next-line @typescript-eslint/naming-convention
export enum iqbProfil {
  MA = 'Mathematik Primar',
  DE = 'Deutsch Primar',
  EN = 'Englisch Sek I',
  FR = 'Französisch Sek I'
}
// export const iqbProfilExamples = new Map <string, Map<string, string>>([
//   ['uMA', Map<>(['Entwickler:in','Elsa Mignon'],['Leitidee','Größen und Messen'],['Aufgabenzeit','1:30'],['Stimuluszeit','1:00'],['Quellenangaben','Es war einmal Mathe']]),
//   ['uDE', Map<>([['Entwickler:in','Elsa Magna'],['Kompetenzbereich','Schreiben'],['Aufgabenzeit','2:30'],['Quellenangaben','Es war einmal Deutsch'],['Textsorte','expositorisch'],['Wortanzahl','100'],['Stimuluszeit','2:00'],['Hörsequenz Transkript','Die Gesichte vom...']])],
//   ['uEN', Map<>([['Textniveau (GeR)','A1'],['Lexiko-Grammatik','einzelne komplexe Elemente'],['Abstraktionsgrad','einzelne abstrakte Elemente'],['Thematischer Vertrautheitsgrad','weitestgehend vertraut'],['Textsorte','Bookstagram'],['Andere Textsorte','Homy'],['Thema','Berufsorientierung'],['Anderes Thema','Homyy'],['Läange des verwendeten Audioauszugs','3:30'],['Wortanzahl','150'],['Aufgabenzeit','4:00'],['Vermerk / Zitation','DOIEnglisch'],['Transkript Original','Englisch Transkript Original'],['Anzahl der Sprecher*innen','5'],['Sprechtempo','schnell'],['Variante','Walisisch'],['Nebengeäausche','auch erschwerend'],['Transkript zur Aufgabe','Englisch transkript']])],
//   ['uFR', Map<>([['Textniveau (GeR)','B1'],['Lexiko-Grammatik','durchgängig komplex'],['Abstraktionsgrad','nicht vertraut'],['Thematischer Vertrautheitsgrad','durchgängig abstrakt'],['Textsorte','Plakat'],['Andere Textsorte','Homy'],['Thema','Berufsorientierung'],['Anderes Thema','Homyy'],['Läange des verwendeten Audioauszugs','3:30'],['Wortanzahl','150'],['Aufgabenzeit','4:00'],['Vermerk / Zitation','DOIEnglisch'],['Transkript Original','Englisch Transkript Original'],['Anzahl der Sprecher*innen','5'],['Sprechtempo','schnell'],['Variante','Walisisch'],['Nebengeäausche','auch erschwerend'],['Transkript zur Aufgabe','Englisch transkript']])],
//   ['iMA', []],
//   ['iDE', []],
//   ['iEN', []],
//   ['iFR', []]
// ]);

export const registryProfile = new Map<string, string>([
  ['uMA', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/unit.json'],
  ['uDE', 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/unit.json'],
  ['uEN', 'https://raw.githubusercontent.com/iqb-vocabs/p52/master/unit.json'],
  ['uFR', 'https://raw.githubusercontent.com/iqb-vocabs/p53/master/unit.json'],
  ['iMA', 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json'],
  ['iDE', 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/item.json'],
  ['iEN', 'https://raw.githubusercontent.com/iqb-vocabs/p52/master/item.json'],
  ['iFR', 'https://raw.githubusercontent.com/iqb-vocabs/p53/master/item.json']
]);
