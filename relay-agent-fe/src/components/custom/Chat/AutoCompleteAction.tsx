import { IAction, INPUT_TYPES, ACTION_TYPES, IPromptConfig } from '@/interfaces/actions.interface';
import { AutoComplete } from '@/components/main/AutoComplete';
import { useEmbeddedWallet } from '@/hooks';

interface AutoCompleteActionProps {
  config: IPromptConfig;
  currentActionType: string;
  baseKey: string;
  action: IAction;
  positionIndex: number;
  inputValues: Record<string, string>;
  inputKey: string;
  handleInputChange: (key: string, value: string) => void;
  error?: string;
  parsePlaceholder: (placeholder: string) => { baseKey: string; index: number };
}

export const AutoCompleteAction = ({
  config,
  currentActionType,
  baseKey,
  action,
  positionIndex,
  inputValues,
  inputKey,
  handleInputChange,
  error,
  parsePlaceholder,
}: AutoCompleteActionProps) => {
  const wallet = useEmbeddedWallet();
  // For Aptos, we use a default key since there's no chainId concept
  // TODO: Update this when Aptos-specific actions are implemented
  const aptosKey = 'aptos';
  let contextFilteredOptions = config.autoCompleteOptions?.[aptosKey] || [];

  if (config.contextFilter && config.contextFilter.length > 0 && config.autoCompleteOptions) {
    // Find matching context filter
    const matchingFilter = config.contextFilter.find(
      (filter) => filter.actionType === currentActionType,
    );

    if (matchingFilter?.validValues) {
      contextFilteredOptions = (config.autoCompleteOptions[aptosKey] || []).filter((option) =>
        matchingFilter.validValues?.includes(option.value),
      );
    }

    // Special handling for SWAP tokens (adapted for Aptos)
    if (currentActionType === ACTION_TYPES.SWAP && baseKey === 'TOKEN' && action?.actionPrompt) {
      const promptParts = action.actionPrompt.split(' ');
      const forIndex = promptParts.indexOf('for');

      if (forIndex > 0 && positionIndex === forIndex + 1) {
        const firstTokenKey = Object.keys(inputValues).find((key) => {
          const { baseKey: keyType } = parsePlaceholder(key);
          if (keyType === 'TOKEN') {
            const keyParts = key.split('_');
            const keyPosition = parseInt(keyParts[keyParts.length - 1]);
            return !isNaN(keyPosition) && keyPosition < forIndex;
          }
          return false;
        });

        const firstTokenValue = firstTokenKey ? inputValues[firstTokenKey] : null;

        if (firstTokenValue) {
          contextFilteredOptions = contextFilteredOptions.filter(
            (option) => option.value !== firstTokenValue,
          );
        }
      }
    }
  }
  return (
    <AutoComplete
      key={positionIndex}
      autoCompleteOptions={contextFilteredOptions || []}
      wrapperClassName={config.wrapperClassName || ''}
      value={inputValues[inputKey] || ''}
      onChange={(value) => handleInputChange(inputKey, value)}
      placeholder={config.placeholder || baseKey}
      inputClassName={config.inputClassName || ''}
      inputType={config.type || INPUT_TYPES.TEXT}
      maxOptions={config.maxOptions}
      filterOption={config.filterOption}
      formatOptionLabel={config.formatOptionLabel}
      error={error}
    />
  );
};
