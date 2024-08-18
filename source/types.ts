export enum ApplyOn {
  REQUEST = 'request',
  RESPONSE = 'response',
}

export interface FilterRule {
  enabled: boolean;
  filter: string;
  operation: chrome.declarativeNetRequest.HeaderOperation;
  field: string;
  value: string;
  priority: number;
  applyOn: ApplyOn;
}

export interface Options {
  format: number;
  enabled: boolean;
  rules: FilterRule[];
}

export interface RuleError {
  filter?: string;
  operation?: string;
  field?: string;
  value?: string;
  priority?: string;
  applyOn?: string;
}
