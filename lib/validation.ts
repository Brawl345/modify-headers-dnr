import { validAppliesOn, validResourceTypes } from './dnr';
import { t } from './i18n';
import { type FilterRule, HeaderOperation, type RuleError } from './types';

const isBlank = (str: string): boolean => !str.trim();

const isValidRegex = (pattern: string): boolean => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

const validOperations = new Set<string>(Object.values(HeaderOperation));

export const validateRule = (rule: FilterRule): RuleError => {
  const error: RuleError = {};

  if (isBlank(rule.filter)) {
    error.filter = t('errFilterRequired');
  } else if (!isValidRegex(rule.filter)) {
    error.filter = t('errFilterInvalid');
  }

  if (!validOperations.has(rule.operation)) {
    error.operation = t('errOperationInvalid');
  }

  if (isBlank(rule.field)) {
    error.field = t('errFieldRequired');
  }

  if (rule.operation !== HeaderOperation.REMOVE && isBlank(rule.value)) {
    error.value = t('errValueRequired');
  }

  if (rule.priority < 1) {
    error.priority = t('errPriorityTooLow');
  } else if (!Number.isSafeInteger(rule.priority)) {
    error.priority = t('errPriorityInvalid');
  }

  if (rule.applyOn.length === 0) {
    error.applyOn = t('errApplyOnRequired');
  } else if (rule.applyOn.some((type) => !validAppliesOn.has(type))) {
    error.applyOn = t('errApplyOnInvalid');
  }

  if (rule.resourceTypes.length === 0) {
    error.resourceTypes = t('errResourceTypesRequired');
  } else if (
    validResourceTypes.size > 0 &&
    rule.resourceTypes.some((type) => !validResourceTypes.has(type))
  ) {
    error.resourceTypes = t('errResourceTypesInvalid');
  }

  return error;
};

// Returns a map of rule index → error for every rule that failed validation.
export const validateRules = (
  rules: FilterRule[],
): Record<number, RuleError> => {
  const errors: Record<number, RuleError> = {};
  rules.forEach((rule, index) => {
    const error = validateRule(rule);
    if (Object.keys(error).length > 0) {
      errors[index] = error;
    }
  });
  return errors;
};
