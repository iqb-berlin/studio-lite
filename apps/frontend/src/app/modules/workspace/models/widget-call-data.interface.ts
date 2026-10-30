/** A parameter of a widget call: the player and the widget API write them as a list of these (#2047). */
export interface WidgetParameter {
  key: string;
  value?: string;
}

export interface WidgetCallData {
  callId?: string;
  widgetType: string;
  parameters?: WidgetParameter[];
  state?: string;
  sharedParameters?: WidgetParameter[];
}
