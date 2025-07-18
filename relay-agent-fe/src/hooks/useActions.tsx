import { AutoCompleteAction } from '@/components/custom/Chat/AutoCompleteAction';
import { SelectAction } from '@/components/custom/Chat/SelectAction';
import { Input } from '@/components/main/Input';
import { DISPLAY_PROMPT_CONFIG } from '@/constants/actions';
import
  {
    ACTION_TYPES,
    COMPONENTS,
    IAction,
    INPUT_TYPES,
    IValidationResult
  } from '@/interfaces/actions.interface';
import { useCallback, useEffect, useState } from 'react';

type UseActionsProps = {
  action: IAction | null;
  onChange: (value: string) => void;
  inputValues: Record<string, string>;
  setInputValues: (values: Record<string, string>) => void;
};

export const useActions = ({ action, onChange, inputValues, setInputValues }: UseActionsProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset state when action changes
  useEffect(() => {
    setInputValues({});
    setErrors({});
  }, [action, setInputValues]);

  // Extract the base key and index from a placeholder
  const parsePlaceholder = useCallback(
    (placeholder: string): { baseKey: string; index: number } => {
      const withoutPrefix = placeholder.substring(1);
      const parts = withoutPrefix.split('_');

      if (parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))) {
        return {
          baseKey: parts.slice(0, parts.length - 1).join('_'),
          index: Number(parts[parts.length - 1]),
        };
      }

      return { baseKey: withoutPrefix, index: 0 };
    },
    [],
  );

  // Create a unique key for tracking input values and errors
  const createInputKey = useCallback(
    (placeholder: string, positionIndex: number): string => {
      const { baseKey, index } = parsePlaceholder(placeholder);
      return index > 0 ? `$${baseKey}_${index}` : `${placeholder}_${positionIndex}`;
    },
    [parsePlaceholder],
  );

  const validateField = useCallback(
    (key: string, value: string): IValidationResult => {
      const { baseKey } = parsePlaceholder(key);
      const config = DISPLAY_PROMPT_CONFIG[baseKey];

      if (!config?.validation) return { valid: true };
      const { validation } = config;

      // Required field validation
      if (validation.required && (!value || value.trim() === '')) {
        const message =
          typeof config.errorMessage === 'function'
            ? config.errorMessage(value)
            : config.errorMessage || `${baseKey} is required`;
        return { valid: false, message };
      }

      // Skip other validations if value is empty and not required
      if (!value || value.trim() === '') return { valid: true };

      // Pattern validation
      if (validation.pattern && !validation.pattern.test(value)) {
        const message =
          typeof config.errorMessage === 'function'
            ? config.errorMessage(value)
            : config.errorMessage || `Invalid ${baseKey} format`;
        return { valid: false, message };
      }

      // Length validation
      if (validation.minLength && value.length < validation.minLength) {
        return {
          valid: false,
          message: `${baseKey} must be at least ${validation.minLength} characters`,
        };
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        return {
          valid: false,
          message: `${baseKey} must be less than ${validation.maxLength} characters`,
        };
      }

      // Value range validation for numbers
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (validation.min !== undefined && numValue < validation.min) {
          return { valid: false, message: `${baseKey} must be at least ${validation.min}` };
        }
        if (validation.max !== undefined && numValue > validation.max) {
          return { valid: false, message: `${baseKey} must be less than ${validation.max}` };
        }
      }

      // Custom validator
      if (validation.customValidator) {
        const result = validation.customValidator(value);
        return typeof result === 'boolean'
          ? { valid: result, message: result ? undefined : `Invalid ${baseKey}` }
          : result;
      }

      return { valid: true };
    },
    [parsePlaceholder],
  );

  const handleInputChange = useCallback(
    (key: string, value: string) => {
      const validationResult = validateField(key, value);

      setErrors((prev) => ({
        ...prev,
        [key]: validationResult.valid ? '' : validationResult.message || `Invalid ${key}`,
      }));

      setInputValues({
        ...inputValues,
        [key]: value,
      });
    },
    [validateField, setInputValues, inputValues],
  );

  // Initialize default values for select components
  useEffect(() => {
    if (!action?.actionPrompt) return;

    const promptParts = action.actionPrompt.split(' ');
    const updatedValues = { ...inputValues };
    let hasUpdates = false;

    promptParts.forEach((part, positionIndex) => {
      if (!part.startsWith('$') || !Object.keys(DISPLAY_PROMPT_CONFIG).includes(part.substring(1)))
        return;

      const inputKey = createInputKey(part, positionIndex);
      const { baseKey } = parsePlaceholder(part);
      const config = DISPLAY_PROMPT_CONFIG[baseKey];

      if (!config) return;

      if (config.defaultValue && !inputValues[inputKey]) {
        updatedValues[inputKey] = config.defaultValue;
        hasUpdates = true;
      } else if (
        config.component === COMPONENTS.SELECT &&
        !inputValues[inputKey] &&
        config.options?.length &&
        config.options.length > 0
      ) {
        updatedValues[inputKey] = config.options[0].value;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setInputValues(updatedValues);
    }
  }, [action?.actionPrompt, inputValues, setInputValues, createInputKey, parsePlaceholder]);

  // Update the action prompt with input values
  useEffect(() => {
    if (!action?.actionPrompt) return;

    const promptParts = action.actionPrompt.split(' ');
    const updatedParts = [...promptParts];

    promptParts.forEach((part, positionIndex) => {
      if (!part.startsWith('$') || !Object.keys(DISPLAY_PROMPT_CONFIG).includes(part.substring(1)))
        return;

      const inputKey = createInputKey(part, positionIndex);
      const value = inputValues[inputKey]?.trim();

      if (value) {
        updatedParts[positionIndex] = value;
      }
    });

    onChange(updatedParts.join(' '));
  }, [inputValues, action?.actionPrompt, onChange, createInputKey]);

  const handleReset = useCallback(() => {
    setInputValues({});
    setErrors({});
  }, [setInputValues]);

  // Check if all fields are valid
  const areAllFieldsValid = useCallback((): boolean => {
    if (!action?.actionPrompt) return true;

    const promptParts = action.actionPrompt.split(' ');
    let allValid = true;
    let newErrors = { ...errors };
    let hasErrorChanges = false;

    promptParts.forEach((part, positionIndex) => {
      if (!part.startsWith('$') || !Object.keys(DISPLAY_PROMPT_CONFIG).includes(part.substring(1)))
        return;

      const inputKey = createInputKey(part, positionIndex);
      const { baseKey } = parsePlaceholder(part);
      const config = DISPLAY_PROMPT_CONFIG[baseKey];

      if (config?.validation?.required) {
        const value = inputValues[inputKey] || '';
        const validationResult = validateField(inputKey, value);

        if (!validationResult.valid) {
          allValid = false;
          newErrors[inputKey] = validationResult.message || `${baseKey} is required`;
          hasErrorChanges = true;
        }
      }
    });

    if (hasErrorChanges) {
      setErrors(newErrors);
    }

    return allValid;
  }, [action?.actionPrompt, inputValues, validateField, createInputKey, parsePlaceholder, errors]);

  const renderInput = useCallback(
    (placeholder: string, positionIndex: number) => {
      const { baseKey } = parsePlaceholder(placeholder);
      const config = DISPLAY_PROMPT_CONFIG[baseKey];
      if (!config) return null;

      const inputKey = createInputKey(placeholder, positionIndex);
      const error = errors[inputKey] || '';
      const currentActionType = action?.actionType;

      // Render appropriate component based on type
      switch (config.component) {
        case COMPONENTS.INPUT:
          return (
            <div className={config.wrapperClassName} key={positionIndex}>
              <Input
                type={config.type || INPUT_TYPES.TEXT}
                placeholder={config.placeholder || baseKey}
                value={inputValues[inputKey] || ''}
                onChange={(e) => {
                  if (config?.validation?.type === INPUT_TYPES.NUMBER) {
                    handleInputChange(inputKey, e.target.value.replace(/[^0-9.]/g, ''));
                  } else {
                    handleInputChange(inputKey, e.target.value);
                  }
                }}
                classes={config.inputClassName}
                error={error}
              />
            </div>
          );

        case COMPONENTS.SELECT:
          if (!config.options) return null;
          return (
            <SelectAction
              contextFilter={config.contextFilter}
              key={positionIndex}
              options={config.options}
              wrapperClassName={config.wrapperClassName || ''}
              value={
                inputValues[inputKey] ||
                config.defaultValue ||
                (config.options.length > 0 ? config.options[0].value : '')
              }
              onChange={(value: string) => handleInputChange(inputKey, value)}
              error={error}
              actionType={currentActionType as ACTION_TYPES}
            />
          );

        case COMPONENTS.AUTOCOMPLETE:
          if (!action) return null;
          return (
            <AutoCompleteAction
              key={positionIndex}
              config={config}
              currentActionType={currentActionType || ''}
              baseKey={baseKey}
              action={action}
              positionIndex={positionIndex}
              inputValues={inputValues}
              inputKey={inputKey}
              handleInputChange={handleInputChange}
              error={error}
              parsePlaceholder={parsePlaceholder}
            />
          );

        default:
          return null;
      }
    },
    [action, errors, inputValues, handleInputChange, parsePlaceholder, createInputKey],
  );

  return {
    inputValues,
    errors,
    handleInputChange,
    renderInput,
    handleReset,
    areAllFieldsValid,
  };
};
