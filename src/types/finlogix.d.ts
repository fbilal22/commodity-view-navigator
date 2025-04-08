
interface WidgetOptions {
  widgetId: string;
  type: string;
  language: string;
  showBrand: boolean;
  isShowTradeButton: boolean;
  isShowBeneathLink: boolean;
  isShowDataFromACYInfo: boolean;
  symbolName: string;
  hasSearchBar: boolean;
  hasSymbolName: boolean;
  hasSymbolChange: boolean;
  hasButton: boolean;
  chartShape: string;
  timePeriod: string;
  isAdaptive: boolean;
  container: HTMLElement;
}

interface WidgetAPI {
  init: (options: WidgetOptions) => void;
}

declare global {
  interface Window {
    Widget: WidgetAPI;
  }
}

export {};
