export interface WidgetCallData {
  callId?: string;
  widgetType: string;
  parameters?: Record<string, string>;
  state?: string;
  sharedParameters?: Record<string, string>;
}
