export const HeaderOperation = {
  SET: 'set',
  APPEND: 'append',
  REMOVE: 'remove',
} as const;

export type HeaderOperationValue =
  (typeof HeaderOperation)[keyof typeof HeaderOperation];

export const ACTION_TYPE_MODIFY_HEADERS = 'modifyHeaders';

export enum ApplyOn {
  REQUEST = 'request',
  RESPONSE = 'response',
}

export interface FilterRule {
  enabled: boolean;
  actionType: typeof ACTION_TYPE_MODIFY_HEADERS;
  filter: string;
  operation: HeaderOperationValue;
  field: string;
  value: string;
  priority: number;
  applyOn: ApplyOn[];
  resourceTypes: string[];
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
  resourceTypes?: string;
}
