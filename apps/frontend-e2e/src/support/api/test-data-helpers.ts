/**
 * Test data helper functions for API tests
 * Contains functions for manipulating test data and fixtures
 */

/**
 * Deletes a text field from a unit definition
 * Used in API tests to modify unit definitions
 * @param wsId - Workspace ID
 * @param unitId - Unit ID
 * @example
 * deleteTextField('ws_123', 'unit_456');
 */
export function deleteTextField(wsId: string, unitId: string): void {
  const authorization = `bearer ${Cypress.expose(`token_${Cypress.expose('username')}`)}`;
  cy.request({
    method: 'PATCH',
    url: `/api/workspaces/${wsId}/units/${unitId}/definition`,
    headers: {
      'app-version': Cypress.expose('version'),
      authorization
    },
    body: {
      definition: {
        type: 'aspect-unit-definition',
        stateVariables: [],
        enableSectionNumbering: true,
        sectionNumberingPosition: 'left',
        showUnitNavNext: false,
        version: '4.9.0',
        pages: [
          {
            sections: [
              {
                elements: [
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text_1747821745751_1',
                    alias: 'text_1',
                    dimensions: {
                      width: 180,
                      height: 98,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 1,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 10,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    type: 'text',
                    text: '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" ' +
                                            'indentsize="20">Wie viel ist 4 plus 2?</p>',
                    markingMode: 'selection',
                    markingPanels: [],
                    highlightableOrange: false,
                    highlightableTurquoise: false,
                    highlightableYellow: false,
                    hasSelectionPopup: false,
                    columnCount: 1
                  }
                ],
                height: 400,
                backgroundColor: '#ffffff',
                dynamicPositioning: true,
                autoColumnSize: true,
                autoRowSize: true,
                gridColumnSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                gridRowSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                visibilityDelay: 0,
                animatedVisibility: false,
                enableReHide: false,
                logicalConnectiveOfRules: 'disjunction',
                visibilityRules: [],
                ignoreNumbering: false
              },
              {
                elements: [
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text_1747821895924_1',
                    alias: 'text_3',
                    dimensions: {
                      width: 180,
                      height: 98,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 1,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 10,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    type: 'text',
                    text: '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" ' +
                                            'indentsize="20">Wie viele Monde hat die Erde?</p>',
                    markingMode: 'selection',
                    markingPanels: [],
                    highlightableOrange: false,
                    highlightableTurquoise: false,
                    highlightableYellow: false,
                    hasSelectionPopup: false,
                    columnCount: 1
                  },
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'radio_1747822216816_1',
                    alias: 'radio_1',
                    dimensions: {
                      width: 180,
                      height: 100,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 2,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 0,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    label: '',
                    value: null,
                    required: false,
                    requiredWarnMessage: 'Eingabe erforderlich',
                    readOnly: false,
                    type: 'radio',
                    options: [
                      {
                        text: '1 Mond'
                      },
                      {
                        text: '2 Monde'
                      }
                    ],
                    alignment: 'column',
                    strikeOtherOptions: false
                  }
                ],
                height: 400,
                backgroundColor: '#ffffff',
                dynamicPositioning: true,
                autoColumnSize: true,
                autoRowSize: true,
                gridColumnSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                gridRowSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                visibilityDelay: 0,
                animatedVisibility: false,
                enableReHide: false,
                logicalConnectiveOfRules: 'disjunction',
                visibilityRules: [],
                ignoreNumbering: false
              },
              {
                elements: [
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'text_1747988306580_1',
                    alias: 'text_2',
                    dimensions: {
                      width: 180,
                      height: 98,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: null,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 1,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 10,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: 'transparent',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      lineHeight: 135
                    },
                    type: 'text',
                    text: '<p style="padding-left: 0px; text-indent: 0px; margin-bottom: 0px; margin-top: 0" ' +
                                            'indentsize="20">Sortieren sie die Farben alphabetisch ein.</p>',
                    markingMode: 'selection',
                    markingPanels: [],
                    highlightableOrange: false,
                    highlightableTurquoise: false,
                    highlightableYellow: false,
                    hasSelectionPopup: false,
                    columnCount: 1
                  },
                  {
                    isRelevantForPresentationComplete: true,
                    id: 'drop-list_1747988350920_1',
                    alias: 'drop-list_1',
                    dimensions: {
                      width: 180,
                      height: 100,
                      isWidthFixed: false,
                      isHeightFixed: false,
                      minWidth: null,
                      maxWidth: null,
                      minHeight: 57,
                      maxHeight: null
                    },
                    position: {
                      xPosition: 0,
                      yPosition: 0,
                      gridColumn: 1,
                      gridColumnRange: 1,
                      gridRow: 2,
                      gridRowRange: 1,
                      marginLeft: {
                        value: 0,
                        unit: 'px'
                      },
                      marginRight: {
                        value: 0,
                        unit: 'px'
                      },
                      marginTop: {
                        value: 0,
                        unit: 'px'
                      },
                      marginBottom: {
                        value: 0,
                        unit: 'px'
                      },
                      zIndex: 0
                    },
                    styling: {
                      backgroundColor: '#ededed',
                      fontColor: '#000000',
                      font: 'NunitoSans',
                      fontSize: 20,
                      bold: false,
                      italic: false,
                      underline: false,
                      itemBackgroundColor: '#c9e0e0'
                    },
                    value: [
                      {
                        text: 'Rot',
                        imgSrc: null,
                        imgFileName: '',
                        imgPosition: 'above',
                        id: 'value_1747988363586_1',
                        alias: 'value_1',
                        originListID: 'drop-list_1747988350920_1',
                        originListIndex: 0,
                        audioSrc: null,
                        audioFileName: ''
                      },
                      {
                        text: 'Gelb',
                        imgSrc: null,
                        imgFileName: '',
                        imgPosition: 'above',
                        id: 'value_1747988368877_1',
                        alias: 'value_2',
                        originListID: 'drop-list_1747988350920_1',
                        originListIndex: 1,
                        audioSrc: null,
                        audioFileName: ''
                      },
                      {
                        text: 'Blau',
                        imgSrc: null,
                        imgFileName: '',
                        imgPosition: 'above',
                        id: 'value_1747988374153_1',
                        alias: 'value_3',
                        originListID: 'drop-list_1747988350920_1',
                        originListIndex: 2,
                        audioSrc: null,
                        audioFileName: ''
                      }
                    ],
                    required: false,
                    requiredWarnMessage: 'Eingabe erforderlich',
                    readOnly: false,
                    type: 'drop-list',
                    isSortList: true,
                    onlyOneItem: false,
                    connectedTo: [],
                    copyOnDrop: false,
                    allowReplacement: false,
                    permanentPlaceholders: false,
                    permanentPlaceholdersCC: true,
                    orientation: 'vertical',
                    showNumbering: false,
                    startNumberingAtZero: false,
                    highlightReceivingDropList: false,
                    highlightReceivingDropListColor: '#006064'
                  }
                ],
                height: 400,
                backgroundColor: '#ffffff',
                dynamicPositioning: true,
                autoColumnSize: true,
                autoRowSize: true,
                gridColumnSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                gridRowSizes: [
                  {
                    value: 1,
                    unit: 'fr'
                  }
                ],
                visibilityDelay: 0,
                animatedVisibility: false,
                enableReHide: false,
                logicalConnectiveOfRules: 'disjunction',
                visibilityRules: [],
                ignoreNumbering: false
              }
            ],
            hasMaxWidth: true,
            maxWidth: 750,
            margin: 30,
            backgroundColor: '#ffffff',
            alwaysVisible: false,
            alwaysVisiblePagePosition: 'left',
            alwaysVisibleAspectRatio: 50
          }
        ]
      },
      variables: [
        {
          alias: 'text_1',
          format: '',
          id: 'text_1747821745751_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'no-value',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'text_3',
          format: '',
          id: 'text_1747821895924_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'no-value',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'radio_1',
          format: '',
          id: 'radio_1747822216816_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'integer',
          valuePositionLabels: [],
          values: [
            {
              label: '1 Mond',
              value: '1'
            },
            {
              label: '2 Monde',
              value: '2'
            }
          ],
          valuesComplete: true
        },
        {
          alias: 'text_2',
          format: '',
          id: 'text_1747988306580_1',
          multiple: false,
          nullable: false,
          page: '',
          type: 'no-value',
          valuePositionLabels: [],
          values: [],
          valuesComplete: false
        },
        {
          alias: 'drop-list_1',
          format: '',
          id: 'drop-list_1747988350920_1',
          multiple: true,
          nullable: false,
          page: '',
          type: 'string',
          valuePositionLabels: [],
          values: [
            {
              label: 'Rot',
              value: 'value_1'
            },
            {
              label: 'Gelb',
              value: 'value_2'
            },
            {
              label: 'Blau',
              value: 'value_3'
            }
          ],
          valuesComplete: true
        }
      ]
    }
  });
}
